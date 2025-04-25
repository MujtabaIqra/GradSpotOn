
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar, Clock, MapPin, Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  zone: string;
  spot: string;
  status: string;
  fine?: number;
}

const BookingHistoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Fetch booking history
  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        // In a real app, fetch the actual booking data from Supabase
        // This is mock data for demonstration
        const mockBookingsData = [
          {
            id: 'SPT-87654321',
            date: '2025-04-20',
            startTime: '10:00',
            endTime: '12:00',
            zone: 'A',
            spot: 'A-15',
            status: 'completed'
          },
          {
            id: 'SPT-76543210',
            date: '2025-04-18',
            startTime: '14:30',
            endTime: '16:30',
            zone: 'C',
            spot: 'C-07',
            status: 'completed'
          },
          {
            id: 'SPT-65432109',
            date: '2025-04-15',
            startTime: '09:00',
            endTime: '10:00',
            zone: 'B',
            spot: 'B-22',
            status: 'canceled'
          },
          {
            id: 'SPT-54321098',
            date: '2025-04-10',
            startTime: '13:00',
            endTime: '15:00',
            zone: 'D',
            spot: 'D-04',
            status: 'completed',
            fine: 10
          }
        ];
        
        setBookings(mockBookingsData);
        setFilteredBookings(mockBookingsData);
      } catch (error) {
        console.error("Error fetching booking history:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your booking history."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookingHistory();
    
    // Set up realtime listener for booking updates
    // In a real app, we would listen to Supabase changes
    const channel = supabase
      .channel('public:bookings')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings' 
        }, 
        (payload) => {
          console.log('Booking update received:', payload);
          // In a real implementation, we would update the bookings state based on the payload
          toast({
            title: "Booking Updated",
            description: "Your booking history has been updated.",
            duration: 3000,
          });
          // fetchBookingHistory(); // Re-fetch data on update
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, toast]);
  
  // Apply filters and search
  useEffect(() => {
    let result = [...bookings];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        booking =>
          booking.id.toLowerCase().includes(query) ||
          booking.zone.toLowerCase().includes(query) ||
          booking.spot.toLowerCase().includes(query) ||
          booking.date.includes(query)
      );
    }
    
    setFilteredBookings(result);
  }, [bookings, statusFilter, searchQuery]);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const handleViewDetails = (bookingId: string) => {
    // In a real app, navigate to booking detail page
    toast({
      title: "Booking Details",
      description: `Viewing details for booking ${bookingId}`,
    });
  };
  
  return (
    <div className="min-h-screen pb-16">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Booking History</h1>
          <p className="text-muted-foreground">Your past parking sessions</p>
        </div>
        
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <p>Loading booking history...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className={`h-1 w-full ${
                    booking.status === 'completed' ? 'bg-green-500' : 
                    booking.status === 'canceled' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>{formatDate(booking.date)}</span>
                      <span className="text-sm px-2 py-1 rounded-full bg-muted capitalize">
                        {booking.status}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground mr-2" />
                      <span>{booking.startTime} - {booking.endTime}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
                      <span>Zone {booking.zone}, Spot {booking.spot}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 text-sm">
                      <span className="text-muted-foreground">{booking.id}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-spoton-purple"
                        onClick={() => handleViewDetails(booking.id)}
                      >
                        Details
                      </Button>
                    </div>
                    {booking.fine && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <p className="font-medium">Fine applied: {booking.fine} AED</p>
                        <p className="text-xs text-red-600">Reason: QR code not scanned at exit</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            className="border-spoton-purple text-spoton-purple hover:bg-spoton-purple/10"
            onClick={() => navigate('/book')}
          >
            Book New Parking
          </Button>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default BookingHistoryPage;
