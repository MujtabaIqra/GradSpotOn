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
  building: string;
  slot: number;
  status: string;
  fine?: number;
}

// Define the type for database booking with additional fields
type DatabaseBooking = Database['public']['Tables']['bookings']['Row'] & {
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
          const dbBooking = booking as DatabaseBooking;
          const startDate = new Date(dbBooking.start_time);
          const endDate = new Date(startDate.getTime() + dbBooking.duration_minutes * 60000);

          // Format times as 12-hour with AM/PM
          const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
          const endTime = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

          // Improved status logic
          let status = dbBooking.status;
          if (status === 'completed' || status === 'expired') {
            // Use the DB value
          } else {
            const now = new Date();
            if (now < startDate) {
              status = 'upcoming';
            } else if (now >= startDate && now < endDate) {
              status = 'active';
            } else {
              status = 'completed';
            }
          }

          return {
            id: dbBooking.id,
            date: dbBooking.start_time.split('T')[0],
            startTime,
            endTime,
            building: dbBooking.building,
            slot: dbBooking.slot,
            status,
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
          booking.building.toLowerCase().includes(query) ||
          booking.slot.toString().includes(query) ||
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
