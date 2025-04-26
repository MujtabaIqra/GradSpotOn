
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Analytics } from './types';
import { useToast } from '../use-toast';

export function useAdminAnalytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

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

  useEffect(() => {
    fetchAnalytics();

    const analyticsSubscription = supabase
      .channel('analytics_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_analytics' }, 
        () => fetchAnalytics()
      )
      .subscribe();

    return () => {
      analyticsSubscription.unsubscribe();
    };
  }, []);

  return {
    analytics,
    loading,
    fetchAnalytics
  };
}
