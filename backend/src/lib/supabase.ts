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

// Database types (matching Prisma schema)
export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          telegramId: number
          username: string | null
          firstName: string | null
          lastName: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          telegramId: number
          username?: string | null
          firstName?: string | null
          lastName?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          telegramId?: number
          username?: string | null
          firstName?: string | null
          lastName?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      Gift: {
        Row: {
          id: string
          userId: string | null
          telegramGiftId: string
          name: string | null
          thumbnail: string | null
          status: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId?: string | null
          telegramGiftId: string
          name?: string | null
          thumbnail?: string | null
          status?: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string | null
          telegramGiftId?: string
          name?: string | null
          thumbnail?: string | null
          status?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      GameSession: {
        Row: {
          id: string
          userId: string
          giftId: string
          multiplier: number
          status: string
          crashedAt: number | null
          cashedOutAt: number | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          giftId: string
          multiplier: number
          status?: string
          crashedAt?: number | null
          cashedOutAt?: number | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          userId?: string
          giftId?: string
          multiplier?: number
          status?: string
          crashedAt?: number | null
          cashedOutAt?: number | null
          createdAt?: string
          updatedAt?: string
        }
      }
    }
  }
}

// Type aliases for easier use
export type User = Database['public']['Tables']['User']['Row']
export type Gift = Database['public']['Tables']['Gift']['Row']
export type GameSession = Database['public']['Tables']['GameSession']['Row']

