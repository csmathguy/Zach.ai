import { PrismaClient } from '@prisma/client';
import type { Session } from '@domain/types';
import type { ISessionRepository } from '@domain/repositories/ISessionRepository';

export class PrismaSessionRepository implements ISessionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(session: Session): Promise<Session> {
    const created = await this.prisma.session.create({
      data: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      },
    });

    return created;
  }

  async getById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { id } });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async deleteExpired(now: Date): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    return result.count;
  }
}
