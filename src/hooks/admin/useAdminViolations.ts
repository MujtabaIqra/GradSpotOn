
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Violation } from './types';
import { useToast } from '../use-toast';

export function useAdminViolations() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState<Violation[]>([]);

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

  useEffect(() => {
    fetchViolations();

    const violationsSubscription = supabase
      .channel('violations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'violations' }, 
        () => fetchViolations()
      )
      .subscribe();

    return () => {
      violationsSubscription.unsubscribe();
    };
  }, []);

  return {
    violations,
    loading,
    fetchViolations
  };
}
