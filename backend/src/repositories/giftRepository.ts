import { PrismaClient, Gift } from '@prisma/client';
import { GiftStatus } from '../services/giftService';

const prisma = new PrismaClient();

export interface CreateGiftData {
  userId: string;
  telegramGiftId: string;
  name?: string;
  thumbnail?: string;
  status: GiftStatus;
}

export interface UpdateGiftData {
  userId?: string | null;
  status?: GiftStatus;
}

class GiftRepository {
  async findById(id: string): Promise<Gift | null> {
    return await prisma.gift.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Gift[]> {
    return await prisma.gift.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: GiftStatus): Promise<Gift[]> {
    return await prisma.gift.findMany({
      where: { status },
    });
  }

  async create(data: CreateGiftData): Promise<Gift> {
    return await prisma.gift.create({
      data,
    });
  }

  async update(id: string, data: UpdateGiftData): Promise<Gift> {
    return await prisma.gift.update({
      where: { id },
      data,
    });
  }
}

export const giftRepository = new GiftRepository();

