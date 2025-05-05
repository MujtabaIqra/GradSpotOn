
import { supabase } from '@/integrations/supabase/client';

async function checkProfile() {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return;
    }

    if (!session) {
      console.log('No active session found. Please sign in first.');
      return;
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return;
    }

    console.log('Current User Profile:');
    console.log('-------------------');
    console.log('ID:', profile.id);
    console.log('Email:', session.user.email);
    console.log('Full Name:', profile.full_name);
    console.log('User Type:', profile.user_type);
    console.log('Created At:', profile.created_at);
    console.log('Updated At:', profile.updated_at);
    console.log('-------------------');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkProfile();
