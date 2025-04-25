import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useActiveBooking } from "@/hooks/useActiveBooking";

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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatTime = (time: { hours: number, minutes: number, seconds: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No active booking found</p>
      </div>
    );
  }

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
            <div className="mt-2 text-sm">
              <p className="font-medium">Current Date & Time</p>
              <p className="text-muted-foreground">{new Date().toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}</p>
            </div>
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
              onClick={() => window.location.assign('/book')}
            >
              Extend Time
            </Button>
            
            <Button 
              variant="outline"
              className="w-full text-destructive border-destructive hover:bg-destructive/10"
              onClick={handleEndSessionEarly}
            >
              End Session Early
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default ActiveBookingPage;
