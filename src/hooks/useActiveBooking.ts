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

  useEffect(() => {
    const fetchActiveBooking = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        // Fetch the most recent active booking for the current user
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

        // Cast the database booking to our extended type that includes status
        const activeBooking = bookings[0] as DatabaseBooking;
        const formattedBooking = {
          id: activeBooking.id,
          date: activeBooking.start_time.split('T')[0],
          startTime: activeBooking.start_time.split('T')[1].slice(0, 5),
          endTime: new Date(new Date(activeBooking.start_time).getTime() + activeBooking.duration_minutes * 60000).toTimeString().slice(0, 5),
          zone: activeBooking.building,
          spot: `${activeBooking.building}-${activeBooking.slot}`,
          status: activeBooking.status || 'active',
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeBooking.id}`,
          price: 5,
          duration_minutes: activeBooking.duration_minutes
        };

        setBooking(formattedBooking);

        // Calculate time remaining
        const endTime = new Date(activeBooking.start_time);
        endTime.setMinutes(endTime.getMinutes() + activeBooking.duration_minutes);
        const now = new Date();
        const diffMs = endTime.getTime() - now.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);

        if (diffSeconds <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          setProgress(0);
          setIsPastEndTime(true);
          
          // If time has expired and QR code not scanned, apply fine
          if (activeBooking.status !== 'completed') {
            const { error: updateError } = await supabase
              .from('bookings')
              .update({ 
                status: 'expired',
                fine: 10 // 10 AED fine
              } as any)
              .eq('id', activeBooking.id);

            if (updateError) {
              console.error("Error applying fine:", updateError);
            } else {
              setFine(10);
              toast({
                variant: "destructive",
                title: "Parking Session Expired",
                description: "A fine of 10 AED has been applied for not scanning the QR code at exit.",
                duration: 10000,
              });
            }
          }
        } else {
          const hours = Math.floor(diffSeconds / 3600);
          const minutes = Math.floor((diffSeconds % 3600) / 60);
          const seconds = diffSeconds % 60;
          setTimeLeft({ hours, minutes, seconds });
          
          const totalDuration = activeBooking.duration_minutes * 60;
          const progressPercent = ((totalDuration - diffSeconds) / totalDuration) * 100;
          setProgress(progressPercent);
        }

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
        setTimeLeft(prev => {
          if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
            setIsPastEndTime(true);
            clearInterval(timer);
            return prev;
          }
          
          let hours = prev.hours;
          let minutes = prev.minutes;
          let seconds = prev.seconds - 1;
          
          if (seconds < 0) {
            seconds = 59;
            minutes -= 1;
          }
          
          if (minutes < 0) {
            minutes = 59;
            hours -= 1;
          }
          
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          const totalDuration = booking.duration_minutes * 60;
          const newProgress = ((totalDuration - totalSeconds) / totalDuration) * 100;
          setProgress(newProgress);
          
          if (hours === 0 && minutes === 10 && seconds === 0) {
            toast({
              title: "Time is running out!",
              description: "Your parking session ends in 10 minutes. Please scan the QR code at exit to avoid a fine.",
              duration: 10000,
            });
          }
          
          return { hours, minutes, seconds };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, toast, booking]);

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
