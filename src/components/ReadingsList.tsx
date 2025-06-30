import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

interface ReadingsListProps {
  readings: Reading[];
}

const ReadingsList = ({ readings }: ReadingsListProps) => {
  const getINRStatus = (value: number) => {
    if (value < 2.0 || value > 3.0) return "warning";
    if (value < 1.5 || value > 4.0) return "critical";
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
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const sortedReadings = [...readings].sort((a, b) => b.timestamp - a.timestamp);

  const statusColors = {
    normal: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    critical: "bg-red-100 text-red-800"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Readings</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {sortedReadings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No readings yet. Add your first reading!</p>
          ) : (
            <div className="space-y-4">
              {sortedReadings.map((reading, index) => (
                <div key={reading.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {reading.type === "inr" ? (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">INR</span>
                            <Badge className={cn("text-xs", statusColors[getINRStatus(reading.value!)])}>
                              {reading.value}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{formatDate(reading.date)}</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Blood Pressure</span>
                            <Badge className={cn("text-xs", statusColors[getBPStatus(reading.systolic!, reading.diastolic!)])}>
                              {reading.systolic}/{reading.diastolic}
                            </Badge>
                            {reading.pulse && (
                              <span className="text-sm text-gray-500">♥ {reading.pulse}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{formatDate(reading.date)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < sortedReadings.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ReadingsList;