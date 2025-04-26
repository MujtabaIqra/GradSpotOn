import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Database } from '@/integrations/supabase/types';

const TOTAL_SPOTS = 250; // Set this to your actual total

// Define the type for bookings from database
type Booking = Database['public']['Tables']['bookings']['Row'];

const AdminDashboardPage = () => {
  const [occupancyPercent, setOccupancyPercent] = useState(0);
  const [occupiedCount, setOccupiedCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [violations, setViolations] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('zone_id, spot_number, start_time, end_time, status, user_id');

      console.log('Bookings data:', bookings);
      console.log('Error:', error);

      if (!error && bookings) {
        const now = new Date();
        console.log('Current time:', now);
        
        // Occupied slots and active users
        const activeBookings = bookings.filter(bk => {
          if (bk.status !== 'Active') return false;
          const start = new Date(bk.start_time);
          const end = new Date(bk.end_time);
          return now >= start && now < end;
        });

        console.log('Active bookings:', activeBookings);

        const uniqueOccupied = new Set(activeBookings.map(bk => `${bk.zone_id}-${bk.spot_number}`));
        console.log('Unique occupied spots:', uniqueOccupied);
        
        setOccupiedCount(uniqueOccupied.size);
        setOccupancyPercent((uniqueOccupied.size / TOTAL_SPOTS) * 100);

        const uniqueUsers = new Set(activeBookings.map(bk => bk.user_id));
        console.log('Unique active users:', uniqueUsers);
        
        setActiveUsers(uniqueUsers.size);

        // Violations: status 'Expired'
        const violationCount = bookings.filter(bk => bk.status === 'Expired').length;
        console.log('Violation count:', violationCount);
        
        setViolations(violationCount);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen pb-16">
      <Header />
      <main className="p-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Parking Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{occupancyPercent.toFixed(1)}%</div>
                  <div className="text-muted-foreground">{occupiedCount} of {TOTAL_SPOTS} spots occupied</div>
                  <div className="w-full bg-gray-200 rounded h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded"
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{activeUsers}</div>
                  <div className="text-muted-foreground">users with an active booking right now</div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Violations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{violations}</div>
                  <div className="text-muted-foreground">expired bookings</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Placeholder for recent bookings and analytics */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Coming soon: Table of recent bookings</div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Coming soon: Analytics charts and trends</div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AdminDashboardPage; 