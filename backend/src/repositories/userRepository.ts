import { supabase, type User } from '../lib/supabase'

export interface CreateUserData {
  telegramId: number
  username?: string
  firstName?: string
  lastName?: string
}

export interface UpdateUserData {
  username?: string
  firstName?: string
  lastName?: string
}

class UserRepository {
  async findByTelegramId(telegramId: number): Promise<User | null> {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('telegramId', telegramId)
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

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('User')
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

  async create(data: CreateUserData): Promise<User> {
    const { data: user, error } = await supabase
      .from('User')
      .insert({
        telegramId: data.telegramId,
        username: data.username ?? null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return user
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const { data: user, error } = await supabase
      .from('User')
      .update({
        username: data.username ?? undefined,
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return user
  }
}

export const userRepository = new UserRepository()
