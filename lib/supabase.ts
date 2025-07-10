import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          role: "user" | "driver" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          role?: "user" | "driver" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          role?: "user" | "driver" | "admin"
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          user_id: string
          photograph_url: string | null
          primary_phone: string
          secondary_phone: string | null
          address: string
          aadhaar_number: string
          driving_license_url: string
          vehicle_number: string
          car_model: string
          car_make: string
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          photograph_url?: string | null
          primary_phone: string
          secondary_phone?: string | null
          address: string
          aadhaar_number: string
          driving_license_url: string
          vehicle_number: string
          car_model: string
          car_make: string
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          photograph_url?: string | null
          primary_phone?: string
          secondary_phone?: string | null
          address?: string
          aadhaar_number?: string
          driving_license_url?: string
          vehicle_number?: string
          car_model?: string
          car_make?: string
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      rides: {
        Row: {
          id: string
          driver_id: string
          from_location: string
          to_location: string
          price: number
          total_seats: number
          available_seats: number
          departure_time: string
          status: "active" | "completed" | "cancelled"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          from_location: string
          to_location: string
          price: number
          total_seats: number
          available_seats: number
          departure_time: string
          status?: "active" | "completed" | "cancelled"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          from_location?: string
          to_location?: string
          price?: number
          total_seats?: number
          available_seats?: number
          departure_time?: string
          status?: "active" | "completed" | "cancelled"
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          ride_id: string
          seats_booked: number
          total_price: number
          status: "confirmed" | "cancelled"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ride_id: string
          seats_booked: number
          total_price: number
          status?: "confirmed" | "cancelled"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ride_id?: string
          seats_booked?: number
          total_price?: number
          status?: "confirmed" | "cancelled"
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
