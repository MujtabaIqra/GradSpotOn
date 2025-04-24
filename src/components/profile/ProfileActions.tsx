
import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, CreditCard, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ProfileActions() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again."
      });
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        variant="outline" 
        className="w-full justify-start text-left" 
        onClick={() => navigate('/services')}
      >
        <CreditCard className="h-5 w-5 mr-2" />
        Additional Services
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start text-left"
        onClick={() => navigate('/book')}
      >
        <Calendar className="h-5 w-5 mr-2" />
        Book a Parking Spot
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start text-left"
        onClick={() => navigate('/history')}
      >
        <Calendar className="h-5 w-5 mr-2" />
        Booking History
      </Button>
      
      <Button variant="outline" className="w-full justify-start text-left">
        <Settings className="h-5 w-5 mr-2" />
        App Settings
      </Button>
      
      <Separator className="my-4" />
      
      <Button 
        variant="outline" 
        className="w-full justify-start text-left text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="h-5 w-5 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
