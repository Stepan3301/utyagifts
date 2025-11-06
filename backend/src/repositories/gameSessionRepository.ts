import { PrismaClient, GameSession } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateSessionData {
  userId: string;
  giftId: string;
  multiplier: number;
  status: 'active' | 'crashed' | 'cashed_out';
}

export interface UpdateSessionData {
  status?: 'active' | 'crashed' | 'cashed_out';
  crashedAt?: number;
  cashedOutAt?: number;
}

class GameSessionRepository {
  async findById(id: string): Promise<GameSession | null> {
    return await prisma.gameSession.findUnique({
      where: { id },
    });
  }

  async findActiveByUserId(userId: string): Promise<GameSession | null> {
    return await prisma.gameSession.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string, limit: number, offset: number): Promise<GameSession[]> {
    return await prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async create(data: CreateSessionData): Promise<GameSession> {
    return await prisma.gameSession.create({
      data,
    });
  }

  async update(id: string, data: UpdateSessionData): Promise<GameSession> {
    return await prisma.gameSession.update({
      where: { id },
      data,
    });
  }
}

export const gameSessionRepository = new GameSessionRepository();

