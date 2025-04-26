
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ParkingZone } from './types';
import { useToast } from '../use-toast';

export function useAdminParkingZones() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [parkingZones, setParkingZones] = useState<ParkingZone[]>([]);

  const fetchParkingZones = async () => {
    try {
      const { data: zones, error: zonesError } = await supabase
        .from('parking_zones')
        .select('*');

      if (zonesError) throw zonesError;

      setParkingZones(zones as ParkingZone[]);

      // Check for high occupancy zones and notify
      zones.forEach((zone: ParkingZone) => {
        if (zone.occupied_spots / zone.total_spots >= 0.8) {
          toast({
            title: "High Occupancy Alert",
            description: `${zone.zone_name} is at ${Math.round((zone.occupied_spots / zone.total_spots) * 100)}% capacity`,
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

  useEffect(() => {
    fetchParkingZones();

    const parkingZonesSubscription = supabase
      .channel('parking_zones_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_zones' }, 
        () => fetchParkingZones()
      )
      .subscribe();

    return () => {
      parkingZonesSubscription.unsubscribe();
    };
  }, []);

  return {
    parkingZones,
    loading,
    fetchParkingZones
  };
}
