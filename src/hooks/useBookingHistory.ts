
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  zone: string;
  spot: string;
  status: string;
  fine?: number;
}

export function useBookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        const { data: bookingsData, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const formattedBookings: Booking[] = bookingsData.map(booking => ({
          id: booking.id,
          date: booking.start_time.split('T')[0],
          startTime: booking.start_time.split('T')[1].slice(0, 5),
          endTime: new Date(new Date(booking.start_time).getTime() + booking.duration_minutes * 60000).toTimeString().slice(0, 5),
          zone: booking.building,
          spot: `${booking.building}-${booking.slot}`,
          status: booking.status || 'completed',
          fine: booking.fine || undefined
        }));
        
        setBookings(formattedBookings);
        setFilteredBookings(formattedBookings);
      } catch (error) {
        console.error("Error fetching booking history:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your booking history."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingHistory();
    
    // Real-time subscription for bookings
    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `user_id=eq.${supabase.auth.getUser()}`
        },
        (payload) => {
          console.log('Booking update received:', payload);
          fetchBookingHistory(); // Refresh bookings on any change
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, toast]);
  
  // Filter bookings based on search and status
  useEffect(() => {
    let result = [...bookings];
    
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        booking =>
          booking.id.toLowerCase().includes(query) ||
          booking.zone.toLowerCase().includes(query) ||
          booking.spot.toLowerCase().includes(query) ||
          booking.date.includes(query)
      );
    }
    
    setFilteredBookings(result);
  }, [bookings, statusFilter, searchQuery]);

  return {
    bookings: filteredBookings,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter
  };
}
