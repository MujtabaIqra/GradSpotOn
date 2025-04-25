
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';

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

// Define the interface for the database booking
interface DatabaseBooking extends Database['public']['Tables']['bookings']['Row'] {
  status?: string; // Add the status field as optional
  fine?: number;   // Add the fine field as optional
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
        
        const formattedBookings: Booking[] = bookingsData.map(booking => {
          // Cast the database booking to our extended interface
          const dbBooking = booking as DatabaseBooking;
          return {
            id: dbBooking.id,
            date: dbBooking.start_time.split('T')[0],
            startTime: dbBooking.start_time.split('T')[1].slice(0, 5),
            endTime: new Date(new Date(dbBooking.start_time).getTime() + dbBooking.duration_minutes * 60000).toTimeString().slice(0, 5),
            zone: dbBooking.building,
            spot: `${dbBooking.building}-${dbBooking.slot}`,
            status: dbBooking.status || 'completed', // Use status if exists, otherwise default to 'completed'
            fine: dbBooking.fine
          };
        });
        
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
