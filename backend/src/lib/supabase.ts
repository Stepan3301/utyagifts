import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable')
}

if (!supabaseAnonKey && !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY environment variable')
}

const supabaseKey = supabaseServiceKey ?? supabaseAnonKey!

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // We're using server-side, no session persistence needed
    },
})

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
          animation_tgs_path: string | null
          floor_price: number | null // Floor price in TON
          floor_price_asset: string | null // Currency (default: TON)
          model: string | null // NFT model name
          collection_id: number | null // Portals collection ID
          floor_price_updated_at: string | null // Last price update timestamp
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
          animation_tgs_path?: string | null
          floor_price?: number | null
          floor_price_asset?: string | null
          model?: string | null
          collection_id?: number | null
          floor_price_updated_at?: string | null
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
          animation_tgs_path?: string | null
          floor_price?: number | null
          floor_price_asset?: string | null
          model?: string | null
          collection_id?: number | null
          floor_price_updated_at?: string | null
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
          countdown_ends_at: string | null
          started_at: string | null
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
          countdown_ends_at?: string | null
          started_at?: string | null
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
          countdown_ends_at?: string | null
          started_at?: string | null
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

