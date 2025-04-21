
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar, Clock, MapPin } from 'lucide-react';

const BookingHistoryPage = () => {
  const navigate = useNavigate();
  
  // Mock booking history data
  const bookings = [
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
      status: 'completed'
    }
  ];
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="min-h-screen pb-16">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Booking History</h1>
          <p className="text-muted-foreground">Your past parking sessions</p>
        </div>
        
        <div className="space-y-4 mb-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <div className={`h-1 w-full ${booking.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`} />
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
                  <Button variant="ghost" size="sm" className="text-spoton-purple">Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
