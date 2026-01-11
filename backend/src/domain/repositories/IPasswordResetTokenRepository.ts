import type { PasswordResetToken } from '@domain/types/passwordResetToken.types';

export interface IPasswordResetTokenRepository {
  create(token: PasswordResetToken): Promise<PasswordResetToken>;
  getByTokenHash(hash: string): Promise<PasswordResetToken | null>;
  markUsed(id: string, usedAt: Date): Promise<void>;
  deleteExpired(now: Date): Promise<number>;
}
