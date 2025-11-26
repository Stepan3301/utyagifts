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
  name?: string
  animationData?: any // Lottie JSON object
  giftUrl?: string // Telegram gift URL
  imageUrl?: string | null
  animationTgsPath?: string | null
}

class GiftRepository {
  async findById(id: string): Promise<Gift | null> {
    const { data, error } = await supabase
      .from('gifts')
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
    // Gifts are stored in user_gifts table, not directly in gifts
    // This needs to query user_gifts and join with gifts
    const { data, error } = await supabase
      .from('user_gifts')
      .select('gift_id, gifts(*)')
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    // Map the joined data to Gift array
    return (data ?? []).map((item: any) => item.gifts).filter(Boolean)
  }

  async findByStatus(_status: GiftStatus): Promise<Gift[]> {
    // Note: gifts table doesn't have status column
    // This would need to query user_gifts or a different approach
    // For now, return empty array as this might need schema changes
    const { data, error } = await supabase
      .from('gifts')
      .select('*')

    if (error) {
      throw error
    }

    // Filter by status if needed (would require schema changes)
    return data ?? []
  }

  async create(data: CreateGiftData): Promise<Gift> {
    // First create the gift
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .insert({
        name: data.name ?? null,
        description: null,
        image_url: data.thumbnail ?? null,
        animation_url: null,
        external_url: null,
        rarity: null,
      })
      .select()
      .single()

    if (giftError) {
      throw giftError
    }

    // Then add to user_gifts
    const { error: userGiftError } = await supabase
      .from('user_gifts')
      .insert({
        user_id: data.userId,
        gift_id: gift.id,
        quantity: 1,
        metadata: {
          telegram_gift_id: data.telegramGiftId,
          status: data.status,
        },
      })

    if (userGiftError) {
      throw userGiftError
    }

    return gift
  }

  async update(id: string, data: UpdateGiftData): Promise<Gift> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (data.name !== undefined) {
      updateData.name = data.name
    }

    if (data.animationData !== undefined) {
      updateData.animation_data = data.animationData
    }

    if (data.giftUrl !== undefined) {
      updateData.gift_url = data.giftUrl
    }

    if (data.imageUrl !== undefined) {
      updateData.image_url = data.imageUrl
    }

    if (data.animationTgsPath !== undefined) {
      updateData.animation_tgs_path = data.animationTgsPath
    }

    const { data: gift, error } = await supabase
      .from('gifts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // If userId changed, update user_gifts
    if (data.userId !== undefined) {
      if (data.userId === null) {
        // Remove from user_gifts
        await supabase
          .from('user_gifts')
          .delete()
          .eq('gift_id', id)
      } else {
        // Update or create user_gifts entry
        const { error: userGiftError } = await supabase
          .from('user_gifts')
          .upsert({
            user_id: data.userId,
            gift_id: id,
            quantity: 1,
          })

        if (userGiftError) {
          throw userGiftError
        }
      }
    }

    return gift
  }
}

export const giftRepository = new GiftRepository()
