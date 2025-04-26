import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  zone: string;
  spot: string;
  status: string;
  qrCode: string;
  price: number;
  duration_minutes: number;
}

// Define the type for bookings from database with additional fields
type DatabaseBooking = Database['public']['Tables']['bookings']['Row'] & {
  status?: string; // Add the status field as optional since it's not in the database schema
  fine?: number;   // Add the fine field as optional
}

export function useActiveBooking() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(0);
  const [isPastEndTime, setIsPastEndTime] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [fine, setFine] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const calculateTimeLeft = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    // If booking hasn't started yet
    if (now < start) {
      const totalMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
      return {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
        seconds: 0
      };
    }
    // If booking has ended
    else if (now >= end) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
    // If booking is in progress
    else {
      const diffMs = end.getTime() - now.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      return {
        hours: Math.floor(diffSeconds / 3600),
        minutes: Math.floor((diffSeconds % 3600) / 60),
        seconds: diffSeconds % 60
      };
    }
  };

  useEffect(() => {
    const fetchActiveBooking = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error || !bookings || bookings.length === 0) {
          toast({
            title: "No Active Booking",
            description: "You don't have any active bookings.",
            variant: "default"
          });
          return;
        }

        const activeBooking = bookings[0] as DatabaseBooking;
        const startTime = activeBooking.start_time;
        const endTime = new Date(new Date(startTime).getTime() + activeBooking.duration_minutes * 60000).toISOString();
        
        const formattedBooking = {
          id: activeBooking.id,
          date: startTime.split('T')[0],
          startTime: new Date(startTime).toTimeString().slice(0, 5),
          endTime: new Date(endTime).toTimeString().slice(0, 5),
          zone: activeBooking.building,
          spot: `${activeBooking.building}-${activeBooking.slot}`,
          status: activeBooking.status || 'active',
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeBooking.id}`,
          price: 5,
          duration_minutes: activeBooking.duration_minutes
        };

        setBooking(formattedBooking);
        setTimeLeft(calculateTimeLeft(startTime, endTime));

      } catch (error) {
        console.error("Error fetching active booking:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your active booking."
        });
      }
    };

    fetchActiveBooking();

    const timer = setInterval(() => {
      if (booking) {
        const startTime = booking.date + 'T' + booking.startTime;
        const endTime = booking.date + 'T' + booking.endTime;
        const newTimeLeft = calculateTimeLeft(startTime, endTime);
        setTimeLeft(newTimeLeft);

        // Update progress
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        if (now >= end) {
          setProgress(100);
          setIsPastEndTime(true);
          clearInterval(timer);
        } else if (now >= start) {
          const totalDuration = end.getTime() - start.getTime();
          const elapsed = now.getTime() - start.getTime();
          setProgress((elapsed / totalDuration) * 100);
        } else {
          setProgress(0);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, toast, booking]);

  // New useEffect to update booking status to 'expired' when isPastEndTime becomes true
  useEffect(() => {
    const markBookingExpired = async () => {
      if (booking && isPastEndTime && booking.status !== 'completed') {
        await supabase
          .from('bookings')
          .update({ status: 'expired' })
          .eq('id', booking.id);
      }
    };
    markBookingExpired();
  }, [isPastEndTime, booking]);

  const handleScanQr = async () => {
    if (!booking) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No active booking found."
      });
      return;
    }

    try {
      // First check if the booking exists and is active
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', booking.id)
        .single();

      if (checkError) {
        throw new Error(`Error checking booking: ${checkError.message}`);
      }

      if (!existingBooking) {
        throw new Error('Booking not found in database');
      }

      // Calculate if the session is expired
      const endTime = new Date(existingBooking.start_time);
      endTime.setMinutes(endTime.getMinutes() + existingBooking.duration_minutes);
      const now = new Date();
      const isExpired = now > endTime;

      // Update booking with only the fields that exist in the schema
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error(`Error updating booking: ${updateError.message}`);
      }

      // Update local state only
      setQrScanned(true);
      setFine(isExpired ? 10 : 0); // Only update the UI state, not the database

      if (isExpired) {
        toast({
          variant: "destructive",
          title: "Late Exit",
          description: "You have exited after your parking time ended. A fine of 10 AED has been applied.",
          duration: 10000,
        });
      } else {
        toast({
          title: "Exit Successful",
          description: "Thank you for using our parking service!",
          duration: 5000,
        });
      }

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error("Error scanning QR:", error);
      toast({
        variant: "destructive",
        title: "Scan Error",
        description: error instanceof Error ? error.message : "Could not process QR scan. Please try again."
      });
    }
  };

  const handleEndSessionEarly = async () => {
    if (!booking) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No active booking found."
      });
      return;
    }

    try {
      // First check if the booking exists and is active
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', booking.id)
        .single();

      if (checkError) {
        throw new Error(`Error checking booking: ${checkError.message}`);
      }

      if (!existingBooking) {
        throw new Error('Booking not found in database');
      }

      if (existingBooking.status === 'completed') {
        throw new Error('This booking has already been completed');
      }

      // Update booking with status field and mark as completed
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'completed',
          fine: 0,
        })
        .eq('id', booking.id)
        .eq('status', 'active'); // Only update if status is still active

      if (updateError) {
        throw new Error(`Error updating booking: ${updateError.message}`);
      }

      setQrScanned(true);
      setFine(0);
      toast({
        title: "Session Ended",
        description: "Your parking session has been ended successfully.",
        duration: 5000,
      });
      
      // Navigate back to dashboard after ending session
      navigate('/dashboard');
    } catch (error) {
      console.error("Error ending session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Could not end your parking session. Please try again."
      });
    }
  };

  return {
    booking,
    timeLeft,
    progress,
    isPastEndTime,
    qrScanned,
    fine,
    handleScanQr,
    handleEndSessionEarly
  };
}
