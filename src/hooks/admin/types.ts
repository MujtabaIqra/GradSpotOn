
export interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  start_time: string;
  status: 'Active' | 'Completed' | 'Cancelled' | 'Expired';
  user?: {
    full_name: string;
    email: string;
  };
}

export interface ParkingZone {
  id: number;
  building: string;
  zone_name: string;
  total_spots: number;
  shaded_spots: number;
  occupied_spots: number;
  status: 'Open' | 'Closed' | 'Maintenance' | 'Reserved';
  status_reason?: string;
  status_until?: string;
  occupancy_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Violation {
  id: string;
  booking_id: string;
  user_id: string;
  violation_type: string;
  description: string;
  fine_amount: number;
  is_paid: boolean;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export interface Analytics {
  total_bookings: number;
  peak_occupancy_rate: number;
  avg_occupancy_rate: number;
  total_violations: number;
  total_fine_amount: number;
}
