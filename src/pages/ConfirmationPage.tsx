import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar, Clock, MapPin } from 'lucide-react';

type BookingDetails = {
  date: string;
  startTime: string;
  duration: number;
  zone: string;
  spot: string;
  locationDescription?: string;
};

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(100);

  const bookingDetails = location.state as BookingDetails;
  if (!bookingDetails) {
    navigate('/book');
    return null;
  }

  // Calculate end time
  const startTime = new Date(`${bookingDetails.date}T${bookingDetails.startTime}`);
  const endTime = new Date(startTime.getTime() + bookingDetails.duration * 60 * 60 * 1000);
  const formattedEndTime = endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Mock QR code for now
  const qrCode = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SPOTON-CONFIRMED';

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setProgress(0);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });

      // Update progress
      const totalDuration = bookingDetails.duration * 60 * 60; // duration in seconds
      const remainingSeconds = hours * 3600 + minutes * 60 + seconds;
      const newProgress = (remainingSeconds / totalDuration) * 100;
      setProgress(newProgress);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, bookingDetails.duration]);

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
          <h1 className="text-2xl font-bold mb-1">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your parking spot has been reserved</p>
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
                <p className="text-muted-foreground">{formatDate(bookingDetails.date)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-muted-foreground">
                  {bookingDetails.startTime} - {formattedEndTime} ({bookingDetails.duration} {bookingDetails.duration === 1 ? 'hour' : 'hours'})
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted-foreground">Zone {bookingDetails.zone}, Spot {bookingDetails.spot}</p>
                {bookingDetails.locationDescription && (
                  <p className="text-xs mt-0.5 text-spoton-purple font-medium">
                    {bookingDetails.locationDescription}
                  </p>
                )}
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-center font-medium mb-3">Scan at Entry Gate</p>
              <div className="flex justify-center">
                <img 
                  src={qrCode} 
                  alt="QR Code for parking access" 
                  className="w-40 h-40 border border-border rounded-md p-2"
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">Booking ID: SPT-{Date.now().toString().slice(-8)}</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex-col gap-3">
            <Button 
              className="w-full bg-spoton-purple hover:bg-spoton-purple-dark"
              onClick={() => navigate('/active')}
            >
              View Active Booking
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
        
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <p className="font-medium">Important:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Arrive within 15 minutes of your start time</li>
            <li>Your spot will be released after this grace period</li>
            <li>You'll receive reminders 30 minutes before expiry</li>
          </ul>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ConfirmationPage;
