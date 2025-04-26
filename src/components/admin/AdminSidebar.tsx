import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  return (
    <div className="flex flex-col gap-4 p-4 h-full border-r bg-muted">
      {/* ...other sidebar links... */}
      <button onClick={handleLogout} className="mt-auto text-red-600 font-bold hover:underline">
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar; 