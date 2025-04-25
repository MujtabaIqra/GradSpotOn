import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Car, AlertTriangle } from 'lucide-react';

interface AdminAnalyticsProps {
  parkingZones: any[];
  analytics: any;
  bookings: any[];
  violations: any[];
}

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  parkingZones,
  analytics,
  bookings,
  violations
}) => {
  // Calculate occupancy by zone
  const zoneOccupancy = parkingZones.map(zone => ({
    name: zone.zone_name,
    value: Math.round(zone.occupancy_rate),
  }));

  // Calculate violation types distribution
  const violationTypes = violations.reduce((acc: any, v) => {
    acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
    return acc;
  }, {});

  const violationData = Object.entries(violationTypes).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  // Mock hourly data (replace with real data in production)
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    occupancy: Math.round(50 + Math.random() * 30), // Random occupancy between 50-80%
  }));

  // Colors for charts
  const COLORS = ['#4C1D95', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Occupancy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analytics?.peak_occupancy_rate || 0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Today's highest occupancy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.total_bookings || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Bookings today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.status === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Currently parked vehicles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.total_violations || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Violations today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Occupancy Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Occupancy']}
                    labelFormatter={(hour) => `${hour}:00`}
                  />
                  <Line
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#7C3AED"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Zone Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Zone Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={zoneOccupancy}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {zoneOccupancy.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Violation Types */}
        <Card>
          <CardHeader>
            <CardTitle>Violation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={violationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {violationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Usage']}
                    labelFormatter={(hour) => `${hour}:00`}
                  />
                  <Line
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#7C3AED"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics; 