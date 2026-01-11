import { PrismaClient } from '@prisma/client';
import type { PasswordResetToken } from '@domain/types';
import type { IPasswordResetTokenRepository } from '@domain/repositories/IPasswordResetTokenRepository';

export class PrismaPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(private prisma: PrismaClient) {}

  async create(token: PasswordResetToken): Promise<PasswordResetToken> {
    const created = await this.prisma.passwordResetToken.create({
      data: {
        id: token.id,
        userId: token.userId,
        createdByUserId: token.createdByUserId,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
        usedAt: token.usedAt ?? null,
        createdAt: token.createdAt,
      },
    });

    return created;
  }

  async getByTokenHash(hash: string): Promise<PasswordResetToken | null> {
    return this.prisma.passwordResetToken.findUnique({ where: { tokenHash: hash } });
  }

  async markUsed(id: string, usedAt: Date): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt },
    });
  }

  async deleteExpired(now: Date): Promise<number> {
    const result = await this.prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    return result.count;
  }
}
