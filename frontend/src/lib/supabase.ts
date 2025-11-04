import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from '@/config/supabase'

// Create Supabase client with proper validation
export const supabase = createClient(
  supabaseConfig.url || 'https://placeholder.supabase.co', 
  supabaseConfig.anonKey || 'placeholder-key', 
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Complete Database types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          password: string | null
          first_name: string | null
          last_name: string | null
          role: string
          status: string
          avatar: string | null
          fcm_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          password?: string | null
          first_name?: string | null
          last_name?: string | null
          role?: string
          status?: string
          avatar?: string | null
          fcm_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          password?: string | null
          first_name?: string | null
          last_name?: string | null
          role?: string
          status?: string
          avatar?: string | null
          fcm_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          user_id: string
          shopname: string
          description: string | null
          status: string
          business_license: string | null
          tax_id: string | null
          latitude: number | null
          longitude: number | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          service_radius: number
          advance_booking: number
          cancellation: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shopname: string
          description?: string | null
          status?: string
          business_license?: string | null
          tax_id?: string | null
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          service_radius?: number
          advance_booking?: number
          cancellation?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shopname?: string
          description?: string | null
          status?: string
          business_license?: string | null
          tax_id?: string | null
          latitude?: number | null
          longitude?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          service_radius?: number
          advance_booking?: number
          cancellation?: number
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          vendor_id: string
          name: string
          description: string | null
          duration: number
          price: number
          is_active: boolean
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          name: string
          description?: string | null
          duration: number
          price: number
          is_active?: boolean
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          name?: string
          description?: string | null
          duration?: number
          price?: number
          is_active?: boolean
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          vendor_id: string
          status: string
          scheduled_date: string
          scheduled_time: string
          duration: number
          subtotal: number
          discount: number
          tax: number
          total: number
          address_id: string
          notes: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          vendor_id: string
          status?: string
          scheduled_date: string
          scheduled_time: string
          duration: number
          subtotal: number
          discount?: number
          tax?: number
          total: number
          address_id: string
          notes?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          vendor_id?: string
          status?: string
          scheduled_date?: string
          scheduled_time?: string
          duration?: number
          subtotal?: number
          discount?: number
          tax?: number
          total?: number
          address_id?: string
          notes?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          type: string
          name: string | null
          street: string
          city: string
          state: string
          zip_code: string
          latitude: number | null
          longitude: number | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: string
          name?: string | null
          street: string
          city: string
          state: string
          zip_code: string
          latitude?: number | null
          longitude?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          name?: string | null
          street?: string
          city?: string
          state?: string
          zip_code?: string
          latitude?: number | null
          longitude?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          user_id: string
          amount: number
          method: string
          status: string
          gateway_id: string | null
          gateway_response: any | null
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          user_id: string
          amount: number
          method: string
          status?: string
          gateway_id?: string | null
          gateway_response?: any | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          user_id?: string
          amount?: number
          method?: string
          status?: string
          gateway_id?: string | null
          gateway_response?: any | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          customer_id: string
          vendor_id: string
          rating: number
          comment: string | null
          response: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          customer_id: string
          vendor_id: string
          rating: number
          comment?: string | null
          response?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          customer_id?: string
          vendor_id?: string
          rating?: number
          comment?: string | null
          response?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  return {
    success: false,
    error: error.message || 'An unexpected error occurred'
  }
}

// Helper function for successful responses
export const handleSupabaseSuccess = (data: any) => {
  return {
    success: true,
    data
  }
}
