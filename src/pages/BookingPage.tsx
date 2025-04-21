
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar, Clock } from 'lucide-react';

const BookingPage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<string>('1');
  const [zone, setZone] = useState<string>('A');
  
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];
  
  const durationOptions = ['1', '2', '3', '4', '5', '6'];
  const zones = ['A', 'B', 'C', 'D'];
  
  const handleBooking = () => {
    // Mock booking logic
    navigate('/confirmation', {
      state: {
        date,
        startTime,
        duration: Number(duration),
        zone,
        spot: `${zone}-${Math.floor(Math.random() * 20) + 1}`
      }
    });
  };
  
  return (
    <div className="min-h-screen pb-16">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Book a Parking Spot</h1>
          <p className="text-muted-foreground">Reserve your spot in advance</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Date & Time</CardTitle>
            <CardDescription>Choose when you need parking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="time" className="block text-sm font-medium">
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger id="time" className="pl-10 w-full">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="duration" className="block text-sm font-medium">
                  Duration (hours)
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration" className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map(hours => (
                      <SelectItem key={hours} value={hours}>{hours} {hours === '1' ? 'hour' : 'hours'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="zone" className="block text-sm font-medium">
                Parking Zone
              </label>
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger id="zone" className="w-full">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(z => (
                    <SelectItem key={z} value={z}>Zone {z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-spoton-purple hover:bg-spoton-purple-dark"
              onClick={handleBooking}
            >
              Find Available Spots
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Parking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Hours:</strong> 7:00 AM - 10:00 PM</p>
            <p><strong>Rates:</strong> Free for students and staff with valid ID</p>
            <p><strong>Time Limit:</strong> Maximum 6 hours per booking</p>
            <p className="text-muted-foreground mt-2">
              Spots can be reserved up to 7 days in advance. Cancellations must be made at least 1 hour before the reservation time.
            </p>
          </CardContent>
        </Card>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default BookingPage;
