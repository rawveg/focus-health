import { useState, useEffect } from "react";
import HealthMetricCard from "@/components/HealthMetricCard";
import AddReadingDialog from "@/components/AddReadingDialog";
import ReadingsList from "@/components/ReadingsList";
import { Heart, Activity } from "lucide-react";

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

  const addReading = (newReading: Reading) => {
    setReadings(prev => [...prev, newReading]);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const latestINR = getLatestINR();
  const latestBP = getLatestBP();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Tracker</h1>
              <p className="text-sm text-gray-600">INR & Blood Pressure Monitor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Current Readings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Current Readings</span>
          </h2>
          
          <div className="grid gap-4">
            {latestINR ? (
              <HealthMetricCard
                title="INR"
                value={latestINR.value!.toString()}
                unit=""
                status={getINRStatus(latestINR.value!)}
                date={formatDate(latestINR.date)}
                target="2.0 - 3.0"
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No INR readings yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first reading</p>
              </div>
            )}

            {latestBP ? (
              <HealthMetricCard
                title="Blood Pressure"
                value={`${latestBP.systolic}/${latestBP.diastolic}`}
                unit="mmHg"
                status={getBPStatus(latestBP.systolic!, latestBP.diastolic!)}
                date={formatDate(latestBP.date)}
                target="< 130/80"
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No blood pressure readings yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first reading</p>
              </div>
            )}
          </div>
        </div>

        {/* Readings History */}
        <ReadingsList readings={readings} />
      </div>

      {/* Add Reading Button */}
      <AddReadingDialog onAddReading={addReading} />
    </div>
  );
};

export default Index;