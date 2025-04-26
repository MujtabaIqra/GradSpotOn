import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

interface AdminBooking {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  building: string;
  slot: number;
  start_time: string;
  duration_minutes: number;
  status: string;
}

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          building,
          slot,
          start_time,
          duration_minutes,
          status,
          profiles:user_id (full_name, email)
        `)
        .order('start_time', { ascending: false });
      if (!error && data) {
        setBookings(
          data.map((b: any) => ({
            id: b.id,
            user_id: b.user_id,
            user_email: b.profiles?.email,
            user_name: b.profiles?.full_name,
            building: b.building,
            slot: b.slot,
            start_time: b.start_time,
            duration_minutes: b.duration_minutes,
            status: b.status,
          }))
        );
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const formatTime = (iso: string, duration: number) => {
    const start = new Date(iso);
    const end = new Date(start.getTime() + duration * 60000);
    return `${start.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${end.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  };

  return (
    <div className="min-h-screen pb-16">
      <Header />
      <main className="p-4 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 border">User</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Building</th>
                      <th className="p-2 border">Slot</th>
                      <th className="p-2 border">Time</th>
                      <th className="p-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b">
                        <td className="p-2 border">{b.user_name || b.user_id}</td>
                        <td className="p-2 border">{b.user_email || '-'}</td>
                        <td className="p-2 border">{b.building}</td>
                        <td className="p-2 border">{b.slot}</td>
                        <td className="p-2 border">{formatTime(b.start_time, b.duration_minutes)}</td>
                        <td className="p-2 border capitalize">{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AdminBookingsPage; 