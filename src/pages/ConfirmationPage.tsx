
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
};

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  
  useEffect(() => {
    if (location.state) {
      setBookingDetails(location.state as BookingDetails);
      // Mock QR code generation
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SPOTON-${Date.now()}`);
    } else {
      navigate('/book');
    }
  }, [location, navigate]);
  
  if (!bookingDetails) {
    return <div className="p-4">Loading...</div>;
  }
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const calculateEndTime = (startTime: string, durationHours: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes, 0);
    endDate.setTime(endDate.getTime() + durationHours * 60 * 60 * 1000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };
  
  const endTime = calculateEndTime(bookingDetails.startTime, bookingDetails.duration);
  
  return (
    <div className="min-h-screen pb-16">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your parking spot has been reserved</p>
        </div>
        
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-spoton-purple to-spoton-blue p-4 text-white">
            <h2 className="text-lg font-semibold">Ajman University</h2>
            <p className="text-sm opacity-90">Parking Reservation</p>
          </div>
          
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
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
                  {bookingDetails.startTime} - {endTime} ({bookingDetails.duration} {bookingDetails.duration === 1 ? 'hour' : 'hours'})
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted-foreground">Zone {bookingDetails.zone}, Spot {bookingDetails.spot}</p>
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
              View Active Bookings
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
