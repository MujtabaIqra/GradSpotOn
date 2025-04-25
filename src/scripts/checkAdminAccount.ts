import { supabase } from '@/integrations/supabase/client';

async function checkAdminAccount() {
  try {
    // First try to sign in with the admin account to check if it exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'a.admin1@ajmanuni.ac.ae',
      password: 'example1'
    });

    if (signInError) {
      console.log('\nAccount Status:');
      console.log('-------------------');
      console.log('❌ Login failed:', signInError.message);
      console.log('\nThis means either:');
      console.log('1. The account does not exist');
      console.log('2. The password is incorrect');
      console.log('3. There might be other authentication issues');
      return;
    }

    if (!signInData.user) {
      console.log('❌ No user data returned after login');
      return;
    }

    // Now check the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    if (profileError) {
      console.error('Error checking profile:', profileError);
      return;
    }

    console.log('\nProfile Information:');
    console.log('-------------------');
    if (profile) {
      console.log('ID:', profile.id);
      console.log('Full Name:', profile.full_name);
      console.log('User Type:', profile.user_type);
      console.log('Created At:', profile.created_at);
      console.log('-------------------');
      console.log('Admin Email Format:', signInData.user.email?.startsWith('a.') && signInData.user.email?.endsWith('@ajmanuni.ac.ae') ? '✅ Valid' : '❌ Invalid');
      console.log('Admin Status:', profile.user_type === 'Admin' ? '✅ Admin' : '❌ Not Admin');
    } else {
      console.log('❌ No profile found in profiles table');
      console.log('-------------------');
      console.log('This means your auth account exists but the profile is not properly set up');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    // Sign out after checking
    await supabase.auth.signOut();
  }
}

checkAdminAccount(); 