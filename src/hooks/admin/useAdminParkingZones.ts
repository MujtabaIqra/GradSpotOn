
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ParkingZone } from './types';
import { useToast } from '@/hooks/use-toast';

export function useAdminParkingZones() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [parkingZones, setParkingZones] = useState<ParkingZone[]>([]);

  const fetchParkingZones = async () => {
    try {
      setLoading(true);
      // Since parking_zones doesn't exist in the database, we'll create mock data
      // In a real application, you would query the actual table
      const mockZones: ParkingZone[] = [
        {
          id: 1,
          building: 'J2',
          zone_name: 'Zone A',
          total_spots: 100,
          shaded_spots: 30,
          occupied_spots: 65,
          status: 'Open',
          occupancy_rate: 65,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          building: 'J2',
          zone_name: 'Zone B',
          total_spots: 75,
          shaded_spots: 20,
          occupied_spots: 45,
          status: 'Open',
          occupancy_rate: 60,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          building: 'J2',
          zone_name: 'Zone C',
          total_spots: 50,
          shaded_spots: 10,
          occupied_spots: 40,
          status: 'Maintenance',
          status_reason: 'Cleaning',
          status_until: new Date(Date.now() + 86400000).toISOString(),
          occupancy_rate: 80,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setParkingZones(mockZones);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch parking zones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateZoneStatus = async (
    zoneId: number,
    status: 'Open' | 'Closed' | 'Maintenance' | 'Reserved',
    reason?: string,
    until?: string
  ) => {
    try {
      // In a real app, you would update the database
      // For now, we update the local state
      setParkingZones(prevZones => 
        prevZones.map(zone => 
          zone.id === zoneId ? 
            { 
              ...zone, 
              status, 
              status_reason: reason, 
              status_until: until,
              updated_at: new Date().toISOString()
            } : zone
        )
      );

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

  useEffect(() => {
    fetchParkingZones();

    // In a real application, you would set up a subscription here
    // to listen for changes in the parking_zones table

    return () => {
      // Cleanup subscription if needed
    };
  }, []);

  return {
    parkingZones,
    loading,
    fetchParkingZones,
    updateZoneStatus
  };
}
