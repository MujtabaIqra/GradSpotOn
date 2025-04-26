import { supabase } from '@/integrations/supabase/client';

async function deleteAllMyBookings() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.log('Not logged in');
    return;
  }
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error deleting bookings:', error);
  } else {
    console.log('All your bookings deleted!');
  }
}

deleteAllMyBookings(); 