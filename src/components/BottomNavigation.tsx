
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, History, Map, User } from 'lucide-react';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: Map, label: 'Map' },
    { path: '/book', icon: Calendar, label: 'Book' },
    { path: '/active', icon: Clock, label: 'Active' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around items-center py-2 px-1 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-spoton-purple' : 'text-muted-foreground'}`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
