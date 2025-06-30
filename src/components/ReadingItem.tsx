import { ChevronRight } from "lucide-react";

interface ReadingItemProps {
  type: "inr" | "bloodPressure";
  value: string;
  status: string;
  statusColor: string;
  date: string;
  time: string;
  pulse?: number;
  onClick?: () => void;
}

const ReadingItem = ({ 
  type, 
  value, 
  status, 
  statusColor, 
  date, 
  time, 
  pulse, 
  onClick 
}: ReadingItemProps) => {
  const getTypeConfig = () => {
    if (type === "inr") {
      return {
        label: "INR",
        bgColor: "bg-blue-500/20",
        textColor: "text-blue-400",
        icon: "INR"
      };
    } else {
      return {
        label: "Blood Pressure",
        bgColor: "bg-red-500/20",
        textColor: "text-red-400",
        icon: "BP"
      };
    }
  };

  const config = getTypeConfig();

  return (
    <div 
      className="p-6 hover:bg-white/5 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center`}>
            <span className={`${config.textColor} text-sm font-medium`}>{config.icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <span className="text-white text-lg font-medium">{value}</span>
              <span className={`text-sm ${statusColor}`}>{status}</span>
              {pulse && (
                <span className="text-white/50 text-sm">♥ {pulse}</span>
              )}
            </div>
            <div className="text-white/50 text-sm">
              {date} at {time}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/30" />
      </div>
    </div>
  );
};

export default ReadingItem;