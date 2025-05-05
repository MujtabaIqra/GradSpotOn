
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
