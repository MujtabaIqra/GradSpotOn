import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AdminParkingManagementProps {
  parkingZones: any[];
  updateZoneStatus: (
    zoneId: number,
    status: 'Open' | 'Closed' | 'Maintenance' | 'Reserved',
    reason?: string,
    until?: string
  ) => Promise<void>;
}

const AdminParkingManagement: React.FC<AdminParkingManagementProps> = ({
  parkingZones,
  updateZoneStatus
}) => {
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<'Open' | 'Closed' | 'Maintenance' | 'Reserved'>('Open');
  const [statusReason, setStatusReason] = useState('');
  const [statusUntil, setStatusUntil] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async () => {
    if (!selectedZone) return;

    setLoading(true);
    try {
      await updateZoneStatus(
        selectedZone.id,
        newStatus,
        statusReason,
        statusUntil?.toISOString()
      );

      // Reset form
      setStatusReason('');
      setStatusUntil(undefined);
    } catch (error) {
      console.error('Failed to update zone status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parking Zone Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zone Overview */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Zone</Label>
                <Select
                  value={selectedZone?.id?.toString()}
                  onValueChange={(value) => 
                    setSelectedZone(parkingZones.find(z => z.id.toString() === value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parking zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {parkingZones.map(zone => (
                      <SelectItem key={zone.id} value={zone.id.toString()}>
                        {zone.zone_name} ({zone.building})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedZone && (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{selectedZone.zone_name}</p>
                      <p className="text-xs text-muted-foreground">Building {selectedZone.building}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{Math.round(selectedZone.occupancy_rate)}% Full</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((selectedZone.occupancy_rate / 100) * selectedZone.total_spots)} of {selectedZone.total_spots} spots
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Status</Label>
                    <div className={cn(
                      "text-sm font-medium px-2 py-1 rounded",
                      selectedZone.status === 'Open' && "bg-green-100 text-green-800",
                      selectedZone.status === 'Closed' && "bg-red-100 text-red-800",
                      selectedZone.status === 'Maintenance' && "bg-yellow-100 text-yellow-800",
                      selectedZone.status === 'Reserved' && "bg-blue-100 text-blue-800"
                    )}>
                      {selectedZone.status}
                      {selectedZone.status_reason && ` - ${selectedZone.status_reason}`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Update Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select
                  value={newStatus}
                  onValueChange={(value: 'Open' | 'Closed' | 'Maintenance' | 'Reserved') => 
                    setNewStatus(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Input
                  placeholder="Enter reason for status change"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Until</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !statusUntil && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {statusUntil ? format(statusUntil, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={statusUntil}
                      onSelect={setStatusUntil}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                className="w-full"
                disabled={!selectedZone || loading}
                onClick={handleUpdateStatus}
              >
                {loading ? "Updating..." : "Update Zone Status"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone Map */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {parkingZones.map(zone => (
              <div
                key={zone.id}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  selectedZone?.id === zone.id && "border-spoton-purple ring-2 ring-spoton-purple ring-offset-2",
                  !selectedZone && "hover:border-spoton-purple"
                )}
                onClick={() => setSelectedZone(zone)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{zone.zone_name}</p>
                    <p className="text-sm text-muted-foreground">Building {zone.building}</p>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    zone.status === 'Open' && "bg-green-100 text-green-800",
                    zone.status === 'Closed' && "bg-red-100 text-red-800",
                    zone.status === 'Maintenance' && "bg-yellow-100 text-yellow-800",
                    zone.status === 'Reserved' && "bg-blue-100 text-blue-800"
                  )}>
                    {zone.status}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Occupancy</span>
                    <span>{Math.round(zone.occupancy_rate)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        zone.occupancy_rate >= 80 ? "bg-red-500" :
                        zone.occupancy_rate >= 60 ? "bg-yellow-500" :
                        "bg-green-500"
                      )}
                      style={{ width: `${zone.occupancy_rate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((zone.occupancy_rate / 100) * zone.total_spots)} of {zone.total_spots} spots occupied
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminParkingManagement; 