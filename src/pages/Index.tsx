import { useState, useEffect } from "react";
import { Plus, Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsDialog from "@/components/SettingsDialog";
import { showSuccess } from "@/utils/toast";

interface Reading {
  id: string;
  type: "inr" | "bloodPressure";
  value?: number;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  date: string;
  timestamp: number;
}

interface Settings {
  targetINR: number;
}

const Index = () => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [settings, setSettings] = useState<Settings>({ targetINR: 2.5 });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [inrValue, setInrValue] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedReadings = localStorage.getItem("healthReadings");
    if (savedReadings) {
      setReadings(JSON.parse(savedReadings));
    }

    const savedSettings = localStorage.getItem("healthSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("healthReadings", JSON.stringify(readings));
  }, [readings]);

  useEffect(() => {
    localStorage.setItem("healthSettings", JSON.stringify(settings));
  }, [settings]);

  const addINRReading = () => {
    if (!inrValue) return;
    
    const reading = {
      id: Date.now().toString(),
      type: "inr" as const,
      value: parseFloat(inrValue),
      date: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    setReadings(prev => [...prev, reading]);
    setInrValue("");
    setShowAddDialog(false);
    showSuccess("INR reading added");
  };

  const addBPReading = () => {
    if (!systolic || !diastolic) return;
    
    const reading = {
      id: Date.now().toString(),
      type: "bloodPressure" as const,
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      pulse: pulse ? parseInt(pulse) : undefined,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    setReadings(prev => [...prev, reading]);
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setShowAddDialog(false);
    showSuccess("Blood pressure reading added");
  };

  const getLatestINR = () => {
    const inrReadings = readings.filter(r => r.type === "inr").sort((a, b) => b.timestamp - a.timestamp);
    return inrReadings[0];
  };

  const getLatestBP = () => {
    const bpReadings = readings.filter(r => r.type === "bloodPressure").sort((a, b) => b.timestamp - a.timestamp);
    return bpReadings[0];
  };

  const getINRStatus = (value: number) => {
    const { targetINR } = settings;
    const difference = Math.abs(value - targetINR);
    
    if (difference <= 0.2) return "normal";
    if (difference <= 0.4) return "warning";
    return "critical";
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return "critical";
    if (systolic >= 130 || diastolic >= 80) return "warning";
    return "normal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "text-green-400";
      case "warning": return "text-yellow-400";
      case "critical": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
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

  const handleTargetINRChange = (target: number) => {
    setSettings(prev => ({ ...prev, targetINR: target }));
  };

  const getINRStatusText = (value: number) => {
    const status = getINRStatus(value);
    const { targetINR } = settings;
    const difference = value - targetINR;
    
    if (status === "normal") return "On Target";
    if (difference > 0) return "High";
    return "Low";
  };

  const latestINR = getLatestINR();
  const latestBP = getLatestBP();
  const sortedReadings = [...readings].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-sm">📊</span>
              </div>
              <span className="text-white/80 text-sm font-medium">Health Tracker</span>
            </div>
            <div className="flex items-center space-x-3">
              <SettingsDialog 
                targetINR={settings.targetINR}
                onTargetINRChange={handleTargetINRChange}
              />
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Reading
              </Button>
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-light text-white mb-4">Health</h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Track your INR and blood pressure readings. Monitor your health with precision and stay on target.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Current Readings Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* INR Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-medium">INR</h3>
              {latestINR && (
                <span className={`text-sm font-medium px-3 py-1 rounded-full bg-white/10 ${getStatusColor(getINRStatus(latestINR.value!))}`}>
                  {getINRStatusText(latestINR.value!)}
                </span>
              )}
            </div>
            
            <div className="text-center">
              {latestINR ? (
                <>
                  <div className="text-6xl font-light text-white mb-2">{latestINR.value}</div>
                  <div className="text-white/60 text-sm mb-4">Target: {settings.targetINR}</div>
                  <div className="text-white/50 text-sm">{formatDate(latestINR.date)} at {formatTime(latestINR.date)}</div>
                </>
              ) : (
                <div className="py-12">
                  <div className="text-white/40 text-lg mb-2">No readings yet</div>
                  <div className="text-white/30 text-sm">Add your first INR reading</div>
                </div>
              )}
            </div>
          </div>

          {/* Blood Pressure Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-medium">Blood Pressure</h3>
              {latestBP && (
                <span className={`text-sm font-medium px-3 py-1 rounded-full bg-white/10 ${getStatusColor(getBPStatus(latestBP.systolic!, latestBP.diastolic!))}`}>
                  {getBPStatus(latestBP.systolic!, latestBP.diastolic!) === "normal" ? "Normal" : 
                   getBPStatus(latestBP.systolic!, latestBP.diastolic!) === "warning" ? "Elevated" : "High"}
                </span>
              )}
            </div>
            
            <div className="text-center">
              {latestBP ? (
                <>
                  <div className="text-6xl font-light text-white mb-2">{latestBP.systolic}/{latestBP.diastolic}</div>
                  <div className="text-white/60 text-sm mb-4">
                    mmHg {latestBP.pulse && `• ♥ ${latestBP.pulse} bpm`}
                  </div>
                  <div className="text-white/50 text-sm">{formatDate(latestBP.date)} at {formatTime(latestBP.date)}</div>
                </>
              ) : (
                <div className="py-12">
                  <div className="text-white/40 text-lg mb-2">No readings yet</div>
                  <div className="text-white/30 text-sm">Add your first BP reading</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Readings */}
        {sortedReadings.length > 0 && (
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-white text-xl font-medium">Recent Readings</h3>
            </div>
            <div className="divide-y divide-white/10">
              {sortedReadings.slice(0, 8).map((reading) => (
                <div key={reading.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {reading.type === "inr" ? (
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-blue-400 text-sm font-medium">INR</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="text-white text-lg font-medium">{reading.value}</span>
                              <span className={`text-sm ${getStatusColor(getINRStatus(reading.value!))}`}>
                                {getINRStatusText(reading.value!)}
                              </span>
                            </div>
                            <div className="text-white/50 text-sm">
                              {formatDate(reading.date)} at {formatTime(reading.date)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-red-400 text-sm font-medium">BP</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="text-white text-lg font-medium">{reading.systolic}/{reading.diastolic}</span>
                              <span className={`text-sm ${getStatusColor(getBPStatus(reading.systolic!, reading.diastolic!))}`}>
                                {getBPStatus(reading.systolic!, reading.diastolic!) === "normal" ? "Normal" : 
                                 getBPStatus(reading.systolic!, reading.diastolic!) === "warning" ? "Elevated" : "High"}
                              </span>
                              {reading.pulse && (
                                <span className="text-white/50 text-sm">♥ {reading.pulse}</span>
                              )}
                            </div>
                            <div className="text-white/50 text-sm">
                              {formatDate(reading.date)} at {formatTime(reading.date)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Reading Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold">Add Reading</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="inr" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700">
              <TabsTrigger value="inr" className="text-sm data-[state=active]:bg-slate-600 data-[state=active]:text-white">INR</TabsTrigger>
              <TabsTrigger value="bp" className="text-sm data-[state=active]:bg-slate-600 data-[state=active]:text-white">Blood Pressure</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inr" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="inr" className="text-sm font-medium text-white">INR Value</Label>
                <Input
                  id="inr"
                  type="number"
                  step="0.1"
                  placeholder="2.5"
                  value={inrValue}
                  onChange={(e) => setInrValue(e.target.value)}
                  className="text-base bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-400">
                  Target: {settings.targetINR}
                </p>
              </div>
              <Button onClick={addINRReading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Add INR Reading
              </Button>
            </TabsContent>
            
            <TabsContent value="bp" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systolic" className="text-sm font-medium text-white">Systolic</Label>
                  <Input
                    id="systolic"
                    type="number"
                    placeholder="120"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="text-base bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic" className="text-sm font-medium text-white">Diastolic</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    placeholder="80"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="text-base bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pulse" className="text-sm font-medium text-white">Pulse (optional)</Label>
                <Input
                  id="pulse"
                  type="number"
                  placeholder="72"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="text-base bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button onClick={addBPReading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Add Blood Pressure Reading
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;