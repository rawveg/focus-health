import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { showSuccess } from "@/utils/toast";

interface SettingsDialogProps {
  targetINRMin: number;
  targetINRMax: number;
  onTargetINRChange: (min: number, max: number) => void;
}

const SettingsDialog = ({ targetINRMin, targetINRMax, onTargetINRChange }: SettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [minINR, setMinINR] = useState(targetINRMin.toString());
  const [maxINR, setMaxINR] = useState(targetINRMax.toString());
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMinINR(targetINRMin.toString());
    setMaxINR(targetINRMax.toString());
  }, [targetINRMin, targetINRMax]);

  const handleSave = () => {
    const min = parseFloat(minINR);
    const max = parseFloat(maxINR);
    
    if (min && max && min < max && min > 0 && max < 10) {
      onTargetINRChange(min, max);
      setOpen(false);
      showSuccess("Settings saved");
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-blue-500 dark:text-blue-400">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    {getThemeIcon()}
                    <span className="capitalize">{theme}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center space-x-2">
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center space-x-2">
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* INR Target Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Target INR Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minINR" className="text-xs text-gray-500 dark:text-gray-400">Minimum</Label>
                <Input
                  id="minINR"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5.0"
                  value={minINR}
                  onChange={(e) => setMinINR(e.target.value)}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxINR" className="text-xs text-gray-500 dark:text-gray-400">Maximum</Label>
                <Input
                  id="maxINR"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5.0"
                  value={maxINR}
                  onChange={(e) => setMaxINR(e.target.value)}
                  className="text-base"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Common ranges: 2.0-3.0 (most conditions), 2.5-3.5 (mechanical valves)
            </p>
          </div>

          <Button onClick={handleSave} className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;