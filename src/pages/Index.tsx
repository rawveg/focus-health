import { useState, useEffect } from "react";
import { Plus, Activity, Heart, BarChart3, List, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SettingsDialog from "@/components/SettingsDialog";
import StatCard from "@/components/StatCard";
import ReadingItem from "@/components/ReadingItem";
import ExportDialog from "@/components/ExportDialog";
import ReadingDetailDialog from "@/components/ReadingDetailDialog";
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
  const [activeTab, setActiveTab] = useState("inr");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [settings, setSettings] = useState<Settings>({ targetINR: 2.5 });
  const [showINRDialog, setShowINRDialog] = useState(false);
  const [showBPDialog, setShowBPDialog] = useState(false);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [inrValue, setInrValue] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedReadings = localStorage.getItem("healthReadings");
    if (savedReadings) {
      try {
        setReadings(JSON.parse(savedReadings));
      } catch (error) {
        console.error("Error loading readings:", error);
      }
    }

    const savedSettings = localStorage.getItem("healthSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }

    const savedTab = localStorage.getItem("healthActiveTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("healthReadings", JSON.stringify(readings));
  }, [readings]);

  useEffect(() => {
    localStorage.setItem("healthSettings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("healthActiveTab", activeTab);
  }, [activeTab]);

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
    setShowINRDialog(false);
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
    setShowBPDialog(false);
    showSuccess("Blood pressure reading added");
  };

  const updateReading = (updatedReading: Reading) => {
    setReadings(prev => prev.map(r => r.id === updatedReading.id ? updatedReading : r));
  };

  const deleteReading = (readingId: string) => {
    setReadings(prev => prev.filter(r => r.id !== readingId));
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
    return "contact";
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return "contact";
    if (systolic >= 130 || diastolic >= 80) return "warning";
    return "normal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "text-green-400";
      case "warning": return "text-yellow-400";
      case "contact": return "text-orange-400";
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
    if (status === "contact") return "Contact Clinic";
    if (difference > 0) return "High";
    return "Low";
  };

  const getBPStatusText = (systolic: number, diastolic: number) => {
    const status = getBPStatus(systolic, diastolic);
    
    if (status === "normal") return "Normal";
    if (status === "contact") return "Contact Doctor";
    return "Elevated";
  };

  const handleReadingClick = (reading: Reading) => {
    setSelectedReading(reading);
    setShowDetailDialog(true);
  };

  const latestINR = getLatestINR();
  const latestBP = getLatestBP();
  const inrReadings = readings.filter(r => r.type === "inr").sort((a, b) => b.timestamp - a.timestamp);
  const bpReadings = readings.filter(r => r.type === "bloodPressure").sort((a, b) => b.timestamp - a.timestamp);
  const sortedReadings = [...readings].sort((a, b) => b.timestamp - a.timestamp);

  const tabs = [
    { id: "inr", label: "INR", icon: Activity },
    { id: "bp", label: "Blood Pressure", icon: Heart },
    { id: "stats", label: "Analytics", icon: BarChart3 },
    { id: "readings", label: "All Readings", icon: List }
  ];

  // Analytics calculations
  const getINRAnalytics = () => {
    if (inrReadings.length === 0) return null;

    const values = inrReadings.map(r => r.value!);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const inRange = inrReadings.filter(r => Math.abs(r.value! - settings.targetINR) <= 0.2).length;
    const inRangePercent = Math.round((inRange / inrReadings.length) * 100);
    
    const last30Days = inrReadings.filter(r => {
      const readingDate = new Date(r.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return readingDate >= thirtyDaysAgo;
    });

    const recentInRange = last30Days.filter(r => Math.abs(r.value! - settings.targetINR) <= 0.2).length;
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

    const systolicValues = bpReadings.map(r => r.systolic!);
    const diastolicValues = bpReadings.map(r => r.diastolic!);
    
    const avgSystolic = Math.round(systolicValues.reduce((sum, val) => sum + val, 0) / systolicValues.length);
    const avgDiastolic = Math.round(diastolicValues.reduce((sum, val) => sum + val, 0) / diastolicValues.length);
    
    const normal = bpReadings.filter(r => r.systolic! < 130 && r.diastolic! < 80).length;
    const elevated = bpReadings.filter(r => (r.systolic! >= 130 && r.systolic! < 140) || (r.diastolic! >= 80 && r.diastolic! < 90)).length;
    const high = bpReadings.filter(r => r.systolic! >= 140 || r.diastolic! >= 90).length;

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

  const inrAnalytics = getINRAnalytics();
  const bpAnalytics = getBPAnalytics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-end mb-8">
            <div className="flex items-center space-x-3">
              <ExportDialog readings={readings} settings={settings} />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => window.open('https://github.com/rawveg/focus-health', '_blank')}
              >
                <Github className="w-4 h-4" />
              </Button>
              <SettingsDialog 
                targetINR={settings.targetINR}
                onTargetINRChange={handleTargetINRChange}
              />
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-light text-white mb-4">Focus Health</h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Track your INR and blood pressure readings. Monitor your health with precision and stay on target.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 pb-20 flex-1">
        {/* INR Tab */}
        {activeTab === "inr" && (
          <div className="space-y-8">
            <StatCard
              title="Current INR"
              value={latestINR?.value || ""}
              subtitle={latestINR ? `Recorded ${formatDate(latestINR.date)} at ${formatTime(latestINR.date)}` : `Target: ${settings.targetINR}`}
              status={latestINR ? getINRStatusText(latestINR.value!) : undefined}
              statusColor={latestINR ? getStatusColor(getINRStatus(latestINR.value!)) : undefined}
              icon={<Activity className="w-5 h-5 text-blue-400" />}
              isEmpty={!latestINR}
              emptyTitle="No INR readings yet"
              emptySubtitle="Add your first INR reading below"
            />

            <div className="text-center">
              <Dialog open={showINRDialog} onOpenChange={setShowINRDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add INR Reading
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white text-lg font-semibold">Add INR Reading</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-6">
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
                      Add Reading
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Recent INR Readings */}
            {inrReadings.length > 0 && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-white text-xl font-medium">Recent INR Readings</h3>
                </div>
                <div className="divide-y divide-white/10">
                  {inrReadings.slice(0, 10).map((reading) => (
                    <ReadingItem
                      key={reading.id}
                      type={reading.type}
                      value={reading.value!.toString()}
                      status={getINRStatusText(reading.value!)}
                      statusColor={getStatusColor(getINRStatus(reading.value!))}
                      date={formatDate(reading.date)}
                      time={formatTime(reading.date)}
                      onClick={() => handleReadingClick(reading)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blood Pressure Tab */}
        {activeTab === "bp" && (
          <div className="space-y-8">
            <StatCard
              title="Current Blood Pressure"
              value={latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : ""}
              subtitle={latestBP ? `mmHg • Recorded ${formatDate(latestBP.date)} at ${formatTime(latestBP.date)}${latestBP.pulse ? ` • ♥ ${latestBP.pulse} bpm` : ""}` : undefined}
              status={latestBP ? getBPStatusText(latestBP.systolic!, latestBP.diastolic!) : undefined}
              statusColor={latestBP ? getStatusColor(getBPStatus(latestBP.systolic!, latestBP.diastolic!)) : undefined}
              icon={<Heart className="w-5 h-5 text-red-400" />}
              isEmpty={!latestBP}
              emptyTitle="No BP readings yet"
              emptySubtitle="Add your first blood pressure reading below"
            />

            <div className="text-center">
              <Dialog open={showBPDialog} onOpenChange={setShowBPDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add BP Reading
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white text-lg font-semibold">Add Blood Pressure Reading</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-6">
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
                    <Button onClick={addBPReading} className="w-full bg-red-600 hover:bg-red-700 text-white">
                      Add Reading
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Recent BP Readings */}
            {bpReadings.length > 0 && (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-white text-xl font-medium">Recent Blood Pressure Readings</h3>
                </div>
                <div className="divide-y divide-white/10">
                  {bpReadings.slice(0, 10).map((reading) => (
                    <ReadingItem
                      key={reading.id}
                      type={reading.type}
                      value={`${reading.systolic}/${reading.diastolic}`}
                      status={getBPStatusText(reading.systolic!, reading.diastolic!)}
                      statusColor={getStatusColor(getBPStatus(reading.systolic!, reading.diastolic!))}
                      date={formatDate(reading.date)}
                      time={formatTime(reading.date)}
                      pulse={reading.pulse}
                      onClick={() => handleReadingClick(reading)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "stats" && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* INR Analytics */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-white/10 p-6">
                <h3 className="text-white text-xl font-medium mb-6 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span>INR Analytics</span>
                </h3>
                
                {inrAnalytics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">{inrAnalytics.inRangePercent}%</div>
                        <div className="text-xs text-white/60">In Target Range</div>
                        <div className="text-xs text-white/40">{inrAnalytics.inRange}/{inrAnalytics.total} readings</div>
                      </div>
                      <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">{inrAnalytics.recentInRangePercent}%</div>
                        <div className="text-xs text-white/60">Last 30 Days</div>
                        <div className="text-xs text-white/40">{inrAnalytics.last30Days} readings</div>
                      </div>
                    </div>
                    
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
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60">No INR data available</p>
                    <p className="text-white/40 text-sm mt-1">Add some INR readings to see analytics</p>
                  </div>
                )}
              </div>

              {/* BP Analytics */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-white/10 p-6">
                <h3 className="text-white text-xl font-medium mb-6 flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span>BP Analytics</span>
                </h3>
                
                {bpAnalytics ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-500/20 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-green-400">{bpAnalytics.normal}</div>
                        <div className="text-xs text-white/60">Normal</div>
                      </div>
                      <div className="bg-yellow-500/20 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-yellow-400">{bpAnalytics.elevated}</div>
                        <div className="text-xs text-white/60">Elevated</div>
                      </div>
                      <div className="bg-orange-500/20 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-orange-400">{bpAnalytics.high}</div>
                        <div className="text-xs text-white/60">Contact Doctor</div>
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-white">{bpAnalytics.normalPercent}%</div>
                      <div className="text-xs text-white/60">Normal Blood Pressure</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-white">{bpAnalytics.avgSystolic}</div>
                        <div className="text-xs text-white/60">Avg Systolic</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">{bpAnalytics.avgDiastolic}</div>
                        <div className="text-xs text-white/60">Avg Diastolic</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60">No BP data available</p>
                    <p className="text-white/40 text-sm mt-1">Add some BP readings to see analytics</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Readings Tab */}
        {activeTab === "readings" && (
          <div className="space-y-8">
            {sortedReadings.length > 0 ? (
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-white text-xl font-medium">All Readings ({sortedReadings.length})</h3>
                </div>
                <div className="divide-y divide-white/10">
                  {sortedReadings.map((reading) => (
                    <ReadingItem
                      key={reading.id}
                      type={reading.type}
                      value={reading.type === "inr" ? reading.value!.toString() : `${reading.systolic}/${reading.diastolic}`}
                      status={reading.type === "inr" ? getINRStatusText(reading.value!) : getBPStatusText(reading.systolic!, reading.diastolic!)}
                      statusColor={reading.type === "inr" ? getStatusColor(getINRStatus(reading.value!)) : 
                                  getStatusColor(getBPStatus(reading.systolic!, reading.diastolic!))}
                      date={formatDate(reading.date)}
                      time={formatTime(reading.date)}
                      pulse={reading.pulse}
                      onClick={() => handleReadingClick(reading)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-white/40 text-xl mb-4">No readings yet</div>
                <div className="text-white/30 text-sm mb-8">Start by adding your first reading in the INR or Blood Pressure tabs</div>
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={() => setActiveTab("inr")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Add INR Reading
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("bp")}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Add BP Reading
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-white/10 py-8 mt-auto">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-white/60 text-sm mb-2">
            <a 
              href="https://www.gnu.org/licenses/agpl-3.0.en.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white/80 transition-colors"
            >
              Licensed under the GNU Affero General Public License v3.0
            </a>
            <span className="mx-2">•</span>
            <a 
              href="https://github.com/rawveg/focus-health/blob/main/LICENSE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white/80 transition-colors"
            >
              View License
            </a>
          </div>
          <div className="text-white/40 text-sm">
            © 2025 Tim Green. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Reading Detail Dialog */}
      <ReadingDetailDialog
        reading={selectedReading}
        open={showDetailDialog}
        onClose={() => {
          setShowDetailDialog(false);
          setSelectedReading(null);
        }}
        onUpdate={updateReading}
        onDelete={deleteReading}
        settings={settings}
      />
    </div>
  );
};

export default Index;