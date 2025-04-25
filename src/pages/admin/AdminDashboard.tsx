import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, PieChart, Calendar, Bell, MapPin, 
  Users, Settings, Shield, Search, Filter 
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for occupancy
  const occupancyData = {
    total: 250,
    occupied: 183,
    available: 67,
    occupancyRate: 73.2,
    zones: [
      { name: "Zone A", total: 80, occupied: 72, type: "Student", shadedSpots: 40 },
      { name: "Zone B", total: 60, occupied: 45, type: "Staff", shadedSpots: 30 },
      { name: "Zone C", total: 70, occupied: 42, type: "Faculty", shadedSpots: 35 },
      { name: "Zone D", total: 40, occupied: 24, type: "Visitor", shadedSpots: 15 }
    ]
  };

  // Mock data for users
  const userData = {
    total: 1250,
    active: 870,
    registrationsPending: 23,
    violations: 15
  };

  // Mock data for bookings
  const recentBookings = [
    { id: "BK-1234", user: "John Smith", spot: "A-15", time: "10:00 - 12:00", status: "Active" },
    { id: "BK-1235", user: "Sara Johnson", spot: "B-22", time: "09:30 - 11:30", status: "Complete" },
    { id: "BK-1236", user: "Ahmed Ali", spot: "C-08", time: "13:00 - 15:00", status: "Pending" },
    { id: "BK-1237", user: "Maria Garcia", spot: "D-04", time: "14:00 - 16:00", status: "Cancelled" },
    { id: "BK-1238", user: "David Lee", spot: "A-23", time: "11:00 - 13:00", status: "Complete" }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-spoton-purple mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Button size="sm" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <div className="h-8 w-8 bg-spoton-purple rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 hidden md:block">
          <nav className="space-y-1">
            <Button 
              variant={activeTab === 'overview' ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <BarChart className="h-5 w-5 mr-2" />
              Overview
            </Button>
            
            <Button 
              variant={activeTab === 'occupancy' ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('occupancy')}
            >
              <MapPin className="h-5 w-5 mr-2" />
              Parking Occupancy
            </Button>
            
            <Button 
              variant={activeTab === 'bookings' ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Bookings
            </Button>
            
            <Button 
              variant={activeTab === 'users' ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-5 w-5 mr-2" />
              User Management
            </Button>
            
            <Button 
              variant={activeTab === 'analytics' ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('analytics')}
            >
              <PieChart className="h-5 w-5 mr-2" />
              Analytics
            </Button>
            
            <Button 
              variant={activeTab === 'settings' ? 'secondary' : 'ghost'} 
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Parking Occupancy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{occupancyData.occupancyRate}%</div>
                    <Progress value={occupancyData.occupancyRate} className="mt-2" />
                    <div className="text-sm text-muted-foreground mt-2">
                      {occupancyData.occupied} of {occupancyData.total} spots occupied
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{userData.active}</div>
                    <Progress value={(userData.active / userData.total) * 100} className="mt-2" />
                    <div className="text-sm text-muted-foreground mt-2">
                      {userData.registrationsPending} pending registrations
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Violations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{userData.violations}</div>
                    <div className="h-2 mt-2"></div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Unpaid fines: 450 AED
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Spot</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentBookings.map(booking => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.id}</TableCell>
                            <TableCell>{booking.user}</TableCell>
                            <TableCell>{booking.spot}</TableCell>
                            <TableCell>{booking.time}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                booking.status === 'Active' ? 'bg-green-100 text-green-800' :
                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {booking.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm">View</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Zone Occupancy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {occupancyData.zones.map(zone => (
                        <div key={zone.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{zone.name} ({zone.type})</span>
                            <span>{Math.round((zone.occupied / zone.total) * 100)}%</span>
                          </div>
                          <Progress value={(zone.occupied / zone.total) * 100} />
                          <div className="text-xs text-muted-foreground">
                            {zone.occupied} of {zone.total} spots ({zone.shadedSpots} shaded)
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <Button className="w-full bg-spoton-purple hover:bg-spoton-purple-dark">
                      Add New User
                    </Button>
                    <Button className="w-full bg-spoton-purple hover:bg-spoton-purple-dark">
                      Block Zone
                    </Button>
                    <Button className="w-full bg-spoton-purple hover:bg-spoton-purple-dark">
                      Add Special Event
                    </Button>
                    <Button className="w-full bg-spoton-purple hover:bg-spoton-purple-dark">
                      Export Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Other tabs would be implemented here - for brevity, only showing overview */}
            <TabsContent value="occupancy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parking Occupancy Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Detailed parking occupancy view and management would be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Detailed booking management view would be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Detailed user management view would be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Detailed analytics view would be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Detailed settings view would be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
