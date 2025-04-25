
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, CreditCard, LogOut, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ProfileActions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        setIsAdmin(profile?.user_type === 'Admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, []);

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
      {isAdmin && (
        <Button 
          variant="outline" 
          className="w-full justify-start text-left bg-purple-50"
          onClick={() => navigate('/admin')}
        >
          <Shield className="h-5 w-5 mr-2 text-spoton-purple" />
          Admin Dashboard
        </Button>
      )}
      
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
