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
  targetINR: number;
  onTargetINRChange: (target: number) => void;
}

const SettingsDialog = ({ targetINR, onTargetINRChange }: SettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [inrTarget, setInrTarget] = useState(targetINR.toString());
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setInrTarget(targetINR.toString());
  }, [targetINR]);

  const handleSave = () => {
    const target = parseFloat(inrTarget);
    
    if (target && target > 0 && target < 10) {
      onTargetINRChange(target);
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

          {/* INR Target */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Target INR</Label>
            <div className="space-y-2">
              <Input
                id="targetINR"
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={inrTarget}
                onChange={(e) => setInrTarget(e.target.value)}
                className="text-base"
                placeholder="2.5"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your prescribed target INR value (e.g., 2.5, 3.0)
              </p>
            </div>
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