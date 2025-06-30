import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface QuickStatsProps {
  readings: any[];
  targetINR: number;
}

const QuickStats = ({ readings, targetINR }: QuickStatsProps) => {
  const inrReadings = readings.filter(r => r.type === "inr").sort((a, b) => b.timestamp - a.timestamp);
  const bpReadings = readings.filter(r => r.type === "bloodPressure").sort((a, b) => b.timestamp - a.timestamp);

  const getINRTrend = () => {
    if (inrReadings.length < 2) return null;
    const latest = inrReadings[0].value;
    const previous = inrReadings[1].value;
    const diff = latest - previous;
    
    if (Math.abs(diff) < 0.1) return { type: "stable", icon: Minus, text: "Stable" };
    if (diff > 0) return { type: "up", icon: TrendingUp, text: `+${diff.toFixed(1)}` };
    return { type: "down", icon: TrendingDown, text: diff.toFixed(1) };
  };

  const getBPTrend = () => {
    if (bpReadings.length < 2) return null;
    const latest = bpReadings[0].systolic;
    const previous = bpReadings[1].systolic;
    const diff = latest - previous;
    
    if (Math.abs(diff) < 5) return { type: "stable", icon: Minus, text: "Stable" };
    if (diff > 0) return { type: "up", icon: TrendingUp, text: `+${diff}` };
    return { type: "down", icon: TrendingDown, text: diff.toString() };
  };

  const inrTrend = getINRTrend();
  const bpTrend = getBPTrend();

  const getInRangeCount = () => {
    const recentINR = inrReadings.slice(0, 5);
    const inRange = recentINR.filter(r => Math.abs(r.value - targetINR) <= 0.2).length;
    return { inRange, total: recentINR.length };
  };

  const inRangeStats = getInRangeCount();

  if (readings.length === 0) return null;

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl p-6 border border-white/10 mb-8">
      <h3 className="text-white text-lg font-medium mb-4">Quick Stats</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* INR Trend */}
        {inrTrend && (
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-1">
              <inrTrend.icon className={`w-4 h-4 ${
                inrTrend.type === "up" ? "text-red-400" : 
                inrTrend.type === "down" ? "text-green-400" : "text-gray-400"
              }`} />
              <span className="text-white/80 text-sm">INR Trend</span>
            </div>
            <div className="text-white font-medium">{inrTrend.text}</div>
          </div>
        )}

        {/* BP Trend */}
        {bpTrend && (
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-1">
              <bpTrend.icon className={`w-4 h-4 ${
                bpTrend.type === "up" ? "text-red-400" : 
                bpTrend.type === "down" ? "text-green-400" : "text-gray-400"
              }`} />
              <span className="text-white/80 text-sm">BP Trend</span>
            </div>
            <div className="text-white font-medium">{bpTrend.text} mmHg</div>
          </div>
        )}

        {/* In Range Stats */}
        {inRangeStats.total > 0 && (
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-white/80 text-sm mb-1">Recent INR</div>
            <div className="text-white font-medium">
              {inRangeStats.inRange}/{inRangeStats.total} in range
            </div>
            <div className="text-white/60 text-xs mt-1">
              {Math.round((inRangeStats.inRange / inRangeStats.total) * 100)}% on target
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickStats;