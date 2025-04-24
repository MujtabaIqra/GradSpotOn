
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription, 
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
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching vehicle:", error);
      setIsLoading(false);
      return;
    }

    if (data) {
      setVehicle(data);
      setFormData({
        make: data.make,
        model: data.model,
        plate: data.plate,
        color: data.color
      });
    }
    
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to update your vehicle information."
        });
        return;
      }

      if (vehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update(formData)
          .eq('id', vehicle.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Vehicle information updated successfully."
        });
      } else {
        // Create new vehicle
        const { error } = await supabase
          .from('vehicles')
          .insert([{ ...formData, user_id: session.user.id }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Vehicle information saved successfully."
        });
      }
      
      setIsEditing(false);
      fetchVehicle();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save vehicle information."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        {isLoading ? (
          <p className="text-muted-foreground">Loading vehicle information...</p>
        ) : vehicle ? (
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
              <DialogDescription>
                {vehicle ? 'Update your vehicle details below.' : 'Add your vehicle details to access parking and additional services.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="make" className="text-sm font-medium">Make</label>
                <Input
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  placeholder="e.g., Toyota"
                  required
                />
              </div>
              <div>
                <label htmlFor="model" className="text-sm font-medium">Model</label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Corolla"
                  required
                />
              </div>
              <div>
                <label htmlFor="plate" className="text-sm font-medium">License Plate</label>
                <Input
                  id="plate"
                  name="plate"
                  value={formData.plate}
                  onChange={handleInputChange}
                  placeholder="e.g., ABC1234"
                  required
                />
              </div>
              <div>
                <label htmlFor="color" className="text-sm font-medium">Color</label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="e.g., White"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Vehicle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
