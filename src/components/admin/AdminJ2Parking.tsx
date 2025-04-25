import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Users, Car, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ParkingZone {
  id: number;
  zone_name: string;
  total_spots: number;
  occupied_spots: number;
  status: string;
  last_updated: string;
}

interface Booking {
  id: string;
  user_id: string;
  user_name: string;
  spot_number: number;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
}

const AdminJ2Parking = () => {
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>('J2-A');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch J2 parking zones with actual capacity
        const { data: zonesData, error: zonesError } = await supabase
          .from('parking_zones')
          .select('*')
          .eq('building', 'J2')
          .eq('total_spots', 40); // Filter for zones with 40 slots

        if (zonesError) throw zonesError;
        setZones(zonesData || []);

        // Fetch current bookings for J2 with user information
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            user_id,
            spot_number,
            start_time,
            end_time,
            status,
            created_at,
            profiles:user_id (
              full_name
            )
          `)
          .eq('zone_id', zonesData?.[0]?.id)
          .eq('status', 'Active')
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;

        // Transform the data to include user information
        const formattedBookings: Booking[] = (bookingsData || []).map((booking: any) => ({
          id: booking.id,
          user_id: booking.user_id,
          user_name: booking.profiles?.full_name || 'Unknown',
          spot_number: booking.spot_number,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status,
          created_at: booking.created_at
        }));

        setBookings(formattedBookings);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getZoneStats = (zoneName: string) => {
    const zone = zones.find(z => z.zone_name === zoneName);
    if (!zone) return { occupancy: 0, available: 0 };

    // Calculate occupancy based on 40 total slots
    const totalSlots = 40;
    const occupancy = Math.round((zone.occupied_spots / totalSlots) * 100);
    return {
      occupancy,
      available: totalSlots - zone.occupied_spots
    };
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Zone Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map((zone) => {
          const stats = getZoneStats(zone.zone_name);
          return (
            <Card key={zone.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{zone.zone_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Occupancy</span>
                    <span className="font-medium">{stats.occupancy}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Available Spots</span>
                    <span className="font-medium">{stats.available}</span>
                  </div>
                  {stats.occupancy > 80 && (
                    <div className="flex items-center text-amber-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      High Occupancy
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Current Student Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Spot Number</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Booked At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.user_name}</TableCell>
                    <TableCell>{booking.spot_number}</TableCell>
                    <TableCell>{new Date(booking.start_time).toLocaleString()}</TableCell>
                    <TableCell>{new Date(booking.end_time).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === 'Active' ? 'bg-green-100 text-green-800' :
                        booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(booking.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No active bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Occupied Spots</p>
                <p className="text-2xl font-bold">{zones.reduce((sum, zone) => sum + zone.occupied_spots, 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Peak Hours</p>
                <p className="text-2xl font-bold">
                  {bookings.length > 0 ? 
                    new Date(bookings[0].start_time).getHours() + ':00' : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">{zones.reduce((sum, zone) => sum + zone.total_spots, 0)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminJ2Parking; 