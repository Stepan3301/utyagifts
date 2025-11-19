import { supabase, type GameSession as DBGameSession } from '../lib/supabase'

export interface CreateSessionData {
  userId: string
  giftId: string
  multiplier: number
  status: 'active' | 'crashed' | 'cashed_out'
}

export interface UpdateSessionData {
  status?: 'active' | 'crashed' | 'cashed_out'
  crashedAt?: number
  cashedOutAt?: number
}

class GameSessionRepository {
  async findById(id: string): Promise<DBGameSession | null> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw error
    }

    return data
  }

  async findActiveByUserId(userId: string): Promise<DBGameSession | null> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw error
    }

    return data
  }

  async findByUserId(userId: string, limit: number, offset: number): Promise<DBGameSession[]> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return data ?? []
  }

  async create(data: CreateSessionData): Promise<DBGameSession> {
    const { data: session, error } = await supabase
      .from('game_sessions')
      .insert({
        user_id: data.userId,
        gift_id: data.giftId,
        multiplier: data.multiplier,
        status: data.status,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return session
  }

  async update(id: string, data: UpdateSessionData): Promise<DBGameSession> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (data.status !== undefined) {
      updateData.status = data.status
    }
    if (data.crashedAt !== undefined) {
      updateData.crashed_at = new Date(data.crashedAt).toISOString()
    }
    if (data.cashedOutAt !== undefined) {
      updateData.cashed_out_at = new Date(data.cashedOutAt).toISOString()
    }

    const { data: session, error } = await supabase
      .from('game_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return session
  }
}

export const gameSessionRepository = new GameSessionRepository()
