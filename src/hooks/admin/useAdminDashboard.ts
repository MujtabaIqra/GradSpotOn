
import { useState } from 'react';
import { useAdminParkingZones } from './useAdminParkingZones';
import { useAdminUsers } from './useAdminUsers';
import { useAdminBookings } from './useAdminBookings';
import { useAdminViolations } from './useAdminViolations';
import { useAdminAnalytics } from './useAdminAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../use-toast';

export function useAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const { parkingZones } = useAdminParkingZones();
  const { users } = useAdminUsers();
  const { bookings } = useAdminBookings();
  const { violations } = useAdminViolations();
  const { analytics } = useAdminAnalytics();

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

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update zone status",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        useAdminParkingZones().fetchParkingZones(),
        useAdminUsers().fetchUsers(),
        useAdminBookings().fetchBookings(),
        useAdminViolations().fetchViolations(),
        useAdminAnalytics().fetchAnalytics()
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    parkingZones,
    users,
    bookings,
    violations,
    analytics,
    updateZoneStatus,
    refreshData
  };
}
