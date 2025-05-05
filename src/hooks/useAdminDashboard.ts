
import { useState } from 'react';
import { useAdminParkingZones } from './admin/useAdminParkingZones';
import { useAdminUsers } from './admin/useAdminUsers';
import { useAdminBookings } from './admin/useAdminBookings';
import { useAdminViolations } from './admin/useAdminViolations';
import { useAdminAnalytics } from './admin/useAdminAnalytics';
import { useToast } from './use-toast';

export function useAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const { parkingZones, updateZoneStatus } = useAdminParkingZones();
  const { users } = useAdminUsers();
  const { bookings } = useAdminBookings();
  const { violations, refreshViolations } = useAdminViolations();
  const { analytics } = useAdminAnalytics();

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
    refreshViolations,
    refreshData
  };
}
