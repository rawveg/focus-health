import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HealthMetricCardProps {
  title: string;
  value: string;
  unit: string;
  status: "normal" | "warning" | "critical";
  date: string;
  target?: string;
}

const HealthMetricCard = ({ title, value, unit, status, date, target }: HealthMetricCardProps) => {
  const statusColors = {
    normal: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    critical: "bg-red-100 text-red-800 border-red-200"
  };

  const statusLabels = {
    normal: "Normal",
    warning: "Monitor",
    critical: "Critical"
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <Badge className={cn("text-xs font-medium", statusColors[status])}>
            {statusLabels[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            <span className="text-sm font-medium text-gray-500">{unit}</span>
          </div>
          {target && (
            <p className="text-sm text-gray-600">Target: {target}</p>
          )}
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthMetricCard;