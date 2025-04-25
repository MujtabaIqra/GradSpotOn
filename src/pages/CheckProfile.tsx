import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  created_at: string;
  updated_at: string;
}

const CheckProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          setError('No active session found. Please sign in first.');
          setLoading(false);
          return;
        }

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Profile Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No profile information found for the current user.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdminEmail = profile.email.startsWith('a.') && profile.email.endsWith('@ajmanuni.ac.ae');
  const isAdmin = profile.user_type === 'Admin';

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>ID:</strong> {profile.id}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Full Name:</strong> {profile.full_name}</p>
            <p><strong>User Type:</strong> {profile.user_type}</p>
            <p><strong>Created At:</strong> {new Date(profile.created_at).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(profile.updated_at).toLocaleString()}</p>
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">Admin Status Check:</h3>
            <p>Admin Email Format: {isAdminEmail ? '✅ Valid' : '❌ Invalid'}</p>
            <p>Admin Status: {isAdmin ? '✅ Admin' : '❌ Not Admin'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckProfile; 