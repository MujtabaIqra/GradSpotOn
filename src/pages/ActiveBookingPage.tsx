
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

const ActiveBookingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 45, seconds: 0 });
  const [progress, setProgress] = useState(65); // Mock progress percentage
  const [qrScanned, setQrScanned] = useState(false);
  const [isPastEndTime, setIsPastEndTime] = useState(false);
  const [booking, setBooking] = useState({
    id: 'SPT-12345678',
    date: new Date().toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '15:00',
    zone: 'B',
    spot: 'B-12',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SPOTON-ACTIVE',
    price: 5, // Base price
  });
  const [fine, setFine] = useState(0);
  
  // Fetch active booking on load
  useEffect(() => {
    const fetchActiveBooking = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        // In a real app, fetch the actual booking data from Supabase
        // This is mock data for demonstration
        const mockBookingData = {
          id: 'SPT-12345678',
          date: new Date().toISOString().split('T')[0],
          startTime: '13:00',
          endTime: '15:00',
          zone: 'B',
          spot: 'B-12',
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SPOTON-ACTIVE',
          price: 5,
        };
        
        setBooking(mockBookingData);
        
        // Calculate initial time remaining
        const endTimeDate = new Date();
        const [hours, minutes] = mockBookingData.endTime.split(':').map(Number);
        endTimeDate.setHours(hours, minutes, 0);
        
        const now = new Date();
        const diffMs = endTimeDate.getTime() - now.getTime();
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
          
          // Calculate progress percentage
          const totalDuration = 2 * 3600; // 2 hours in seconds
          const progressPercent = (diffSeconds / totalDuration) * 100;
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
  }, [navigate, toast]);
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
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
        
        // Update progress
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        const totalDuration = 2 * 3600; // 2 hours in seconds
        const newProgress = (totalSeconds / totalDuration) * 100;
        setProgress(newProgress);
        
        // Show notification when 10 minutes remaining
        if (hours === 0 && minutes === 10 && seconds === 0) {
          toast({
            title: "Time is running out!",
            description: "Your parking session ends in 10 minutes.",
            duration: 10000,
          });
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [toast]);
  
  // Effect to check if QR is not scanned after time expires
  useEffect(() => {
    if (isPastEndTime && !qrScanned) {
      // Calculate fine after 5 minutes of grace period
      const fineTimer = setTimeout(() => {
        setFine(10);
        toast({
          variant: "destructive",
          title: "Parking Fine Applied",
          description: "A fine of 10 AED has been applied for not scanning the QR code at exit.",
          duration: 10000,
        });
      }, 5 * 60 * 1000); // 5 minutes grace period
      
      return () => clearTimeout(fineTimer);
    }
  }, [isPastEndTime, qrScanned, toast]);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const formatTime = (time: { hours: number, minutes: number, seconds: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };
  
  const handleScanQr = () => {
    // In a real app, this would verify the QR scan with the backend
    setQrScanned(true);
    toast({
      title: "QR Code Scanned",
      description: "Thank you for using our parking service!",
      duration: 5000,
    });
  };
  
  const handleEndSession = () => {
    // In a real app, this would end the session in the backend
    navigate('/book');
  };
  
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
            <div className="text-3xl font-mono font-semibold">{formatTime(timeLeft)}</div>
            <p className="text-sm text-muted-foreground">Time remaining</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isPastEndTime && !qrScanned && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-3">
                <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Action Required</p>
                  <p className="text-sm text-red-600">Please scan the QR code at the exit gate to avoid a fine.</p>
                  {fine > 0 && (
                    <p className="font-medium text-red-800 mt-2">Fine: {fine} AED applied</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-muted-foreground">{formatDate(booking.date)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-muted-foreground">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted-foreground">Zone {booking.zone}, Spot {booking.spot}</p>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-center font-medium mb-3">Access QR Code</p>
              <div className="flex justify-center">
                <img 
                  src={booking.qrCode} 
                  alt="QR Code for parking access" 
                  className="w-40 h-40 border border-border rounded-md p-2"
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">Booking ID: {booking.id}</p>
              
              {/* Test button to simulate QR scanning - in real app this would be handled at exit gate */}
              {!qrScanned && (
                <div className="mt-4">
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={handleScanQr}
                  >
                    Simulate QR Scan at Exit
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex-col gap-3">
            <Button 
              className="w-full bg-spoton-purple hover:bg-spoton-purple-dark"
              onClick={() => navigate('/book')}
            >
              Extend Time
            </Button>
            
            <Button 
              variant="outline"
              className="w-full text-destructive border-destructive hover:bg-destructive/10"
              onClick={handleEndSession}
            >
              End Session Early
            </Button>
          </CardFooter>
        </Card>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
          <p className="font-medium">Tips:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>You'll receive a notification 10 minutes before expiry</li>
            <li>To avoid a 10 AED penalty, scan the QR code at the exit gate before leaving</li>
            <li>If you need more time, extend your session before it expires</li>
          </ul>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ActiveBookingPage;
