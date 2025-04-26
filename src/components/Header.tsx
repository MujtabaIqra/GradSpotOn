import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, User, Shield } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AjmanLogo from '@/components/AjmanLogo';

const Header = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;
        
        // Debug log
        console.log('Logged in as:', session.user.email);
        // Check if email matches admin pattern (starts with a.)
        const isAdminEmail = session.user.email?.startsWith('a.') && 
                           session.user.email?.endsWith('@ajmanuni.ac.ae');
        
        setIsAdmin(!!isAdminEmail);
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="w-full py-3 px-4 sm:px-6 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="flex items-center gap-2" onClick={() => navigate('/')} role="button">
        <div className="w-10 h-10">
          <AjmanLogo />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight text-spoton-purple-darkest">Spot<span className="text-spoton-purple">On</span></span>
          <span className="text-xs text-muted-foreground leading-tight">Ajman University</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1"
            onClick={() => navigate('/admin')}
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Button>
        )}
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => navigate('/profile')} aria-label="Profile">
          <User className="h-5 w-5" />
        </Button>
        {isAdmin && (
          <button onClick={handleLogout} className="text-red-600 font-bold hover:underline">
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
