import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateUserData {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserData {
  username?: string;
  firstName?: string;
  lastName?: string;
}

class UserRepository {
  async findByTelegramId(telegramId: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { telegramId },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return await prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new UserRepository();

