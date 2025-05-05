
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AjmanLogo from '@/components/AjmanLogo';

const Header = () => {
  const navigate = useNavigate();
  
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
        <Button variant="outline" size="icon" className="rounded-full" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => navigate('/profile')} aria-label="Profile">
          <User className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
