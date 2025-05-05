
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Violation } from './types';
import { useToast } from '@/hooks/use-toast';

export function useAdminViolations() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState<Violation[]>([]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      // Since violations table doesn't exist, we'll create mock data
      // In a real application, you would query the actual table
      const mockViolations: Violation[] = [
        {
          id: "v1",
          booking_id: "b1",
          user_id: "u1",
          violation_type: "Overstay",
          description: "Exceeded booking time by 35 minutes",
          fine_amount: 50,
          is_paid: false,
          created_at: new Date().toISOString(),
          user: {
            full_name: "John Doe",
            email: "john@example.com"
          }
        },
        {
          id: "v2",
          booking_id: "b2",
          user_id: "u2",
          violation_type: "NoQRScan",
          description: "Failed to scan QR code upon entry",
          fine_amount: 30,
          is_paid: true,
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          user: {
            full_name: "Jane Smith",
            email: "jane@example.com"
          }
        },
        {
          id: "v3",
          booking_id: "b3",
          user_id: "u3",
          violation_type: "UnauthorizedSpot",
          description: "Parked in reserved spot without authorization",
          fine_amount: 75,
          is_paid: false,
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
          user: {
            full_name: "Alex Johnson",
            email: "alex@example.com"
          }
        }
      ];
      
      setViolations(mockViolations);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch violations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Added refreshViolations method since it's being used in AdminDashboard.tsx
  const refreshViolations = async () => {
    await fetchViolations();
  };

  useEffect(() => {
    fetchViolations();

    // In a real application, you would set up a subscription here
    
    return () => {
      // Cleanup subscription if needed
    };
  }, []);

  return {
    violations,
    loading,
    fetchViolations,
    refreshViolations
  };
}
