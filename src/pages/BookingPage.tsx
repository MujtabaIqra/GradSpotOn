
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const buildings = [
  { value: 'J2-A', label: 'J2-A (Main Engineering Bldg)' },
  { value: 'J2-B', label: 'J2-B (Science Bldg)' },
  { value: 'J2-C', label: 'J2-C (Library Bldg)' },
];

const SLOTS_PER_BUILDING = 40;

const BookingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<string>('60'); // duration in minutes
  const [building, setBuilding] = useState<string>('J2-A');
  const [slot, setSlot] = useState<string>('1');
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Get logged in user
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  // Fetch available slots for selected building/date/time
  useEffect(() => {
    const fetchAvailable = async () => {
      setLoading(true);
      // Calculate timestamp for the query
      const selectedDateTime = new Date(`${date}T${startTime}`);
      // Fetch bookings that overlap with this slot start
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('slot, start_time, duration_minutes')
        .eq('building', building)
        .then(({ data, error }) => {
          if (error) return { data: [], error };
          return { data, error: null };
        });
        
      let bookedSlots: Set<number> = new Set();
      if (bookings && bookings.length > 0) {
        // Mark slots as booked if there's any time overlap
        for (let bk of bookings) {
          const startDt = new Date(bk.start_time);
          const endDt = new Date(startDt.getTime() + bk.duration_minutes * 60000);
          const reqDt = new Date(selectedDateTime);
          const reqEndDt = new Date(reqDt.getTime() + Number(duration) * 60000);
          // Check overlap
          if (
            (reqDt < endDt) && (startDt < reqEndDt)
          ) {
            bookedSlots.add(bk.slot);
          }
        }
      }
      const slots = [];
      for (let s = 1; s <= SLOTS_PER_BUILDING; ++s) {
        if (!bookedSlots.has(s)) slots.push(s);
      }
      setAvailableSlots(slots);
      setSlot(slots.length > 0 ? String(slots[0]) : '');
      setLoading(false);
    };
    fetchAvailable();
    // eslint-disable-next-line
  }, [building, date, startTime, duration]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to book a parking slot.",
        variant: "destructive"
      });
      return;
    }
    if (!slot) {
      toast({
        title: "No slots available",
        description: "No parking slot is available for this time.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    // Compose start timestamp
    const startTimestamp = new Date(`${date}T${startTime}:00`);
    // Insert booking to Supabase
    const { error } = await supabase.from('bookings').insert({
      user_id: userId,
      building,
      slot: Number(slot),
      start_time: startTimestamp,
      duration_minutes: Number(duration)
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Booking Failed",
        description: error.message || "There was a problem placing your booking.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Booking Successful",
        description: `Slot #${slot} at ${building} has been reserved for you.`,
      });
      navigate('/confirmation', {
        state: {
          date,
          startTime,
          duration: Number(duration) / 60, // hours for display
          building,
          slot,
        }
      });
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Header />

      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Book a Parking Slot</h1>
          <p className="text-muted-foreground">Reserve your spot in advance</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Building, Date & Time</CardTitle>
            <CardDescription>Choose your building and an available slot</CardDescription>
          </CardHeader>
          <form onSubmit={handleBooking}>
            <CardContent className="space-y-4">
              {/* Building */}
              <div className="space-y-2">
                <label htmlFor="building" className="block text-sm font-medium">
                  Building
                </label>
                <Select value={building} onValueChange={setBuilding}>
                  <SelectTrigger id="building" className="w-full">
                    <SelectValue placeholder="Choose building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map(b => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
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

              {/* Start Time */}
              <div className="space-y-2">
                <label htmlFor="startTime" className="block text-sm font-medium">
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label htmlFor="duration" className="block text-sm font-medium">
                  Duration (minutes)
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration" className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {[60, 120, 180, 240, 300, 360].map(val => (
                      <SelectItem key={val} value={String(val)}>
                        {val / 60} {val === 60 ? 'hour' : 'hours'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Slot */}
              <div className="space-y-2">
                <label htmlFor="slot" className="block text-sm font-medium">
                  Parking Slot
                </label>
                {loading ? (
                  <div className="text-muted-foreground text-sm">Loading slots...</div>
                ) : (
                  <Select value={slot} onValueChange={setSlot} disabled={availableSlots.length === 0}>
                    <SelectTrigger id="slot" className="w-full">
                      <SelectValue placeholder="Available slots" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.length === 0 ? (
                        <SelectItem value="">No slots</SelectItem>
                      ) : (
                        availableSlots.map(num => (
                          <SelectItem key={num} value={String(num)}>
                            Slot #{num}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit"
                className="w-full bg-spoton-purple hover:bg-spoton-purple-dark"
                disabled={loading || !slot}
              >
                {loading ? 'Booking...' : 'Book Parking Slot'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Hours:</strong> 7:00 AM - 10:00 PM</p>
            <p><strong>Rates:</strong> Free for students and staff with valid ID</p>
            <p><strong>Slots per building:</strong> 40</p>
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

