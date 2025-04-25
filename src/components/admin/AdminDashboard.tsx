import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import AdminOverview from './AdminOverview';
import AdminParkingManagement from './AdminParkingManagement';
import AdminUserManagement from './AdminUserManagement';
import AdminViolations from './AdminViolations';
import AdminAnalytics from './AdminAnalytics';
import AdminJ2Parking from './AdminJ2Parking';

interface ParkingZone {
  id: string;
  name: string;
  building: string;
  total_spots: number;
  occupied_spots: number;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  zone_id: string;
  status: string;
  created_at: string;
}

interface Violation {
  id: string;
  user_id: string;
  zone_id: string;
  type: string;
  status: string;
  created_at: string;
}

interface Analytics {
  totalSpots: number;
  occupiedSpots: number;
  totalBookings: number;
  activeBookings: number;
  totalViolations: number;
  recentViolations: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [parkingZones, setParkingZones] = useState<ParkingZone[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalSpots: 0,
    occupiedSpots: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalViolations: 0,
    recentViolations: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch parking zones
      const { data: zones } = await supabase
        .from('parking_zones')
        .select('*');
      setParkingZones(zones || []);

      // Fetch users
      const { data: userData } = await supabase
        .from('profiles')
        .select('*');
      setUsers(userData || []);

      // Fetch bookings
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*');
      setBookings(bookingData || []);

      // Fetch violations
      const { data: violationData } = await supabase
        .from('violations')
        .select('*');
      setViolations(violationData || []);

      // Calculate analytics
      const totalSpots = zones?.reduce((sum, zone) => sum + zone.total_spots, 0) || 0;
      const occupiedSpots = zones?.reduce((sum, zone) => sum + zone.occupied_spots, 0) || 0;
      const totalBookings = bookingData?.length || 0;
      const activeBookings = bookingData?.filter(b => b.status === 'Active').length || 0;
      const totalViolations = violationData?.length || 0;
      const recentViolations = violationData?.filter(v => 
        new Date(v.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;

      setAnalytics({
        totalSpots,
        occupiedSpots,
        totalBookings,
        activeBookings,
        totalViolations,
        recentViolations
      });
    };

    fetchData();
  }, []);

  const updateZoneStatus = async (
    zoneId: number,
    status: "Open" | "Closed" | "Maintenance" | "Reserved",
    reason?: string,
    until?: string
  ) => {
    const { error } = await supabase
      .from('parking_zones')
      .update({ status, reason, until })
      .eq('id', zoneId);

    if (!error) {
      setParkingZones(prevZones => 
        prevZones.map(zone => 
          zone.id === zoneId.toString() ? { ...zone, status } : zone
        )
      );
    }
  };

  const refreshData = async () => {
    // Re-fetch all data
    const fetchData = async () => {
      // Fetch parking zones
      const { data: zones } = await supabase
        .from('parking_zones')
        .select('*');
      setParkingZones(zones || []);

      // Fetch users
      const { data: userData } = await supabase
        .from('profiles')
        .select('*');
      setUsers(userData || []);

      // Fetch bookings
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*');
      setBookings(bookingData || []);

      // Fetch violations
      const { data: violationData } = await supabase
        .from('violations')
        .select('*');
      setViolations(violationData || []);

      // Calculate analytics
      const totalSpots = zones?.reduce((sum, zone) => sum + zone.total_spots, 0) || 0;
      const occupiedSpots = zones?.reduce((sum, zone) => sum + zone.occupied_spots, 0) || 0;
      const totalBookings = bookingData?.length || 0;
      const activeBookings = bookingData?.filter(b => b.status === 'Active').length || 0;
      const totalViolations = violationData?.length || 0;
      const recentViolations = violationData?.filter(v => 
        new Date(v.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;

      setAnalytics({
        totalSpots,
        occupiedSpots,
        totalBookings,
        activeBookings,
        totalViolations,
        recentViolations
      });
    };
    await fetchData();
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="j2-parking">J2 Parking</TabsTrigger>
          <TabsTrigger value="parking">Parking</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminOverview 
            parkingZones={parkingZones}
            users={users}
            bookings={bookings}
            violations={violations}
            analytics={analytics}
          />
        </TabsContent>

        <TabsContent value="j2-parking">
          <AdminJ2Parking />
        </TabsContent>

        <TabsContent value="parking">
          <AdminParkingManagement 
            parkingZones={parkingZones}
            updateZoneStatus={updateZoneStatus}
          />
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement users={users} />
        </TabsContent>

        <TabsContent value="violations">
          <AdminViolations 
            violations={violations}
            refreshData={refreshData}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AdminAnalytics 
            parkingZones={parkingZones}
            analytics={analytics}
            bookings={bookings}
            violations={violations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard; 