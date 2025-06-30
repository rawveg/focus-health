import { useState, useEffect } from "react";
import { Heart, Activity, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const Index = () => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [inrValue, setInrValue] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");

  // Load readings from localStorage on component mount
  useEffect(() => {
    const savedReadings = localStorage.getItem("healthReadings");
    if (savedReadings) {
      setReadings(JSON.parse(savedReadings));
    }
  }, []);

  // Save readings to localStorage whenever readings change
  useEffect(() => {
    localStorage.setItem("healthReadings", JSON.stringify(readings));
  }, [readings]);

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
    if (value < 1.5 || value > 4.0) return "critical";
    if (value < 2.0 || value > 3.0) return "warning";
    return "normal";
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return "critical";
    if (systolic >= 130 || diastolic >= 80) return "warning";
    return "normal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "text-green-600";
      case "warning": return "text-orange-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const latestINR = getLatestINR();
  const latestBP = getLatestBP();
  const sortedReadings = [...readings].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-sm mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-black">Health</h1>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-blue-500 font-medium">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Add Reading</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="inr" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                    <TabsTrigger value="inr" className="text-sm">INR</TabsTrigger>
                    <TabsTrigger value="bp" className="text-sm">Blood Pressure</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="inr" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="inr" className="text-sm font-medium">INR Value</Label>
                      <Input
                        id="inr"
                        type="number"
                        step="0.1"
                        placeholder="2.5"
                        value={inrValue}
                        onChange={(e) => setInrValue(e.target.value)}
                        className="text-base"
                      />
                    </div>
                    <Button onClick={addINRReading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                      Add INR Reading
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="bp" className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="systolic" className="text-sm font-medium">Systolic</Label>
                        <Input
                          id="systolic"
                          type="number"
                          placeholder="120"
                          value={systolic}
                          onChange={(e) => setSystolic(e.target.value)}
                          className="text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="diastolic" className="text-sm font-medium">Diastolic</Label>
                        <Input
                          id="diastolic"
                          type="number"
                          placeholder="80"
                          value={diastolic}
                          onChange={(e) => setDiastolic(e.target.value)}
                          className="text-base"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pulse" className="text-sm font-medium">Pulse (optional)</Label>
                      <Input
                        id="pulse"
                        type="number"
                        placeholder="72"
                        value={pulse}
                        onChange={(e) => setPulse(e.target.value)}
                        className="text-base"
                      />
                    </div>
                    <Button onClick={addBPReading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                      Add Blood Pressure Reading
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto">
        {/* Summary Section */}
        <div className="bg-white mt-4 mx-4 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-black">Summary</h2>
          </div>
          
          {/* INR Summary */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-medium text-black">INR</span>
                  {latestINR && (
                    <span className={`text-sm font-medium ${getStatusColor(getINRStatus(latestINR.value!))}`}>
                      {getINRStatus(latestINR.value!) === "normal" ? "Normal" : 
                       getINRStatus(latestINR.value!) === "warning" ? "Monitor" : "Critical"}
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  {latestINR ? (
                    <>
                      <span className="text-2xl font-light text-black">{latestINR.value}</span>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(latestINR.date)}</p>
                    </>
                  ) : (
                    <span className="text-base text-gray-400">No data</span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Blood Pressure Summary */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-medium text-black">Blood Pressure</span>
                  {latestBP && (
                    <span className={`text-sm font-medium ${getStatusColor(getBPStatus(latestBP.systolic!, latestBP.diastolic!))}`}>
                      {getBPStatus(latestBP.systolic!, latestBP.diastolic!) === "normal" ? "Normal" : 
                       getBPStatus(latestBP.systolic!, latestBP.diastolic!) === "warning" ? "Monitor" : "Critical"}
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  {latestBP ? (
                    <>
                      <span className="text-2xl font-light text-black">{latestBP.systolic}/{latestBP.diastolic}</span>
                      <span className="text-sm text-gray-500 ml-2">mmHg</span>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(latestBP.date)}</p>
                    </>
                  ) : (
                    <span className="text-base text-gray-400">No data</span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Recent Readings */}
        <div className="bg-white mt-4 mx-4 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-black">Recent</h2>
          </div>
          
          {sortedReadings.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-400">No readings yet</p>
              <p className="text-sm text-gray-400 mt-1">Tap Add to get started</p>
            </div>
          ) : (
            <div>
              {sortedReadings.slice(0, 10).map((reading, index) => (
                <div key={reading.id} className={`px-4 py-3 ${index < sortedReadings.slice(0, 10).length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {reading.type === "inr" ? (
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-medium text-black">INR</span>
                            <span className={`text-base font-medium ${getStatusColor(getINRStatus(reading.value!))}`}>
                              {reading.value}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(reading.date)} at {formatTime(reading.date)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-medium text-black">Blood Pressure</span>
                            <span className={`text-base font-medium ${getStatusColor(getBPStatus(reading.systolic!, reading.diastolic!))}`}>
                              {reading.systolic}/{reading.diastolic}
                            </span>
                            {reading.pulse && (
                              <span className="text-sm text-gray-500">♥ {reading.pulse}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(reading.date)} at {formatTime(reading.date)}
                          </p>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacing for safe area */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default Index;