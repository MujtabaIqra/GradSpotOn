
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Car, CreditCard, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Unable to verify your login status. Please log in again."
          });
          navigate('/login');
          return;
        }
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        setUser(session.user);
        
        // Fetch profile data from profiles table using maybeSingle instead of single
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            variant: "destructive",
            title: "Profile Error",
            description: "Unable to load your profile data."
          });
        }
        
        if (profileData) {
          setProfile(profileData);
        } else {
          console.log("No profile found for user", session.user.id);
          // Create a temporary profile with email details
          const emailName = session.user.email?.split('@')[0] || '';
          const nameParts = emailName.split('.');
          const formattedName = nameParts
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
          
          setProfile({
            full_name: formattedName || session.user.email?.split('@')[0] || 'User',
            user_type: 'Student',
            student_id: null
          });
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong. Please try again later."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate, toast]);
  
  // Handle sign out
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
  
  // Default vehicle info if not available from database
  const defaultVehicle = {
    make: 'Toyota',
    model: 'Corolla',
    plate: 'AJM 45921',
    color: 'White'
  };
  
  // Default bookings info if not available from database
  const defaultBookings = {
    total: 0,
    thisMonth: 0
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pb-16">
        <Header />
        <main className="p-4 max-w-lg mx-auto flex items-center justify-center">
          <p>Loading profile data...</p>
        </main>
        <BottomNavigation />
      </div>
    );
  }
  
  // Format display name and initials
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();
  
  return (
    <div className="min-h-screen pb-16">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-16 w-16 bg-spoton-purple">
            <AvatarFallback className="text-white text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{displayName}</h1>
            <div className="flex items-center">
              <p className="text-muted-foreground text-sm mr-2">{user?.email}</p>
              <Badge variant="outline" className="text-xs">{profile?.user_type || 'Student'}</Badge>
            </div>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID Number</span>
              <span>{profile?.student_id || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type</span>
              <span>{profile?.user_type || 'Student'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Bookings</span>
              <span>{defaultBookings.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bookings This Month</span>
              <span>{defaultBookings.thisMonth}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">Edit Profile</Button>
          </CardFooter>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle</span>
              <span>{defaultVehicle.make} {defaultVehicle.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">License Plate</span>
              <span>{defaultVehicle.plate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color</span>
              <span>{defaultVehicle.color}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">Edit Vehicle</Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-2">
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
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Methods
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
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default UserProfilePage;
