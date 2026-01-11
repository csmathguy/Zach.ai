import { describe, expect, it } from '@jest/globals';
import { AuthService } from '@application/services/AuthService';
import { PasswordResetService } from '@application/services/PasswordResetService';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { ISessionRepository } from '@domain/repositories/ISessionRepository';
import type { IPasswordResetTokenRepository } from '@domain/repositories/IPasswordResetTokenRepository';
import type { UserProps } from '@domain/models';
import type { UserRole, UserStatus } from '@domain/types';

const buildUser = (overrides: Partial<UserProps> = {}): UserProps => ({
  id: 'user-1',
  username: 'user',
  email: 'user@example.com',
  name: 'User',
  passwordHash: 'hash',
  role: 'USER' as UserRole,
  status: 'ACTIVE' as UserStatus,
  failedLoginCount: 0,
  lockoutUntil: null,
  lastLoginAt: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
});

describe('AuthService', () => {
  it('resets failed count and lockout on successful login', async () => {
    const user = buildUser({ failedLoginCount: 3, lockoutUntil: new Date() });
    const userRepo: IUserRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getByUsername: jest.fn().mockResolvedValue(user),
      getByEmail: jest.fn(),
      listAll: jest.fn(),
      update: jest.fn().mockResolvedValue(user),
      delete: jest.fn(),
    };
    const sessionRepo: ISessionRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'session-1',
        userId: user.id,
        expiresAt: new Date(),
        createdAt: new Date(),
      }),
      getById: jest.fn(),
      deleteById: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteExpired: jest.fn(),
    };

    const service = new AuthService(userRepo, sessionRepo, {
      verify: async () => true,
    });

    const result = await service.login(
      { identifier: 'user', password: 'ValidPass12!' },
      new Date()
    );

    expect(result.userId).toBe(user.id);
    expect(userRepo.update).toHaveBeenCalledWith(user.id, {
      failedLoginCount: 0,
      lockoutUntil: null,
      lastLoginAt: expect.any(Date),
    });
  });

  it('increments failed login count on invalid password', async () => {
    const user = buildUser({ failedLoginCount: 1 });
    const userRepo: IUserRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getByUsername: jest.fn().mockResolvedValue(user),
      getByEmail: jest.fn(),
      listAll: jest.fn(),
      update: jest.fn().mockResolvedValue(user),
      delete: jest.fn(),
    };
    const sessionRepo: ISessionRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      deleteById: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteExpired: jest.fn(),
    };

    const service = new AuthService(userRepo, sessionRepo, {
      verify: async () => false,
    });

    await expect(
      service.login({ identifier: 'user', password: 'WrongPass12!' }, new Date())
    ).rejects.toThrow();

    expect(userRepo.update).toHaveBeenCalledWith(user.id, {
      failedLoginCount: 2,
    });
  });

  it('locks out after 5 failures in 15 minutes', async () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const user = buildUser({ failedLoginCount: 4 });
    const userRepo: IUserRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getByUsername: jest.fn().mockResolvedValue(user),
      getByEmail: jest.fn(),
      listAll: jest.fn(),
      update: jest.fn().mockResolvedValue(user),
      delete: jest.fn(),
    };
    const sessionRepo: ISessionRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      deleteById: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteExpired: jest.fn(),
    };

    const service = new AuthService(userRepo, sessionRepo, {
      verify: async () => false,
    });

    await expect(
      service.login({ identifier: 'user', password: 'WrongPass12!' }, now)
    ).rejects.toThrow();

    expect(userRepo.update).toHaveBeenCalledWith(user.id, {
      failedLoginCount: 5,
      lockoutUntil: new Date(now.getTime() + 15 * 60 * 1000),
    });
  });

  it('blocks login when lockout is active', async () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const user = buildUser({ lockoutUntil: new Date(now.getTime() + 60_000) });
    const userRepo: IUserRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getByUsername: jest.fn().mockResolvedValue(user),
      getByEmail: jest.fn(),
      listAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const sessionRepo: ISessionRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      deleteById: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteExpired: jest.fn(),
    };

    const service = new AuthService(userRepo, sessionRepo, {
      verify: async () => true,
    });

    await expect(
      service.login({ identifier: 'user', password: 'ValidPass12!' }, now)
    ).rejects.toThrow();
  });
});

describe('PasswordResetService', () => {
  it('stores hashed reset token and returns raw token', async () => {
    const tokenRepo: IPasswordResetTokenRepository = {
      create: jest.fn().mockImplementation(async (token) => token),
      getByTokenHash: jest.fn(),
      markUsed: jest.fn(),
      deleteExpired: jest.fn(),
    };
    const userRepo: IUserRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getByUsername: jest.fn(),
      getByEmail: jest.fn(),
      listAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const service = new PasswordResetService(userRepo, tokenRepo, {
      resetTokenTtlMinutes: 30,
    });

    const result = await service.issueToken('admin-1', 'user-1', new Date());

    expect(result.rawToken).toBeDefined();
    expect(tokenRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash: expect.any(String),
      })
    );
  });

  it('marks token used and prevents reuse', async () => {
    const tokenHash = 'hash-1';
    const tokenRepo: IPasswordResetTokenRepository = {
      create: jest.fn(),
      getByTokenHash: jest.fn().mockResolvedValue({
        id: 'token-1',
        userId: 'user-1',
        createdByUserId: 'admin-1',
        tokenHash,
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
        createdAt: new Date(),
      }),
      markUsed: jest.fn(),
      deleteExpired: jest.fn(),
    };
    const userRepo: IUserRepository = {
      create: jest.fn(),
      getById: jest.fn(),
      getByUsername: jest.fn(),
      getByEmail: jest.fn(),
      listAll: jest.fn(),
      update: jest.fn().mockResolvedValue(buildUser()),
      delete: jest.fn(),
    };

    const service = new PasswordResetService(userRepo, tokenRepo, {
      resetTokenTtlMinutes: 30,
    });

    await service.resetPassword('raw-token', 'NewPass12!', new Date());

    expect(tokenRepo.markUsed).toHaveBeenCalledWith('token-1', expect.any(Date));
  });
});
