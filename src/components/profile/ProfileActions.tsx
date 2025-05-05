
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/bookings')}>
          <Calendar className="mr-2 h-4 w-4" />
          My Bookings
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/payments')}>
          <CreditCard className="mr-2 h-4 w-4" />
          Payment History
        </Button>
      </div>
      <Separator />
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
