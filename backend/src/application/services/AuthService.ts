import crypto from 'crypto';
import { AppError } from '@/errors/AppError';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { ISessionRepository } from '@domain/repositories/ISessionRepository';

export interface PasswordHasher {
  verify(password: string, hash: string): Promise<boolean>;
}

export interface AuthConfig {
  sessionTtlMinutes: number;
  lockoutThreshold: number;
  lockoutWindowMinutes: number;
}

export interface LoginResult {
  userId: string;
  sessionId: string;
  expiresAt: Date;
}

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository,
    private passwordHasher: PasswordHasher,
    private config: AuthConfig = {
      sessionTtlMinutes: 240,
      lockoutThreshold: 5,
      lockoutWindowMinutes: 15,
    }
  ) {}

  async login(params: { identifier: string; password: string }, now: Date): Promise<LoginResult> {
    const identifier = params.identifier.trim();
    const user = identifier.includes('@')
      ? await this.userRepository.getByEmail(identifier)
      : await this.userRepository.getByUsername(identifier);

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (user.lockoutUntil && user.lockoutUntil > now) {
      throw new AppError(423, 'Account locked');
    }

    const isValid = await this.passwordHasher.verify(params.password, user.passwordHash);
    if (!isValid) {
      const failedLoginCount = user.failedLoginCount + 1;
      const update: Record<string, unknown> = { failedLoginCount };

      if (failedLoginCount >= this.config.lockoutThreshold) {
        update.lockoutUntil = new Date(
          now.getTime() + this.config.lockoutWindowMinutes * 60 * 1000
        );
      }

      await this.userRepository.update(user.id, update);
      throw new AppError(401, 'Invalid credentials');
    }

    await this.userRepository.update(user.id, {
      failedLoginCount: 0,
      lockoutUntil: null,
      lastLoginAt: now,
    });

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(now.getTime() + this.config.sessionTtlMinutes * 60 * 1000);
    await this.sessionRepository.create({
      id: sessionId,
      userId: user.id,
      expiresAt,
      createdAt: now,
    });

    return { userId: user.id, sessionId, expiresAt };
  }
}
