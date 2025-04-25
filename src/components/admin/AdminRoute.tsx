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
        
        // Check if email matches admin pattern (starts with a.)
        const isAdminEmail = session.user.email?.startsWith('a.') && 
                           session.user.email?.endsWith('@ajmanuni.ac.ae');
        
        setIsAdmin(!!isAdminEmail);
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
