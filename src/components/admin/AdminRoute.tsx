
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AdminRouteProps {
  children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        
        // In a real app, check if the user has admin privileges
        // This is a simplified example - in a production app,
        // you would check against a roles table or similar
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (error) {
          throw error;
        }
        
        // Check if the user is an admin
        // In this example, we're just checking if user_type is 'Admin'
        setIsAdmin(profile?.user_type === 'Admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to verify admin privileges."
        });
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [toast]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verifying admin access...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You don't have permission to access this area."
    });
    return <Navigate to="/" replace />;
  }
  
  return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute;
