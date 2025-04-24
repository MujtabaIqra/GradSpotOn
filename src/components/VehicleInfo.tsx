
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
  color: string;
}

export function VehicleInfo() {
  const { toast } = useToast();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    plate: '',
    color: ''
  });

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching vehicle:", error);
      return;
    }

    if (data) {
      setVehicle(data);
      setFormData(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = vehicle 
      ? await supabase
          .from('vehicles')
          .update(formData)
          .eq('id', vehicle.id)
      : await supabase
          .from('vehicles')
          .insert([{ ...formData, user_id: session.user.id }]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save vehicle information."
      });
      return;
    }

    toast({
      title: "Success",
      description: "Vehicle information saved successfully."
    });
    
    setIsEditing(false);
    fetchVehicle();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Car className="h-5 w-5" />
          Vehicle Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {vehicle ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle</span>
              <span>{vehicle.make} {vehicle.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">License Plate</span>
              <span>{vehicle.plate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color</span>
              <span>{vehicle.color}</span>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">No vehicle information added yet.</p>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              {vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Make</label>
                <Input
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Model</label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">License Plate</label>
                <Input
                  value={formData.plate}
                  onChange={(e) => setFormData(prev => ({ ...prev, plate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Save Vehicle</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
