
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminOverview from './AdminOverview';
import AdminParkingManagement from './AdminParkingManagement';
import AdminUserManagement from './AdminUserManagement';
import AdminViolations from './AdminViolations';
import AdminAnalytics from './AdminAnalytics';
import AdminJ2Parking from './AdminJ2Parking';
import DashboardHeader from './components/DashboardHeader';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardMobileNav from './components/DashboardMobileNav';
import DashboardContent from './components/DashboardContent';
import { useAdminParkingZones } from '@/hooks/admin/useAdminParkingZones';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { useAdminBookings } from '@/hooks/admin/useAdminBookings';
import { useAdminViolations } from '@/hooks/admin/useAdminViolations';
import { useAdminAnalytics } from '@/hooks/admin/useAdminAnalytics';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { parkingZones, updateZoneStatus } = useAdminParkingZones();
  const { users } = useAdminUsers();
  const { bookings } = useAdminBookings();
  const { violations, refreshViolations } = useAdminViolations();
  const { analytics } = useAdminAnalytics();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      
      <div className="flex h-[calc(100vh-64px)]">
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <DashboardMobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

            <TabsContent value="overview">
              <AdminOverview 
                parkingZones={parkingZones}
                users={users}
                bookings={bookings}
                violations={violations}
                analytics={analytics}
                loading={false}
              />
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
                refreshData={refreshViolations}
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

            <DashboardContent />
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
