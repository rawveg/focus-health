import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit3, Save, X } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface ReadingDetailDialogProps {
  reading: any;
  open: boolean;
  onClose: () => void;
  onUpdate: (updatedReading: any) => void;
  onDelete: (readingId: string) => void;
  settings: any;
}

const ReadingDetailDialog = ({ 
  reading, 
  open, 
  onClose, 
  onUpdate, 
  onDelete, 
  settings 
}: ReadingDetailDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    value: reading?.value?.toString() || "",
    systolic: reading?.systolic?.toString() || "",
    diastolic: reading?.diastolic?.toString() || "",
    pulse: reading?.pulse?.toString() || ""
  });

  if (!reading) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const getINRStatus = (value: number) => {
    const difference = Math.abs(value - settings.targetINR);
    if (difference <= 0.2) return { status: "On Target", color: "text-green-400" };
    if (difference <= 0.4) return { 
      status: value > settings.targetINR ? "High" : "Low", 
      color: "text-yellow-400" 
    };
    return { status: "Critical", color: "text-red-400" };
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return { status: "High", color: "text-red-400" };
    if (systolic >= 130 || diastolic >= 80) return { status: "Elevated", color: "text-yellow-400" };
    return { status: "Normal", color: "text-green-400" };
  };

  const handleSave = () => {
    try {
      let updatedReading;
      
      if (reading.type === "inr") {
        const value = parseFloat(editValues.value);
        if (!value || value <= 0) {
          showError("Please enter a valid INR value");
          return;
        }
        updatedReading = { ...reading, value };
      } else {
        const systolic = parseInt(editValues.systolic);
        const diastolic = parseInt(editValues.diastolic);
        const pulse = editValues.pulse ? parseInt(editValues.pulse) : undefined;
        
        if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
          showError("Please enter valid blood pressure values");
          return;
        }
        
        updatedReading = { ...reading, systolic, diastolic, pulse };
      }
      
      onUpdate(updatedReading);
      setIsEditing(false);
      showSuccess("Reading updated successfully");
    } catch (error) {
      showError("Failed to update reading");
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this reading?")) {
      onDelete(reading.id);
      onClose();
      showSuccess("Reading deleted successfully");
    }
  };

  const status = reading.type === "inr" 
    ? getINRStatus(reading.value)
    : getBPStatus(reading.systolic, reading.diastolic);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white flex items-center justify-between">
            Reading Details
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Date and Time */}
          <div className="text-center">
            <div className="text-white text-lg font-medium">{formatDate(reading.date)}</div>
            <div className="text-white/60 text-sm">{formatTime(reading.date)}</div>
          </div>

          {/* Reading Values */}
          <div className="bg-slate-700/50 rounded-xl p-4">
            {reading.type === "inr" ? (
              <div className="text-center">
                <div className="text-white/80 text-sm mb-2">INR</div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={editValues.value}
                      onChange={(e) => setEditValues(prev => ({ ...prev, value: e.target.value }))}
                      className="text-center text-2xl font-light bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-light text-white mb-2">{reading.value}</div>
                    <div className="text-white/60 text-sm">Target: {settings.targetINR}</div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-white/80 text-sm mb-2">Blood Pressure</div>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/60 text-xs">Systolic</Label>
                        <Input
                          type="number"
                          value={editValues.systolic}
                          onChange={(e) => setEditValues(prev => ({ ...prev, systolic: e.target.value }))}
                          className="text-center bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white/60 text-xs">Diastolic</Label>
                        <Input
                          type="number"
                          value={editValues.diastolic}
                          onChange={(e) => setEditValues(prev => ({ ...prev, diastolic: e.target.value }))}
                          className="text-center bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/60 text-xs">Pulse (optional)</Label>
                      <Input
                        type="number"
                        value={editValues.pulse}
                        onChange={(e) => setEditValues(prev => ({ ...prev, pulse: e.target.value }))}
                        className="text-center bg-slate-600 border-slate-500 text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl font-light text-white mb-2">
                      {reading.systolic}/{reading.diastolic}
                    </div>
                    <div className="text-white/60 text-sm">
                      mmHg {reading.pulse && `• ♥ ${reading.pulse} bpm`}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          {!isEditing && (
            <div className="text-center">
              <span className={`text-lg font-medium ${status.color}`}>
                {status.status}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReadingDetailDialog;