import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar, Clock, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import ParkingMap from '@/components/ParkingMap';

// Ensure our building type is correctly typed to match Supabase enum
type BuildingCode = Database['public']['Enums']['building_code'];

const buildings = [
  { value: 'J2-A' as BuildingCode, label: 'J2-A (Law and Arts)' },
  { value: 'J2-B' as BuildingCode, label: 'J2-B (Business Administration)' },
  { value: 'J2-C' as BuildingCode, label: 'J2-C (IT Department)' },
];

const SLOTS_PER_BUILDING = 40;
const MAX_DURATION_MINUTES = 90; // Maximum booking duration of 1 hour 30 minutes

const BookingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<string>('60'); // duration in minutes
  const [building, setBuilding] = useState<BuildingCode>('J2-A');
  const [slot, setSlot] = useState<string>('1');
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Get logged in user
  const [userId, setUserId] = useState<string | null>(null);

  // To store the channel instance so we can unsubscribe on cleanup
  const realtimeChannel = useRef<any>(null);

  // Helper to update slots based on bookings data & desired time window
  const getAvailableSlots = (
    bookings: { slot: number; start_time: string; duration_minutes: number }[],
    targetDate: string,
    targetTime: string,
    periodMinutes: number
  ) => {
    // Calculate timestamp for the query
    const selectedDateTime = new Date(`${targetDate}T${targetTime}`);
    let bookedSlots: Set<number> = new Set();
    // Mark slots as booked if there's any time overlap
    for (let bk of bookings) {
      const startDt = new Date(bk.start_time);
      const endDt = new Date(startDt.getTime() + bk.duration_minutes * 60000);
      const reqDt = new Date(selectedDateTime);
      const reqEndDt = new Date(reqDt.getTime() + Number(periodMinutes) * 60000);
      // Check overlap
      if (
        (reqDt < endDt) && (startDt < reqEndDt)
      ) {
        bookedSlots.add(bk.slot);
      }
    }
    const slots: number[] = [];
    for (let s = 1; s <= SLOTS_PER_BUILDING; ++s) {
      if (!bookedSlots.has(s)) slots.push(s);
    }
    return slots;
  };

  // Fetch available slots for selected building/date/time
  const fetchAvailable = async () => {
    setLoading(true);
    const selectedDateTime = new Date(`${date}T${startTime}`);
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('slot, start_time, duration_minutes, status')
      .eq('building', building);

    let slots: number[] = [];
    if (!error && bookings) {
      // Only consider bookings with status 'active' or 'upcoming'
      const activeBookings = bookings.filter(
        (bk: any) => bk.status === 'active' || bk.status === 'upcoming' || !bk.status // fallback for legacy
      );
      slots = getAvailableSlots(activeBookings, date, startTime, Number(duration));
    }
    setAvailableSlots(slots);
    setSlot(slots.length > 0 ? String(slots[0]) : '');
    setLoading(false);
  };

  // Get user on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to book a parking slot.",
          variant: "destructive"
        });
        navigate('/login');
      } else {
        setUserId(data.user.id);
      }
    };
    checkUser();
  }, [navigate, toast]);

  // Setup real-time channel and listen for booking changes
  useEffect(() => {
    fetchAvailable(); // Initial fetch

    // Clean up previous channel
    if (realtimeChannel.current) {
      supabase.removeChannel(realtimeChannel.current);
      realtimeChannel.current = null;
    }

    // Setup new channel for bookings on this building
    const channel = supabase
      .channel(`realtime:bookings:${building}`)
      .on(
        'postgres_changes',
        {
          event: '*', // all ops
          schema: 'public',
          table: 'bookings',
          filter: `building=eq.${building}`
        },
        (payload) => {
          // Every change triggers the slot reload for this building
          fetchAvailable();
        }
      )
      .subscribe();

    realtimeChannel.current = channel;

    // Cleanup on unmount or dependency change
    return () => {
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
        realtimeChannel.current = null;
      }
    };
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
      navigate('/login');
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
    
    // Check if duration exceeds maximum allowed
    if (Number(duration) > MAX_DURATION_MINUTES) {
      toast({
        title: "Duration Exceeded",
        description: `Maximum booking duration is ${MAX_DURATION_MINUTES/60} hours.`,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    // Compose start timestamp
    const startTimestamp = new Date(`${date}T${startTime}:00`);
    // Insert booking to Supabase - fix the structure to match what's expected
    const { error } = await supabase.from('bookings').insert({
      user_id: userId,
      building: building,
      slot: Number(slot),
      start_time: startTimestamp.toISOString(),
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
          zone: building,
          spot: slot,
        }
      });
    }
  };

  // Handle slot selection from the map
  const handleSlotSelect = (slotNumber: number) => {
    if (availableSlots.includes(slotNumber)) {
      setSlot(String(slotNumber));
    } else {
      toast({
        title: "Slot Unavailable",
        description: "This parking slot is already booked for the selected time.",
        variant: "destructive",
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
            <CardTitle>
              Select Building, Date & Time
            </CardTitle>
            <CardDescription>
              <span>Choose your building and an available slot.</span><br/>
              <span className="text-xs font-semibold text-spoton-purple-darkest mt-2 block">
                You are booking for: 
                <span className="ml-1">
                  {buildings.find((b) => b.value === building)?.label || building}
                </span>
              </span>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleBooking}>
            <CardContent className="space-y-4">
              {/* Building */}
              <div className="space-y-2">
                <label htmlFor="building" className="block text-sm font-medium">
                  Building
                </label>
                <Select 
                  value={building} 
                  onValueChange={(value: string) => setBuilding(value as BuildingCode)}
                >
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
                  Duration (maximum 1 hour 30 minutes)
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration" className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1 hour 30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Parking Map */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Parking Map - Click to Select a Slot</h3>
                </div>
                <ParkingMap 
                  availableSlots={availableSlots} 
                  selectedSlot={slot ? parseInt(slot) : undefined}
                  onSlotSelect={handleSlotSelect}
                  loading={loading}
                />
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
            <p><strong>Time Limit:</strong> Maximum 1 hour 30 minutes per booking</p>
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
