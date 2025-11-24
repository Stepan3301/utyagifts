import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable')
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false, // We're using server-side, no session persistence needed
    },
  }
)

// Database types (matching Supabase schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          telegram_id: number
          username: string | null
          first_name: string | null
          last_name: string | null
          inventory: any // JSONB
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          telegram_id: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          inventory?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          telegram_id?: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          inventory?: any
          created_at?: string
          updated_at?: string
        }
      }
      gifts: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          animation_url: string | null
          animation_data: any | null // JSONB for Lottie JSON
          gift_url: string | null // Telegram gift URL
          external_url: string | null
          rarity: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          animation_url?: string | null
          animation_data?: any | null
          gift_url?: string | null
          external_url?: string | null
          rarity?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          animation_url?: string | null
          animation_data?: any | null
          gift_url?: string | null
          external_url?: string | null
          rarity?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          gift_id: string | null
          multiplier: number | null
          status: string
          crashed_at: string | null
          cashed_out_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gift_id?: string | null
          multiplier?: number | null
          status?: string
          crashed_at?: string | null
          cashed_out_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gift_id?: string | null
          multiplier?: number | null
          status?: string
          crashed_at?: string | null
          cashed_out_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Type aliases for easier use
export type User = Database['public']['Tables']['users']['Row']
export type Gift = Database['public']['Tables']['gifts']['Row']
export type GameSession = Database['public']['Tables']['game_sessions']['Row']

