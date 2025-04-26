import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useActiveBooking } from "@/hooks/useActiveBooking";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ActiveBookingPage = () => {
  const {
    booking,
    timeLeft,
    progress,
    isPastEndTime,
    qrScanned,
    fine,
    handleScanQr,
    handleEndSessionEarly
  } = useActiveBooking();

  const [exited, setExited] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const formatTime = (time: { hours: number, minutes: number, seconds: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  const handleExitParking = async () => {
    if (!booking) return;
    setLoading(true);
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', booking.id);
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: 'Could not complete booking.', variant: 'destructive' });
    } else {
      setExited(true);
      toast({ title: 'Parking session completed', description: 'You have exited the parking.' });
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No active booking found</p>
      </div>
    );
  }

  if (booking.status === 'completed' || booking.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-green-600 font-semibold text-center">
          You have exited the parking. Session completed.
        </p>
      </div>
    );
  }

  const isActive = booking.status === 'active' || booking.status === 'upcoming' || (!isPastEndTime && !exited);

  return (
    <div className="min-h-screen pb-16">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Active Booking</h1>
          <p className="text-muted-foreground">Your current parking session</p>
        </div>
        
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-2 w-full bg-muted">
            <div 
              className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-linear ${
                progress < 20 ? 'bg-red-500' : progress < 50 ? 'bg-amber-500' : 'bg-spoton-purple'
              }`} 
              style={{ width: `${progress}%` }} 
            ></div>
          </div>
          
          <CardHeader className="text-center">
            <div className={`text-5xl font-mono font-bold ${
              timeLeft.hours === 0 && timeLeft.minutes < 5 ? 'text-red-500 animate-pulse' : 
              timeLeft.hours === 0 && timeLeft.minutes < 15 ? 'text-amber-500' : 
              'text-spoton-purple'
            }`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-muted-foreground">Time remaining</p>
            {timeLeft.hours === 0 && timeLeft.minutes < 5 && (
              <div className="mt-2 bg-red-50 text-red-700 p-2 rounded-md animate-bounce">
                <p className="font-medium">⚠️ Parking session ending in {timeLeft.minutes} minutes!</p>
                <p className="text-sm">Please proceed to your vehicle immediately</p>
              </div>
            )}
            {timeLeft.hours === 0 && timeLeft.minutes >= 5 && timeLeft.minutes < 15 && (
              <div className="mt-2 bg-amber-50 text-amber-700 p-2 rounded-md">
                <p className="font-medium">⚠️ Parking session ending soon</p>
                <p className="text-sm">Please prepare to leave your parking spot</p>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center text-sm">
              <p className="font-medium">Booking Time</p>
              <p className="text-muted-foreground">
                {booking.startTime} - {booking.endTime}
              </p>
            </div>
            {isActive && !exited && (
              <div className="flex flex-col items-center gap-4 mt-6">
                <img 
                  src={booking.qrCode} 
                  alt="QR Code for parking access" 
                  className="w-40 h-40 border border-border rounded-md p-2"
                />
                <Button onClick={handleExitParking} disabled={loading} className="w-full">
                  {loading ? 'Exiting...' : 'Scan QR / Exit Parking'}
                </Button>
              </div>
            )}
            {exited && (
              <div className="text-green-600 font-semibold text-center mt-4">You have exited the parking. Session completed.</div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ActiveBookingPage;
