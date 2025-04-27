import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar, Car, CreditCard, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/integrations/supabase/useUserProfile';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { profile, loading, error } = useUserProfile(userId);
  
  // Get user ID on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Session:', session);
        console.log('Auth Error:', error);
        
        if (error) {
          console.error('Auth Error:', error);
          setIsAuthenticated(false);
          navigate('/login');
          return;
        }

        if (!session) {
          console.log('No session found, redirecting to login');
          setIsAuthenticated(false);
          navigate('/login');
          return;
        }

        setIsAuthenticated(true);
        console.log('User ID:', session.user.id);
        setUserId(session.user.id);
      } catch (err) {
        console.error('Error checking auth:', err);
        setIsAuthenticated(false);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    console.log('Profile Data:', profile);
    console.log('Loading State:', loading);
    console.log('Error State:', error);
    console.log('Is Authenticated:', isAuthenticated);
  }, [profile, loading, error, isAuthenticated]);

  // Mock vehicle data (you can replace this with real data from your database)
  const vehicle = {
    make: 'Toyota',
    model: 'Corolla',
    plate: 'AJM 45921',
    color: 'White'
  };

  // Mock booking stats (you can replace this with real data from your database)
  const bookingStats = {
    total: 24,
    thisMonth: 8
  };
  
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen pb-16">
        <Header />
        <main className="p-4 max-w-lg mx-auto">
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pb-16">
        <Header />
        <main className="p-4 max-w-lg mx-auto">
          <div className="flex items-center justify-center h-40">
            <p className="text-destructive">Error loading profile. Please try again.</p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-16">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-spoton-purple flex items-center justify-center text-white text-xl font-bold">
            {profile.full_name?.split(' ').map(name => name[0]).join('') || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold">{profile.full_name || 'No Name Set'}</h1>
            <div className="flex items-center">
              <p className="text-muted-foreground text-sm mr-2">{profile.student_id || 'No ID'}</p>
              <Badge variant="outline" className="text-xs">{profile.user_type || 'Unknown'}</Badge>
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
              <span>{profile.student_id || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type</span>
              <span>{profile.user_type || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Bookings</span>
              <span>{bookingStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bookings This Month</span>
              <span>{bookingStats.thisMonth}</span>
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
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/login');
            }}
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
