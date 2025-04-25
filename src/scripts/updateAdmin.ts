import { supabase } from '@/integrations/supabase/client';

async function updateToAdmin() {
  try {
    // First try to sign in with the admin account
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'a.admin1@ajmanuni.ac.ae',
      password: 'example1'
    });
    
    if (signInError) {
      console.error('Error signing in:', signInError);
      return;
    }

    if (!signInData.user) {
      console.log('No user data returned after login.');
      return;
    }

    // Update user type to Admin directly with enum cast
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        user_type: 'Admin' as any, // Cast to any to bypass type checking
        updated_at: new Date().toISOString()
      })
      .eq('id', signInData.user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return;
    }

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single();

    if (verifyError) {
      console.error('Error verifying update:', verifyError);
      return;
    }

    console.log('\nProfile Information:');
    console.log('-------------------');
    console.log('ID:', verifyData.id);
    console.log('Full Name:', verifyData.full_name);
    console.log('User Type:', verifyData.user_type);
    console.log('-------------------');
    console.log('Admin Status:', verifyData.user_type === 'Admin' ? '✅ Admin' : '❌ Not Admin');

  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    // Sign out after update
    await supabase.auth.signOut();
  }
}

updateToAdmin(); 