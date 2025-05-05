
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, Users, Car, AlertCircle, 
  TrendingUp 
} from 'lucide-react';
import { ParkingZone, User, Booking, Violation, Analytics } from '@/hooks/admin/types';

interface AdminOverviewProps {
  parkingZones: ParkingZone[];
  users: User[];
  bookings: Booking[];
  violations: Violation[];
  analytics: Analytics | null;
  loading: boolean;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({
  parkingZones,
  users,
  bookings,
  violations,
  analytics,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // Calculate total occupancy
  const totalSpots = parkingZones.reduce((acc, zone) => acc + zone.total_spots, 0);
  const occupiedSpots = parkingZones.reduce((acc, zone) => acc + zone.occupied_spots, 0);
  const totalOccupancyRate = (occupiedSpots / totalSpots) * 100;

  // Get high occupancy zones
  const highOccupancyZones = parkingZones.filter(zone => 
    (zone.occupied_spots / zone.total_spots) * 100 >= 80
  );

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {highOccupancyZones.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Occupancy Alert</AlertTitle>
          <AlertDescription>
            The following zones are at or above 80% capacity:
            {highOccupancyZones.map(zone => (
              <span key={zone.id} className="block">
                • {zone.zone_name}: {Math.round((zone.occupied_spots / zone.total_spots) * 100)}% occupied
              </span>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {violations.filter(v => !v.is_paid).length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pending Violations</AlertTitle>
          <AlertDescription>
            There are {violations.filter(v => !v.is_paid).length} unpaid violations
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Occupancy</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalOccupancyRate)}%</div>
            <Progress 
              value={totalOccupancyRate} 
              className={`mt-2 ${totalOccupancyRate >= 80 ? 'bg-red-500' : ''}`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {occupiedSpots} of {totalSpots} spots occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'Active').length}
            </div>
            <Progress 
              value={(bookings.filter(b => b.status === 'Active').length / totalSpots) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {users.length} total registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Analytics</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.total_bookings || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Bookings today
            </p>
            <p className="text-xs text-muted-foreground">
              Peak occupancy: {Math.round(analytics?.peak_occupancy_rate || 0)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.slice(0, 5).map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    {new Date(booking.start_time).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>{booking.user?.full_name || 'Unknown'}</TableCell>
                  <TableCell>Parking Booking</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      booking.status === 'Active' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Zone Status */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {parkingZones.map(zone => {
              const occupancyRate = (zone.occupied_spots / zone.total_spots) * 100;
              return (
                <div key={zone.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{zone.zone_name}</span>
                    <span>{Math.round(occupancyRate)}%</span>
                  </div>
                  <Progress 
                    value={occupancyRate} 
                    className={`h-2 ${occupancyRate >= 80 ? 'bg-red-500' : ''}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {zone.occupied_spots} of {zone.total_spots} spots
                    </span>
                    <span>
                      {zone.status}
                      {zone.status_reason && ` - ${zone.status_reason}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
