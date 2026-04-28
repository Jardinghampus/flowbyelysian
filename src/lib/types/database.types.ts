// Database types for Supabase
// Run: npx supabase gen types typescript --linked > src/lib/types/database.types.ts
// to regenerate after schema changes

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      areas: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          image: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          image?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          image?: string | null
          created_at?: string
        }
      }
      area_market_data: {
        Row: {
          id: string
          area_id: string
          avg_price_sqft: number | null
          avg_price_sqft_change: number | null
          total_transactions: number | null
          transactions_change: number | null
          avg_days_on_market: number | null
          days_on_market_change: number | null
          avg_rent_yield: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          area_id: string
          avg_price_sqft?: number | null
          avg_price_sqft_change?: number | null
          total_transactions?: number | null
          transactions_change?: number | null
          avg_days_on_market?: number | null
          days_on_market_change?: number | null
          avg_rent_yield?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          area_id?: string
          avg_price_sqft?: number | null
          avg_price_sqft_change?: number | null
          total_transactions?: number | null
          transactions_change?: number | null
          avg_days_on_market?: number | null
          days_on_market_change?: number | null
          avg_rent_yield?: number | null
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          title: string
          area_id: string | null
          area_name: string | null
          sub_area: string | null
          size: number | null
          price: number
          type: 'villa' | 'apartment' | 'townhouse' | 'penthouse' | 'plot' | 'office' | 'retail'
          status: 'live' | 'pocket' | 'unofficial'
          inquiry_type: 'stock' | 'request'
          transaction_type: 'sale' | 'rent'
          notes: string | null
          property_finder_url: string | null
          images: string[] | null
          bedrooms: number | null
          bathrooms: number | null
          availability: string | null
          owner_id: string
          owner_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          area_id?: string | null
          area_name?: string | null
          sub_area?: string | null
          size?: number | null
          price: number
          type: 'villa' | 'apartment' | 'townhouse' | 'penthouse' | 'plot' | 'office' | 'retail'
          status?: 'live' | 'pocket' | 'unofficial'
          inquiry_type?: 'stock' | 'request'
          transaction_type: 'sale' | 'rent'
          notes?: string | null
          property_finder_url?: string | null
          images?: string[] | null
          bedrooms?: number | null
          bathrooms?: number | null
          availability?: string | null
          owner_id: string
          owner_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          area_id?: string | null
          area_name?: string | null
          sub_area?: string | null
          size?: number | null
          price?: number
          type?: 'villa' | 'apartment' | 'townhouse' | 'penthouse' | 'plot' | 'office' | 'retail'
          status?: 'live' | 'pocket' | 'unofficial'
          inquiry_type?: 'stock' | 'request'
          transaction_type?: 'sale' | 'rent'
          notes?: string | null
          property_finder_url?: string | null
          images?: string[] | null
          bedrooms?: number | null
          bathrooms?: number | null
          availability?: string | null
          owner_id?: string
          owner_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      client_requests: {
        Row: {
          id: string
          client_name: string
          budget: number | null
          property_type: string | null
          bedrooms: number | null
          area_id: string | null
          notes: string | null
          status: 'active' | 'matched' | 'closed'
          agent_id: string
          agent_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          budget?: number | null
          property_type?: string | null
          bedrooms?: number | null
          area_id?: string | null
          notes?: string | null
          status?: 'active' | 'matched' | 'closed'
          agent_id: string
          agent_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          budget?: number | null
          property_type?: string | null
          bedrooms?: number | null
          area_id?: string | null
          notes?: string | null
          status?: 'active' | 'matched' | 'closed'
          agent_id?: string
          agent_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      training_modules: {
        Row: {
          id: string
          title: string
          description: string | null
          category: 'rera' | 'tips' | 'way-of-work'
          content: string | null
          video_url: string | null
          video_type: 'youtube' | 'loom' | null
          documents: Json
          duration: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: 'rera' | 'tips' | 'way-of-work'
          content?: string | null
          video_url?: string | null
          video_type?: 'youtube' | 'loom' | null
          documents?: Json
          duration?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: 'rera' | 'tips' | 'way-of-work'
          content?: string | null
          video_url?: string | null
          video_type?: 'youtube' | 'loom' | null
          documents?: Json
          duration?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          clerk_user_id: string | null
          name: string
          email: string | null
          phone: string | null
          whatsapp: string | null
          area_id: string | null
          role: 'Sales' | 'Leasing' | null
          title: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clerk_user_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          whatsapp?: string | null
          area_id?: string | null
          role?: 'Sales' | 'Leasing' | null
          title?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          whatsapp?: string | null
          area_id?: string | null
          role?: 'Sales' | 'Leasing' | null
          title?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      agent_area_assignments: {
        Row: {
          id: string
          agent_id: string
          area_id: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          area_id: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          area_id?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      agent_performance: {
        Row: {
          id: string
          agent_id: string
          period_start: string
          period_end: string
          deals_count: number
          commission_earned: number
          listings_count: number
          viewings_count: number
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          period_start: string
          period_end: string
          deals_count?: number
          commission_earned?: number
          listings_count?: number
          viewings_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          period_start?: string
          period_end?: string
          deals_count?: number
          commission_earned?: number
          listings_count?: number
          viewings_count?: number
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'match' | 'listing' | 'request' | 'system'
          title: string
          message: string
          link: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'match' | 'listing' | 'request' | 'system'
          title: string
          message: string
          link?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'match' | 'listing' | 'request' | 'system'
          title?: string
          message?: string
          link?: string | null
          read?: boolean
          created_at?: string
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
      listing_type: 'villa' | 'apartment' | 'townhouse' | 'penthouse' | 'plot' | 'office' | 'retail'
      listing_status: 'live' | 'pocket' | 'unofficial'
      inquiry_type: 'stock' | 'request'
      transaction_type: 'sale' | 'rent'
      request_status: 'active' | 'matched' | 'closed'
      training_category: 'rera' | 'tips' | 'way-of-work'
      video_type: 'youtube' | 'loom'
      agent_role: 'Sales' | 'Leasing'
      notification_type: 'match' | 'listing' | 'request' | 'system'
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
