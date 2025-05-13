
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { VehicleInfo } from '@/components/VehicleInfo';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { EditableAccountInfo } from '@/components/profile/EditableAccountInfo';
import { ProfileActions } from '@/components/profile/ProfileActions';
import { User } from '@supabase/supabase-js';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  // Add a key to force re-render when profile updates
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchUserData = async () => {
    setLoading(true);
    
    try {
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
        console.log("No profile found for user");
        const emailName = session.user.email?.split('@')[0] || '';
        const nameParts = emailName.split('.');
        const formattedName = nameParts
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
        
        setProfile({
          full_name: formattedName,
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
  
  useEffect(() => {
    fetchUserData();
  }, [navigate, toast, refreshKey]);
  
  // Function to refresh profile data
  const refreshProfile = () => {
    setRefreshKey(prevKey => prevKey + 1);
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
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((name: string) => name[0])
    .join('')
    .toUpperCase();
  
  return (
    <div className="min-h-screen pb-16">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        <ProfileHeader
          displayName={displayName}
          email={user?.email}
          userType={profile?.user_type}
          initials={initials}
          studentId={profile?.student_id}
        />
        
        <EditableAccountInfo
          userId={user?.id || ''}
          studentId={profile?.student_id}
          userType={profile?.user_type}
          fullName={profile?.full_name}
        />
        
        <VehicleInfo />
        
        <ProfileActions />
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default UserProfilePage;
