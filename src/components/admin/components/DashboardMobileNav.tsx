
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardMobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardMobileNav = ({ activeTab, setActiveTab }: DashboardMobileNavProps) => {
  return (
    <div className="md:hidden">
      <TabsList className="grid grid-cols-3 gap-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
      </TabsList>
      <div className="my-2">
        <TabsList className="grid grid-cols-3 gap-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
};

export default DashboardMobileNav;
