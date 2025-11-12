import { supabase, type Gift } from '../lib/supabase'
import { GiftStatus } from '../services/giftService'

export interface CreateGiftData {
  userId: string
  telegramGiftId: string
  name?: string
  thumbnail?: string
  status: GiftStatus
}

export interface UpdateGiftData {
  userId?: string | null
  status?: GiftStatus
}

class GiftRepository {
  async findById(id: string): Promise<Gift | null> {
    const { data, error } = await supabase
      .from('Gift')
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

  async findByUserId(userId: string): Promise<Gift[]> {
    const { data, error } = await supabase
      .from('Gift')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })

    if (error) {
      throw error
    }

    return data ?? []
  }

  async findByStatus(status: GiftStatus): Promise<Gift[]> {
    const { data, error } = await supabase
      .from('Gift')
      .select('*')
      .eq('status', status)

    if (error) {
      throw error
    }

    return data ?? []
  }

  async create(data: CreateGiftData): Promise<Gift> {
    const { data: gift, error } = await supabase
      .from('Gift')
      .insert({
        userId: data.userId,
        telegramGiftId: data.telegramGiftId,
        name: data.name ?? null,
        thumbnail: data.thumbnail ?? null,
        status: data.status,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return gift
  }

  async update(id: string, data: UpdateGiftData): Promise<Gift> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (data.userId !== undefined) {
      updateData.userId = data.userId
    }
    if (data.status !== undefined) {
      updateData.status = data.status
    }

    const { data: gift, error } = await supabase
      .from('Gift')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return gift
  }
}

export const giftRepository = new GiftRepository()
