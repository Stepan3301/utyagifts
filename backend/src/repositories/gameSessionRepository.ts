import { supabase, type GameSession } from '../lib/supabase'

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
  async findById(id: string): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('GameSession')
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

  async findActiveByUserId(userId: string): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('GameSession')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'active')
      .order('createdAt', { ascending: false })
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

  async findByUserId(userId: string, limit: number, offset: number): Promise<GameSession[]> {
    const { data, error } = await supabase
      .from('GameSession')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return data ?? []
  }

  async create(data: CreateSessionData): Promise<GameSession> {
    const { data: session, error } = await supabase
      .from('GameSession')
      .insert({
        userId: data.userId,
        giftId: data.giftId,
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

  async update(id: string, data: UpdateSessionData): Promise<GameSession> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (data.status !== undefined) {
      updateData.status = data.status
    }
    if (data.crashedAt !== undefined) {
      updateData.crashedAt = data.crashedAt
    }
    if (data.cashedOutAt !== undefined) {
      updateData.cashedOutAt = data.cashedOutAt
    }

    const { data: session, error } = await supabase
      .from('GameSession')
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
