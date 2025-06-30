import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Mail, Copy } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface ExportDialogProps {
  readings: any[];
  settings: any;
}

const ExportDialog = ({ readings, settings }: ExportDialogProps) => {
  const [open, setOpen] = useState(false);

  const generateCSV = () => {
    const headers = ["Date", "Time", "Type", "Value", "Systolic", "Diastolic", "Pulse", "Status"];
    const csvData = readings.map(reading => {
      const date = new Date(reading.date);
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      
      if (reading.type === "inr") {
        const status = getINRStatus(reading.value);
        return [dateStr, timeStr, "INR", reading.value, "", "", "", status];
      } else {
        const status = getBPStatus(reading.systolic, reading.diastolic);
        return [dateStr, timeStr, "Blood Pressure", "", reading.systolic, reading.diastolic, reading.pulse || "", status];
      }
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    return csvContent;
  };

  const getINRStatus = (value: number) => {
    const difference = Math.abs(value - settings.targetINR);
    if (difference <= 0.2) return "On Target";
    if (difference <= 0.4) return value > settings.targetINR ? "High" : "Low";
    return "Critical";
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return "High";
    if (systolic >= 130 || diastolic >= 80) return "Elevated";
    return "Normal";
  };

  const downloadCSV = () => {
    try {
      const csvContent = generateCSV();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `health-readings-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess("CSV file downloaded");
      setOpen(false);
    } catch (error) {
      showError("Failed to download CSV");
    }
  };

  const copyToClipboard = () => {
    try {
      const csvContent = generateCSV();
      navigator.clipboard.writeText(csvContent);
      showSuccess("Data copied to clipboard");
      setOpen(false);
    } catch (error) {
      showError("Failed to copy data");
    }
  };

  const generateReport = () => {
    const inrReadings = readings.filter(r => r.type === "inr");
    const bpReadings = readings.filter(r => r.type === "bloodPressure");
    
    const inrInRange = inrReadings.filter(r => Math.abs(r.value - settings.targetINR) <= 0.2).length;
    const avgINR = inrReadings.length > 0 ? (inrReadings.reduce((sum, r) => sum + r.value, 0) / inrReadings.length).toFixed(1) : "N/A";
    
    const avgSystolic = bpReadings.length > 0 ? Math.round(bpReadings.reduce((sum, r) => sum + r.systolic, 0) / bpReadings.length) : "N/A";
    const avgDiastolic = bpReadings.length > 0 ? Math.round(bpReadings.reduce((sum, r) => sum + r.diastolic, 0) / bpReadings.length) : "N/A";

    const report = `
HEALTH TRACKER REPORT
Generated: ${new Date().toLocaleDateString()}

SETTINGS:
Target INR: ${settings.targetINR}

INR SUMMARY:
Total Readings: ${inrReadings.length}
Average INR: ${avgINR}
In Target Range: ${inrInRange}/${inrReadings.length} (${inrReadings.length > 0 ? Math.round((inrInRange / inrReadings.length) * 100) : 0}%)

BLOOD PRESSURE SUMMARY:
Total Readings: ${bpReadings.length}
Average: ${avgSystolic}/${avgDiastolic} mmHg

RECENT READINGS:
${readings.slice(0, 10).map(r => {
  const date = new Date(r.date).toLocaleDateString();
  if (r.type === "inr") {
    return `${date}: INR ${r.value} (${getINRStatus(r.value)})`;
  } else {
    return `${date}: BP ${r.systolic}/${r.diastolic} mmHg (${getBPStatus(r.systolic, r.diastolic)})`;
  }
}).join('\n')}
    `.trim();

    return report;
  };

  const copyReport = () => {
    try {
      const report = generateReport();
      navigator.clipboard.writeText(report);
      showSuccess("Report copied to clipboard");
      setOpen(false);
    } catch (error) {
      showError("Failed to copy report");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
          <Download className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">Export Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Export Options</h4>
            
            <Button 
              onClick={downloadCSV}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
              disabled={readings.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              Download CSV File
            </Button>
            
            <Button 
              onClick={copyToClipboard}
              variant="outline"
              className="w-full justify-start border-slate-600 text-white hover:bg-slate-700"
              disabled={readings.length === 0}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Data to Clipboard
            </Button>
            
            <Button 
              onClick={copyReport}
              variant="outline"
              className="w-full justify-start border-slate-600 text-white hover:bg-slate-700"
              disabled={readings.length === 0}
            >
              <FileText className="w-4 h-4 mr-2" />
              Copy Summary Report
            </Button>
          </div>
          
          {readings.length === 0 && (
            <p className="text-xs text-slate-400 text-center">
              No data to export. Add some readings first.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;