
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface ParkingZone {
  id: number;
  building: string;
  zone_name: string;
  total_spots: number;
  shaded_spots: number;
  status: 'Open' | 'Closed' | 'Maintenance' | 'Reserved';
  status_reason?: string;
  status_until?: string;
  occupancy_rate?: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  zone_id: number;
  spot_number: number;
  start_time: string;
  end_time: string;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Expired';
  user?: {
    full_name: string;
    email: string;
  };
}

interface Violation {
  id: string;
  booking_id: string;
  user_id: string;
  violation_type: string;
  description: string;
  fine_amount: number;
  is_paid: boolean;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

interface Analytics {
  total_bookings: number;
  peak_occupancy_rate: number;
  avg_occupancy_rate: number;
  total_violations: number;
  total_fine_amount: number;
}

export function useAdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [parkingZones, setParkingZones] = useState<ParkingZone[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Fetch parking zones with current occupancy
  const fetchParkingZones = async () => {
    try {
      const { data: zones, error: zonesError } = await supabase
        .from('parking_zones')
        .select('*');

      if (zonesError) throw zonesError;

      // Get current occupancy for each zone
      const zonesWithOccupancy = await Promise.all(
        zones.map(async (zone) => {
          const { data: occupancy } = await supabase
            .rpc('get_current_occupancy', { zone_id: zone.id });
          
          return {
            ...zone,
            occupancy_rate: occupancy?.[0]?.occupancy_rate || 0
          };
        })
      );

      setParkingZones(zonesWithOccupancy);

      // Check for high occupancy zones and notify
      zonesWithOccupancy.forEach(zone => {
        if (zone.occupancy_rate >= 80) {
          toast({
            title: "High Occupancy Alert",
            description: `${zone.zone_name} is at ${Math.round(zone.occupancy_rate)}% capacity`,
            variant: "destructive",
          });
        }
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch parking zones",
        variant: "destructive",
      });
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  // Fetch recent bookings
  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBookings(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    }
  };

  // Fetch violations
  const fetchViolations = async () => {
    try {
      const { data, error } = await supabase
        .from('violations')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setViolations(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch violations",
        variant: "destructive",
      });
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('parking_analytics')
        .select('*')
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setAnalytics(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics",
        variant: "destructive",
      });
    }
  };

  // Update zone status
  const updateZoneStatus = async (
    zoneId: number,
    status: 'Open' | 'Closed' | 'Maintenance' | 'Reserved',
    reason?: string,
    until?: string
  ) => {
    try {
      const { error } = await supabase
        .from('parking_zones')
        .update({
          status,
          status_reason: reason,
          status_until: until,
          updated_at: new Date().toISOString()
        })
        .eq('id', zoneId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Zone status updated to ${status}`,
      });

      // Refresh zones
      await fetchParkingZones();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update zone status",
        variant: "destructive",
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchParkingZones(),
        fetchUsers(),
        fetchBookings(),
        fetchViolations(),
        fetchAnalytics()
      ]);
      setLoading(false);
    };

    fetchData();

    // Set up real-time subscriptions
    const parkingZonesSubscription = supabase
      .channel('parking_zones_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_zones' }, 
        () => fetchParkingZones()
      )
      .subscribe();

    const bookingsSubscription = supabase
      .channel('bookings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, 
        () => fetchBookings()
      )
      .subscribe();

    const violationsSubscription = supabase
      .channel('violations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'violations' }, 
        () => fetchViolations()
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      parkingZonesSubscription.unsubscribe();
      bookingsSubscription.unsubscribe();
      violationsSubscription.unsubscribe();
    };
  }, []);

  return {
    loading,
    parkingZones,
    users,
    bookings,
    violations,
    analytics,
    updateZoneStatus,
    refreshData: async () => {
      setLoading(true);
      await Promise.all([
        fetchParkingZones(),
        fetchUsers(),
        fetchBookings(),
        fetchViolations(),
        fetchAnalytics()
      ]);
      setLoading(false);
    }
  };
}
