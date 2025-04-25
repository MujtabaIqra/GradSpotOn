export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          user_type: 'Student' | 'Staff' | 'Admin' | 'Security'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          user_type?: 'Student' | 'Staff' | 'Admin' | 'Security'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          user_type?: 'Student' | 'Staff' | 'Admin' | 'Security'
          created_at?: string
          updated_at?: string
        }
      }
      parking_zones: {
        Row: {
          id: number
          building: 'J1' | 'J2' | 'M1' | 'M2' | 'S1' | 'S2'
          zone_name: string
          total_spots: number
          shaded_spots: number
          status: 'Open' | 'Closed' | 'Maintenance' | 'Reserved'
          status_reason: string | null
          status_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          building: 'J1' | 'J2' | 'M1' | 'M2' | 'S1' | 'S2'
          zone_name: string
          total_spots: number
          shaded_spots?: number
          status?: 'Open' | 'Closed' | 'Maintenance' | 'Reserved'
          status_reason?: string | null
          status_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          building?: 'J1' | 'J2' | 'M1' | 'M2' | 'S1' | 'S2'
          zone_name?: string
          total_spots?: number
          shaded_spots?: number
          status?: 'Open' | 'Closed' | 'Maintenance' | 'Reserved'
          status_reason?: string | null
          status_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parking_spots: {
        Row: {
          id: number
          zone_id: number
          spot_number: number
          is_shaded: boolean
          is_reserved: boolean
          is_disabled_friendly: boolean
          status: 'Open' | 'Closed' | 'Maintenance' | 'Reserved'
          status_reason: string | null
          status_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          zone_id: number
          spot_number: number
          is_shaded?: boolean
          is_reserved?: boolean
          is_disabled_friendly?: boolean
          status?: 'Open' | 'Closed' | 'Maintenance' | 'Reserved'
          status_reason?: string | null
          status_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          zone_id?: number
          spot_number?: number
          is_shaded?: boolean
          is_reserved?: boolean
          is_disabled_friendly?: boolean
          status?: 'Open' | 'Closed' | 'Maintenance' | 'Reserved'
          status_reason?: string | null
          status_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          zone_id: number
          spot_number: number
          start_time: string
          end_time: string
          status: 'Active' | 'Completed' | 'Cancelled' | 'Expired'
          entry_time: string | null
          exit_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          zone_id: number
          spot_number: number
          start_time: string
          end_time: string
          status?: 'Active' | 'Completed' | 'Cancelled' | 'Expired'
          entry_time?: string | null
          exit_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          zone_id?: number
          spot_number?: number
          start_time?: string
          end_time?: string
          status?: 'Active' | 'Completed' | 'Cancelled' | 'Expired'
          entry_time?: string | null
          exit_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      violations: {
        Row: {
          id: string
          booking_id: string
          user_id: string
          violation_type: 'Overstay' | 'NoQRScan' | 'UnauthorizedSpot' | 'Other'
          description: string
          fine_amount: number
          is_paid: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          user_id: string
          violation_type: 'Overstay' | 'NoQRScan' | 'UnauthorizedSpot' | 'Other'
          description: string
          fine_amount: number
          is_paid?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          user_id?: string
          violation_type?: 'Overstay' | 'NoQRScan' | 'UnauthorizedSpot' | 'Other'
          description?: string
          fine_amount?: number
          is_paid?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      parking_analytics: {
        Row: {
          id: number
          zone_id: number
          date: string
          total_bookings: number
          peak_occupancy_rate: number
          avg_occupancy_rate: number
          total_violations: number
          total_fine_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          zone_id: number
          date: string
          total_bookings?: number
          peak_occupancy_rate?: number
          avg_occupancy_rate?: number
          total_violations?: number
          total_fine_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          zone_id?: number
          date?: string
          total_bookings?: number
          peak_occupancy_rate?: number
          avg_occupancy_rate?: number
          total_violations?: number
          total_fine_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_occupancy: {
        Args: { zone_id: number }
        Returns: {
          total_spots: number
          occupied_spots: number
          occupancy_rate: number
        }[]
      }
    }
    Enums: {
      user_type: 'Student' | 'Staff' | 'Admin' | 'Security'
      building_code: 'J1' | 'J2' | 'M1' | 'M2' | 'S1' | 'S2'
      booking_status: 'Active' | 'Completed' | 'Cancelled' | 'Expired'
      parking_zone_status: 'Open' | 'Closed' | 'Maintenance' | 'Reserved'
      violation_type: 'Overstay' | 'NoQRScan' | 'UnauthorizedSpot' | 'Other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      building_code: ["J2-A", "J2-B", "J2-C"],
    },
  },
} as const
