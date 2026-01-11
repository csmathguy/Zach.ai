import { describe, it, expect, beforeEach } from '@jest/globals';
import { prisma } from '@infrastructure/prisma/client';
import { PrismaUserRepository } from '@infrastructure/prisma/repositories/PrismaUserRepository';
import { PrismaSessionRepository } from '@infrastructure/prisma/repositories/PrismaSessionRepository';
import { PrismaPasswordResetTokenRepository } from '@infrastructure/prisma/repositories/PrismaPasswordResetTokenRepository';
import type { CreateUserDto } from '@domain/types';

describe('Prisma auth repositories', () => {
  const buildUserDto = (overrides: Partial<CreateUserDto> = {}): CreateUserDto => ({
    username: 'test-user',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hash',
    role: 'USER',
    status: 'ACTIVE',
    ...overrides,
  });

  const userRepository = new PrismaUserRepository(prisma);
  const sessionRepository = new PrismaSessionRepository(prisma);
  const tokenRepository = new PrismaPasswordResetTokenRepository(prisma);

  beforeEach(async () => {
    await prisma.passwordResetToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('User repository', () => {
    it('enforces unique username', async () => {
      await userRepository.create(buildUserDto({ username: 'dup', email: 'a@example.com' }));

      await expect(
        userRepository.create(buildUserDto({ username: 'dup', email: 'b@example.com' }))
      ).rejects.toThrow();
    });

    it('getById returns null when missing', async () => {
      const result = await userRepository.getById('00000000-0000-0000-0000-000000000000');
      expect(result).toBeNull();
    });

    it('getByUsername returns user when exists', async () => {
      await userRepository.create(buildUserDto({ username: 'zach' }));

      const result = await userRepository.getByUsername('zach');
      expect(result?.username).toBe('zach');
    });

    it('getByEmail returns null when missing', async () => {
      const result = await userRepository.getByEmail('missing@example.com');
      expect(result).toBeNull();
    });
  });

  describe('Session repository', () => {
    it('creates and retrieves a session', async () => {
      const user = await userRepository.create(buildUserDto({ username: 'session-user' }));

      const created = await sessionRepository.create({
        id: 'session-1',
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      });

      const found = await sessionRepository.getById(created.id);
      expect(found?.userId).toBe(user.id);
    });

    it('deleteById is idempotent', async () => {
      await expect(sessionRepository.deleteById('missing-session')).resolves.not.toThrow();
    });

    it('deleteByUserId removes user sessions', async () => {
      const user = await userRepository.create(buildUserDto({ username: 'session-delete-user' }));
      const other = await userRepository.create(
        buildUserDto({ username: 'session-keep-user', email: 'keep@example.com' })
      );

      await sessionRepository.create({
        id: 'session-a',
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      });
      await sessionRepository.create({
        id: 'session-b',
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      });
      await sessionRepository.create({
        id: 'session-c',
        userId: other.id,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      });

      await sessionRepository.deleteByUserId(user.id);

      const remaining = await prisma.session.findMany();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].userId).toBe(other.id);
    });

    it('deleteExpired removes expired sessions', async () => {
      const user = await userRepository.create(
        buildUserDto({ username: 'expired-user', email: 'expired@example.com' })
      );

      await sessionRepository.create({
        id: 'session-expired',
        userId: user.id,
        expiresAt: new Date(Date.now() - 1_000),
        createdAt: new Date(),
      });
      await sessionRepository.create({
        id: 'session-active',
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      });

      const removed = await sessionRepository.deleteExpired(new Date());
      expect(removed).toBe(1);
      const remaining = await prisma.session.findMany();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('session-active');
    });
  });

  describe('Password reset token repository', () => {
    it('finds token by hash', async () => {
      const admin = await userRepository.create(buildUserDto({ username: 'admin' }));
      const user = await userRepository.create(
        buildUserDto({ username: 'target', email: 't@example.com' })
      );

      const token = await tokenRepository.create({
        id: 'token-1',
        userId: user.id,
        createdByUserId: admin.id,
        tokenHash: 'hash-1',
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      });

      const found = await tokenRepository.getByTokenHash(token.tokenHash);
      expect(found?.id).toBe(token.id);
    });

    it('deleteExpired removes expired tokens', async () => {
      const admin = await userRepository.create(
        buildUserDto({ username: 'admin-2', email: 'a2@example.com' })
      );
      const user = await userRepository.create(
        buildUserDto({ username: 'target-2', email: 't2@example.com' })
      );

      await tokenRepository.create({
        id: 'token-expired',
        userId: user.id,
        createdByUserId: admin.id,
        tokenHash: 'hash-expired',
        expiresAt: new Date(Date.now() - 1000),
        createdAt: new Date(),
      });

      const removed = await tokenRepository.deleteExpired(new Date());
      expect(removed).toBeGreaterThanOrEqual(1);
    });
  });
});
