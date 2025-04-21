
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data for available parking
const parkingStats = {
  available: 42,
  total: 150,
  percentAvailable: 28
};

const zoneDescriptions: Record<string, string> = {
  A: 'near building J2A',
  B: 'near building J2B',
  C: 'near building H1 (Main Hall)',
  D: 'near building C1 (Cafeteria)'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [parkingZone, setParkingZone] = useState('A');
  
  const zones = ['A', 'B', 'C', 'D'];

  // Helper to determine which building each spot is close to
  function getSpotLocation(zone: string, spotId: string): string {
    // You can customize mapping here for more granular spot-to-building mapping if needed
    return zoneDescriptions[zone] || "Unknown location";
  }
  
  // Mock data for parking spots in current zone
  const parkingSpots = Array(24).fill(null).map((_, i) => ({
    id: `${parkingZone}-${i+1}`,
    status: Math.random() > 0.3 ? 'available' : Math.random() > 0.5 ? 'occupied' : 'reserved'
  }));

  // Pick today's date and time for mock reservation
  const todayISO = new Date().toISOString().split('T')[0];
  const nowHour = String(new Date().getHours()).padStart(2, '0') + ':00';

  function handleReserveSpot(spot: { id: string, status: string }) {
    if (spot.status === 'available') {
      navigate('/confirmation', {
        state: {
          // Quick mock fill
          date: todayISO,
          startTime: nowHour,
          duration: 1,
          zone: parkingZone,
          spot: spot.id,
          locationDescription: getSpotLocation(parkingZone, spot.id)
        }
      });
    }
  }
  
  return (
    <div className="min-h-screen pb-16">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Find Parking</h1>
          <p className="text-muted-foreground">Select a spot to reserve</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Available Spots</span>
              <span className="text-spoton-purple text-2xl">{parkingStats.available}</span>
            </CardTitle>
            <CardDescription>
              {parkingStats.percentAvailable}% of total spots available
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div 
                className="bg-spoton-purple h-2.5 rounded-full" 
                style={{ width: `${parkingStats.percentAvailable}%` }}
              ></div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full flex gap-2 items-center"
              onClick={() => navigate('/book')}
            >
              <Calendar className="h-4 w-4" />
              Book in Advance
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Parking Map</h2>
            <div className="flex border rounded-lg overflow-hidden">
              {zones.map(zone => (
                <button
                  key={zone}
                  className={`px-3 py-1 text-sm ${parkingZone === zone ? 'bg-spoton-purple text-white' : 'bg-background'}`}
                  onClick={() => setParkingZone(zone)}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>
          
          <Card className="bg-muted border-2">
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-2">
                {parkingSpots.map((spot) => (
                  <div 
                    key={spot.id} 
                    className={`parking-spot ${
                      spot.status === 'available' 
                        ? 'parking-spot-available' 
                        : spot.status === 'occupied' 
                          ? 'parking-spot-occupied' 
                          : 'parking-spot-reserved'
                    } cursor-pointer`}
                    onClick={() => handleReserveSpot(spot)}
                  >
                    <div className="aspect-w-1 aspect-h-1 flex items-center justify-center p-2">
                      <span className="text-xs text-white font-medium">
                        {spot.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Reserved</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => navigate('/book')}>Book Spot</Button>
            <Button variant="outline" onClick={() => navigate('/active')}>Active Bookings</Button>
            <Button variant="outline" onClick={() => navigate('/history')}>Booking History</Button>
            <Button variant="outline" onClick={() => navigate('/profile')}>My Profile</Button>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
