
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Car, Calendar } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate: string;
  color: string;
}

const ServicesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            variant: "destructive",
            title: "Authentication required",
            description: "Please log in to access services."
          });
          navigate('/login');
          return;
        }
        
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*');
          
        if (servicesError) throw servicesError;
        
        // Fetch user's vehicles
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (vehiclesError) throw vehiclesError;
        
        setServices(servicesData || []);
        setVehicles(vehiclesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: "Please try again later."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, toast]);
  
  const handleBookService = (service: Service) => {
    setSelectedService(service);
    
    if (vehicles.length === 0) {
      toast({
        variant: "destructive",
        title: "No vehicle found",
        description: "Please add a vehicle before booking a service."
      });
      navigate('/profile');
      return;
    }
    
    setDialogOpen(true);
  };
  
  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedVehicleId) {
      toast({
        variant: "destructive",
        title: "Incomplete information",
        description: "Please select a vehicle to continue."
      });
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from('service_orders')
        .insert({
          user_id: session.user.id,
          service_id: selectedService.id,
          vehicle_id: selectedVehicleId,
          price: selectedService.price,
          status: 'pending',
          payment_status: 'unpaid'
        });
        
      if (error) throw error;
      
      toast({
        title: "Service booked",
        description: "Your service has been booked successfully. Please proceed to payment."
      });
      
      setDialogOpen(false);
      navigate('/profile'); // Redirect to profile or payment page
    } catch (error) {
      console.error('Error booking service:', error);
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: "Failed to book the service. Please try again."
      });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pb-16">
        <Header />
        <main className="p-4 max-w-lg mx-auto flex items-center justify-center">
          <p>Loading services...</p>
        </main>
        <BottomNavigation />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-16">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Additional Services</h1>
        
        <div className="space-y-4">
          {services.length > 0 ? (
            services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">{service.price} AED</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleBookService(service)}
                    className="w-full"
                  >
                    Book Service
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground">No services available at the moment.</p>
          )}
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book {selectedService?.name}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Select Vehicle</Label>
                <Select 
                  value={selectedVehicleId} 
                  onValueChange={setSelectedVehicleId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.plate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedService && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-semibold">{selectedService.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                  <p className="font-bold mt-2">{selectedService.price} AED</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmBooking}>Confirm Booking</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ServicesPage;
