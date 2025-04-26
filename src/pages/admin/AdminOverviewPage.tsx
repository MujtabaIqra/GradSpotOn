import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const TOTAL_SPOTS = 250; // Set this to your actual total

const AdminOverviewPage = () => {
  const [occupancyPercent, setOccupancyPercent] = useState(0);
  const [occupiedCount, setOccupiedCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOccupancy = async () => {
      setLoading(true);
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('slot, building, start_time, duration_minutes, status, user_id')
        .eq('status', 'active');
      if (!error && bookings) {
        const now = new Date();
        const occupied = bookings.filter(bk => {
          const start = new Date(bk.start_time);
          const end = new Date(start.getTime() + bk.duration_minutes * 60000);
          return now >= start && now < end;
        });
        const uniqueOccupied = new Set(occupied.map(bk => `${bk.building}-${bk.slot}`));
        setOccupiedCount(uniqueOccupied.size);
        setOccupancyPercent((uniqueOccupied.size / TOTAL_SPOTS) * 100);
        // Active users
        const uniqueUsers = new Set(occupied.map(bk => bk.user_id));
        setActiveUsers(uniqueUsers.size);
      }
      setLoading(false);
    };
    fetchOccupancy();
  }, []);

  return (
    <div className="min-h-screen pb-16">
      <Header />
      <main className="p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
        </div>
        {/* ...other cards/tables... */}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AdminOverviewPage; 