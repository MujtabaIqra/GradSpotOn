
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Booking } from './types';
import { useToast } from '../use-toast';

export function useAdminBookings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBookings(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBookings();

    const bookingsSubscription = supabase
      .channel('bookings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, 
        () => fetchBookings()
      )
      .subscribe();

    return () => {
      bookingsSubscription.unsubscribe();
    };
  }, []);

  return {
    bookings,
    loading,
    fetchBookings
  };
}
