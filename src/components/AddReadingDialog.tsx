import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface AddReadingDialogProps {
  onAddReading: (reading: any) => void;
}

const AddReadingDialog = ({ onAddReading }: AddReadingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [inrValue, setInrValue] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");

  const handleAddINR = () => {
    if (!inrValue) return;
    
    const reading = {
      id: Date.now().toString(),
      type: "inr",
      value: parseFloat(inrValue),
      date: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    onAddReading(reading);
    setInrValue("");
    setOpen(false);
    showSuccess("INR reading added successfully");
  };

  const handleAddBP = () => {
    if (!systolic || !diastolic) return;
    
    const reading = {
      id: Date.now().toString(),
      type: "bloodPressure",
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      pulse: pulse ? parseInt(pulse) : undefined,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    onAddReading(reading);
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setOpen(false);
    showSuccess("Blood pressure reading added successfully");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 fixed bottom-6 right-6 shadow-lg">
          <Plus size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Reading</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="inr" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inr">INR</TabsTrigger>
            <TabsTrigger value="bp">Blood Pressure</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inr" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="inr">INR Value</Label>
              <Input
                id="inr"
                type="number"
                step="0.1"
                placeholder="2.5"
                value={inrValue}
                onChange={(e) => setInrValue(e.target.value)}
              />
            </div>
            <Button onClick={handleAddINR} className="w-full bg-blue-600 hover:bg-blue-700">
              Add INR Reading
            </Button>
          </TabsContent>
          
          <TabsContent value="bp" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systolic">Systolic</Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="120"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diastolic">Diastolic</Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="80"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pulse">Pulse (optional)</Label>
              <Input
                id="pulse"
                type="number"
                placeholder="72"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
              />
            </div>
            <Button onClick={handleAddBP} className="w-full bg-blue-600 hover:bg-blue-700">
              Add Blood Pressure Reading
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddReadingDialog;