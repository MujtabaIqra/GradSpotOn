import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subHours } from 'date-fns';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Database } from '@/integrations/supabase/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TOTAL_SPOTS = 250;

type AuthUser = {
  email: string | null;
  phone: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  providers: string[];
};

type UserProfile = {
  uid: string;
  fullname: string;
  usertype: string;
  student_id: string;
  created_at: string;
  updated_at: string;
};

type Booking = Database['public']['Tables']['bookings']['Row'];

const AdminDashboard = () => {
  const [occupancyPercent, setOccupancyPercent] = useState(0);
  const [occupiedCount, setOccupiedCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [violations, setViolations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [hourlyData, setHourlyData] = useState<{ hour: string; bookings: number }[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // First, let's check if we can connect to Supabase
        console.log('Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('count')
          .single();
        
        console.log('Supabase connection test:', { testData, testError });

        // Fetch all registered users from profiles
        console.log('Fetching all registered users from Supabase...');
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('Raw users data:', users);
        console.log('Users error:', usersError);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          throw usersError;
        }

        if (users) {
          console.log('Number of users fetched:', users.length);
          // Transform the data to match our UserProfile type
          const transformedUsers = users.map(user => ({
            uid: user.id,
            fullname: user.full_name,
            usertype: user.user_type,
            student_id: user.student_id,
            created_at: user.created_at,
            updated_at: user.updated_at
          }));
          console.log('Transformed users:', transformedUsers);
          setRegisteredUsers(transformedUsers);
        } else {
          console.log('No users found in the database');
        }

        // Fetch bookings for the last 24 hours
        const twentyFourHoursAgo = subHours(new Date(), 24).toISOString();
        console.log('Fetching bookings from:', twentyFourHoursAgo);
        
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .gte('created_at', twentyFourHoursAgo)
          .order('created_at', { ascending: false });

        console.log('Bookings fetched:', bookings?.length);
        console.log('Bookings error:', bookingsError);

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
        } else if (bookings) {
          const now = new Date();
          
          // Active bookings
          const activeBookings = bookings.filter(bk => {
            if (bk.status !== 'Active') return false;
            const start = new Date(bk.start_time);
            const end = new Date(bk.end_time);
            return now >= start && now < end;
          });

          // Calculate metrics
          const uniqueOccupied = new Set(activeBookings.map(bk => `${bk.zone_id}-${bk.spot_number}`));
          setOccupiedCount(uniqueOccupied.size);
          setOccupancyPercent((uniqueOccupied.size / TOTAL_SPOTS) * 100);

          const uniqueUsers = new Set(activeBookings.map(bk => bk.user_id));
          setActiveUsers(uniqueUsers.size);

          // Violations
          const violationCount = bookings.filter(bk => bk.status === 'Expired').length;
          setViolations(violationCount);

          // Recent bookings
          setRecentBookings(bookings);

          // Generate hourly data for the last 24 hours
          const hourlyStats = Array.from({ length: 24 }, (_, i) => {
            const hour = subHours(now, i);
            const hourStr = format(hour, 'HH:00');
            
            const hourBookings = bookings.filter(bk => {
              const bookingTime = new Date(bk.created_at);
              return bookingTime.getHours() === hour.getHours() && 
                     bookingTime.getDate() === hour.getDate();
            });

            return {
              hour: hourStr,
              bookings: hourBookings.length
            };
          }).reverse();

          setHourlyData(hourlyStats);
        }
      } catch (error) {
        console.error('Error in fetchDashboardData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter users based on search
  const filteredUsers = registeredUsers.filter(user => 
    user.fullname?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.student_id?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.usertype?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'PP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'PPp');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Filter bookings based on search and status
  const filteredBookings = recentBookings.filter(booking => {
    const matchesSearch = 
      booking.zone_id?.toString().includes(searchTerm) ||
      booking.spot_number?.toString().includes(searchTerm) ||
      booking.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen pb-16">
      <Header />
      <main className="p-4 max-w-6xl mx-auto">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{registeredUsers.length}</div>
                  <div className="text-muted-foreground">registered accounts</div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{activeUsers}</div>
                  <div className="text-muted-foreground">users with active bookings</div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Violations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{violations}</div>
                  <div className="text-muted-foreground">expired bookings</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Registered Users Table */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Registered Users ({registeredUsers.length})</CardTitle>
                <div className="flex gap-4">
                  <Input
                    placeholder="Search by name, ID, or type..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="visitor">Visitors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>User Type</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers
                      .filter(user => userTypeFilter === 'all' || user.usertype === userTypeFilter)
                      .map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell>{user.fullname}</TableCell>
                        <TableCell>{user.student_id}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.usertype === 'student' ? 'bg-blue-100 text-blue-800' :
                            user.usertype === 'staff' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.usertype?.charAt(0).toUpperCase() + (user.usertype?.slice(1) || '')}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            activeUsers > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {activeUsers > 0 ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Chart */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Student Bookings by Hour (Last 24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings Table */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Student Bookings ({recentBookings.length})</CardTitle>
                <div className="flex gap-4">
                  <Input
                    placeholder="Search by zone or spot..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone</TableHead>
                      <TableHead>Spot</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.zone_id || 'N/A'}</TableCell>
                        <TableCell>{booking.spot_number || 'N/A'}</TableCell>
                        <TableCell>{booking.user_id || 'N/A'}</TableCell>
                        <TableCell>{formatDateTime(booking.start_time)}</TableCell>
                        <TableCell>{formatDateTime(booking.end_time)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'Active' ? 'bg-green-100 text-green-800' :
                            booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'Expired' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status || 'Unknown'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AdminDashboard;
