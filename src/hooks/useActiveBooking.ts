
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

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

        const activeBooking = bookings[0];
        const formattedBooking = {
          id: activeBooking.id,
          date: activeBooking.start_time.split('T')[0],
          startTime: activeBooking.start_time.split('T')[1].slice(0, 5),
          endTime: new Date(new Date(activeBooking.start_time).getTime() + activeBooking.duration_minutes * 60000).toTimeString().slice(0, 5),
          zone: activeBooking.building,
          spot: `${activeBooking.building}-${activeBooking.slot}`,
          status: 'active',
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeBooking.id}`,
          price: 5 // Assuming a fixed price, adjust as needed
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
              description: "Your parking session ends in 10 minutes.",
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
    if (!booking) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', booking.id);

      if (error) throw error;

      setQrScanned(true);
      toast({
        title: "QR Code Scanned",
        description: "Thank you for using our parking service!",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error scanning QR:", error);
      toast({
        variant: "destructive",
        title: "Scan Error",
        description: "Could not process QR scan. Please try again."
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
    handleScanQr
  };
}
