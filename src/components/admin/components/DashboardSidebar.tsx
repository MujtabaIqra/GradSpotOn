
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  BarChart, MapPin, Calendar, Users, 
  PieChart, Settings 
} from 'lucide-react';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardSidebar = ({ activeTab, setActiveTab }: DashboardSidebarProps) => {
  const navItems = [
    { id: 'overview', label: 'Overview', Icon: BarChart },
    { id: 'occupancy', label: 'Parking Occupancy', Icon: MapPin },
    { id: 'bookings', label: 'Bookings', Icon: Calendar },
    { id: 'users', label: 'User Management', Icon: Users },
    { id: 'analytics', label: 'Analytics', Icon: PieChart },
    { id: 'settings', label: 'Settings', Icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 hidden md:block">
      <nav className="space-y-1">
        {navItems.map(({ id, label, Icon }) => (
          <Button 
            key={id}
            variant={activeTab === id ? 'secondary' : 'ghost'} 
            className="w-full justify-start"
            onClick={() => setActiveTab(id)}
          >
            <Icon className="h-5 w-5 mr-2" />
            {label}
          </Button>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
