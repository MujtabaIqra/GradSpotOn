
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar, Clock, MapPin, Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBookingHistory } from '@/hooks/useBookingHistory';

const BookingHistoryPage = () => {
  const navigate = useNavigate();
  const {
    bookings: filteredBookings,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter
  } = useBookingHistory();
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const handleViewDetails = (bookingId: string) => {
    // Future implementation of booking details
    console.log('Viewing details for booking:', bookingId);
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
