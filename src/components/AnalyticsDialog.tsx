import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Target, Calendar } from "lucide-react";

interface AnalyticsDialogProps {
  readings: any[];
  settings: any;
}

const AnalyticsDialog = ({ readings, settings }: AnalyticsDialogProps) => {
  const [open, setOpen] = useState(false);

  const inrReadings = readings.filter(r => r.type === "inr").sort((a, b) => a.timestamp - b.timestamp);
  const bpReadings = readings.filter(r => r.type === "bloodPressure").sort((a, b) => a.timestamp - b.timestamp);

  const getINRAnalytics = () => {
    if (inrReadings.length === 0) return null;

    const values = inrReadings.map(r => r.value);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const inRange = inrReadings.filter(r => Math.abs(r.value - settings.targetINR) <= 0.2).length;
    const inRangePercent = Math.round((inRange / inrReadings.length) * 100);
    
    const last30Days = inrReadings.filter(r => {
      const readingDate = new Date(r.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return readingDate >= thirtyDaysAgo;
    });

    const recentInRange = last30Days.filter(r => Math.abs(r.value - settings.targetINR) <= 0.2).length;
    const recentInRangePercent = last30Days.length > 0 ? Math.round((recentInRange / last30Days.length) * 100) : 0;

    return {
      total: inrReadings.length,
      average: avg.toFixed(1),
      min: min.toFixed(1),
      max: max.toFixed(1),
      inRange,
      inRangePercent,
      last30Days: last30Days.length,
      recentInRangePercent
    };
  };

  const getBPAnalytics = () => {
    if (bpReadings.length === 0) return null;

    const systolicValues = bpReadings.map(r => r.systolic);
    const diastolicValues = bpReadings.map(r => r.diastolic);
    
    const avgSystolic = Math.round(systolicValues.reduce((sum, val) => sum + val, 0) / systolicValues.length);
    const avgDiastolic = Math.round(diastolicValues.reduce((sum, val) => sum + val, 0) / diastolicValues.length);
    
    const normal = bpReadings.filter(r => r.systolic < 130 && r.diastolic < 80).length;
    const elevated = bpReadings.filter(r => (r.systolic >= 130 && r.systolic < 140) || (r.diastolic >= 80 && r.diastolic < 90)).length;
    const high = bpReadings.filter(r => r.systolic >= 140 || r.diastolic >= 90).length;

    return {
      total: bpReadings.length,
      avgSystolic,
      avgDiastolic,
      normal,
      elevated,
      high,
      normalPercent: Math.round((normal / bpReadings.length) * 100)
    };
  };

  const getTimeInRange = () => {
    if (inrReadings.length < 2) return null;

    const sortedReadings = [...inrReadings].sort((a, b) => a.timestamp - b.timestamp);
    let timeInRange = 0;
    let totalTime = 0;

    for (let i = 0; i < sortedReadings.length - 1; i++) {
      const current = sortedReadings[i];
      const next = sortedReadings[i + 1];
      const timeDiff = next.timestamp - current.timestamp;
      
      totalTime += timeDiff;
      
      if (Math.abs(current.value - settings.targetINR) <= 0.2) {
        timeInRange += timeDiff;
      }
    }

    return Math.round((timeInRange / totalTime) * 100);
  };

  const inrAnalytics = getINRAnalytics();
  const bpAnalytics = getBPAnalytics();
  const timeInRangePercent = getTimeInRange();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
          <BarChart3 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">Analytics</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="inr" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="inr" className="text-sm data-[state=active]:bg-slate-600 data-[state=active]:text-white">INR Analytics</TabsTrigger>
            <TabsTrigger value="bp" className="text-sm data-[state=active]:bg-slate-600 data-[state=active]:text-white">Blood Pressure</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inr" className="space-y-6 mt-6">
            {inrAnalytics ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-white/80 text-sm">In Target Range</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{inrAnalytics.inRangePercent}%</div>
                    <div className="text-xs text-white/60">{inrAnalytics.inRange}/{inrAnalytics.total} readings</div>
                  </div>
                  
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-white/80 text-sm">Last 30 Days</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{inrAnalytics.recentInRangePercent}%</div>
                    <div className="text-xs text-white/60">{inrAnalytics.last30Days} readings</div>
                  </div>
                </div>

                {timeInRangePercent !== null && (
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <span className="text-white/80 text-sm">Time in Therapeutic Range</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{timeInRangePercent}%</div>
                    <div className="text-xs text-white/60">Estimated time spent in target range</div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-white font-medium">Statistics</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-white">{inrAnalytics.average}</div>
                      <div className="text-xs text-white/60">Average</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{inrAnalytics.min}</div>
                      <div className="text-xs text-white/60">Minimum</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{inrAnalytics.max}</div>
                      <div className="text-xs text-white/60">Maximum</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">No INR data available</p>
                <p className="text-white/40 text-sm mt-1">Add some INR readings to see analytics</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bp" className="space-y-6 mt-6">
            {bpAnalytics ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-500/20 rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-green-400">{bpAnalytics.normal}</div>
                    <div className="text-xs text-white/60">Normal</div>
                  </div>
                  <div className="bg-yellow-500/20 rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-yellow-400">{bpAnalytics.elevated}</div>
                    <div className="text-xs text-white/60">Elevated</div>
                  </div>
                  <div className="bg-red-500/20 rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-red-400">{bpAnalytics.high}</div>
                    <div className="text-xs text-white/60">High</div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4">
                  <div className="text-white/80 text-sm mb-2">Normal Blood Pressure</div>
                  <div className="text-2xl font-bold text-white">{bpAnalytics.normalPercent}%</div>
                  <div className="text-xs text-white/60">of all readings</div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white font-medium">Average Readings</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-white">{bpAnalytics.avgSystolic}</div>
                      <div className="text-xs text-white/60">Systolic (mmHg)</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{bpAnalytics.avgDiastolic}</div>
                      <div className="text-xs text-white/60">Diastolic (mmHg)</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">No blood pressure data available</p>
                <p className="text-white/40 text-sm mt-1">Add some BP readings to see analytics</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsDialog;