
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar, Clock, MapPin } from 'lucide-react';

const ActiveBookingPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 45, seconds: 0 });
  const [progress, setProgress] = useState(65); // Mock progress percentage
  
  // Mock booking data
  const booking = {
    id: 'SPT-12345678',
    date: new Date().toISOString().split('T')[0],
    startTime: '13:00',
    endTime: '15:00',
    zone: 'B',
    spot: 'B-12',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SPOTON-ACTIVE'
  };
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
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
        
        return { hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const formatTime = (time: { hours: number, minutes: number, seconds: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
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
              className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-linear ${progress < 20 ? 'bg-red-500' : 'bg-spoton-purple'}`} 
              style={{ width: `${progress}%` }} 
            ></div>
          </div>
          
          <CardHeader className="text-center">
            <div className="text-3xl font-mono font-semibold">{formatTime(timeLeft)}</div>
            <p className="text-sm text-muted-foreground">Time remaining</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
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
            >
              End Session Early
            </Button>
          </CardFooter>
        </Card>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
          <p className="font-medium">Tips:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>You'll receive a notification 10 minutes before expiry</li>
            <li>To avoid a penalty, extend your session or vacate the spot before time expires</li>
          </ul>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ActiveBookingPage;
