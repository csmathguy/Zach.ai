import crypto from 'crypto';
import { AppError } from '@/errors/AppError';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { IPasswordResetTokenRepository } from '@domain/repositories/IPasswordResetTokenRepository';

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

export interface ResetConfig {
  resetTokenTtlMinutes: number;
}

export interface ResetTokenResult {
  rawToken: string;
}

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

export class PasswordResetService {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: IPasswordResetTokenRepository,
    private config: ResetConfig,
    private passwordHasher?: PasswordHasher
  ) {}

  async issueToken(adminUserId: string, userId: string, now: Date): Promise<ResetTokenResult> {
    const rawToken = crypto.randomUUID();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(now.getTime() + this.config.resetTokenTtlMinutes * 60 * 1000);

    await this.tokenRepository.create({
      id: crypto.randomUUID(),
      userId,
      createdByUserId: adminUserId,
      tokenHash,
      expiresAt,
      usedAt: null,
      createdAt: now,
    });

    return { rawToken };
  }

  async resetPassword(token: string, newPassword: string, now: Date): Promise<void> {
    const tokenHash = hashToken(token);
    const record = await this.tokenRepository.getByTokenHash(tokenHash);
    if (!record) {
      throw new AppError(400, 'Invalid reset token');
    }

    if (record.usedAt) {
      throw new AppError(400, 'Reset token already used');
    }

    if (record.expiresAt < now) {
      throw new AppError(400, 'Reset token expired');
    }

    if (this.passwordHasher) {
      const hashed = await this.passwordHasher.hash(newPassword);
      await this.userRepository.update(record.userId, { passwordHash: hashed });
    }

    await this.tokenRepository.markUsed(record.id, now);
  }
}
