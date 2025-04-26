import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminOverview from './AdminOverview';
import AdminParkingManagement from './AdminParkingManagement';
import AdminUserManagement from './AdminUserManagement';
import AdminViolations from './AdminViolations';
import AdminAnalytics from './AdminAnalytics';
import AdminJ2Parking from './AdminJ2Parking';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    parkingZones, 
    users, 
    bookings, 
    violations, 
    analytics,
    updateZoneStatus,
    refreshData
  } = useAdminDashboard();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="j2-parking">J2 Parking</TabsTrigger>
          <TabsTrigger value="parking">Parking</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminOverview />
        </TabsContent>

        <TabsContent value="j2-parking">
          <AdminJ2Parking />
        </TabsContent>

        <TabsContent value="parking">
          <AdminParkingManagement 
            parkingZones={parkingZones}
            updateZoneStatus={updateZoneStatus}
          />
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement users={users} />
        </TabsContent>

        <TabsContent value="violations">
          <AdminViolations 
            violations={violations}
            refreshData={refreshData}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AdminAnalytics 
            parkingZones={parkingZones}
            analytics={analytics}
            bookings={bookings}
            violations={violations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
