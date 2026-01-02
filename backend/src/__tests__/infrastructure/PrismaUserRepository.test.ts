import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '@infrastructure/prisma/client';
import { PrismaUserRepository } from '@infrastructure/prisma/repositories/PrismaUserRepository';
import { User } from '@domain/models/User';
import { CreateUserDto, UpdateUserDto } from '@domain/types';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let originalConsoleLog: typeof console.log;

  beforeAll(() => {
    // Suppress Prisma error logs during tests (expected errors from error condition tests)
    originalConsoleLog = console.log;
    console.log = (...args: unknown[]) => {
      const message = String(args[0]);
      if (message.includes('prisma:error')) {
        return; // Suppress Prisma error logs
      }
      originalConsoleLog(...args);
    };
  });

  afterAll(() => {
    // Restore original console.log
    console.log = originalConsoleLog;
  });

  beforeEach(async () => {
    // Use shared prisma client singleton
    repository = new PrismaUserRepository(prisma);

    // Clean up test data before each test
    await prisma.user.deleteMany({});
  });

  afterEach(async () => {
    // Clean up test data after each test
    await prisma.user.deleteMany({});
  });

  describe('create()', () => {
    it('should create user and save to database', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = await repository.create(dto);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.createdAt).toBeInstanceOf(Date);

      // Verify in database
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(dbUser).toBeDefined();
      if (dbUser) {
        expect(dbUser.email).toBe('test@example.com');
      }
    });

    it('should throw on duplicate email', async () => {
      const dto: CreateUserDto = {
        email: 'duplicate@example.com',
        name: 'User One',
      };

      await repository.create(dto);

      await expect(
        repository.create({ email: 'duplicate@example.com', name: 'User Two' })
      ).rejects.toThrow();
    });
  });

  describe('findById()', () => {
    it('should return user when found', async () => {
      const created = await repository.create({
        email: 'find@example.com',
        name: 'Find User',
      });

      const found = await repository.findById(created.id);

      expect(found).toBeInstanceOf(User);
      if (found) {
        expect(found.id).toBe(created.id);
        expect(found.email).toBe('find@example.com');
      }
    });

    it('should return null when user not found', async () => {
      const found = await repository.findById('00000000-0000-0000-0000-000000000000');

      expect(found).toBeNull();
    });
  });

  describe('findByEmail()', () => {
    it('should return user when email exists', async () => {
      await repository.create({
        email: 'findbyemail@example.com',
        name: 'Email User',
      });

      const found = await repository.findByEmail('findbyemail@example.com');

      expect(found).toBeInstanceOf(User);
      if (found) {
        expect(found.email).toBe('findbyemail@example.com');
      }
    });

    it('should return null when email not found', async () => {
      const found = await repository.findByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });
  });

  describe('findAll()', () => {
    it('should return all users', async () => {
      await repository.create({ email: 'user1@example.com', name: 'User 1' });
      await repository.create({ email: 'user2@example.com', name: 'User 2' });
      await repository.create({ email: 'user3@example.com', name: 'User 3' });

      const users = await repository.findAll();

      expect(users).toHaveLength(3);
      expect(users[0]).toBeInstanceOf(User);
    });

    it('should return empty array when no users exist', async () => {
      const users = await repository.findAll();

      expect(users).toEqual([]);
      expect(users).toHaveLength(0);
    });
  });

  describe('update()', () => {
    it('should update user fields', async () => {
      const created = await repository.create({
        email: 'update@example.com',
        name: 'Old Name',
      });

      const updateDto: UpdateUserDto = {
        name: 'New Name',
      };

      const updated = await repository.update(created.id, updateDto);

      expect(updated).toBeInstanceOf(User);
      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('New Name');
      expect(updated.email).toBe('update@example.com');
    });

    it('should update email', async () => {
      const created = await repository.create({
        email: 'old@example.com',
        name: 'Test User',
      });

      const updated = await repository.update(created.id, {
        email: 'new@example.com',
      });

      expect(updated.email).toBe('new@example.com');
      expect(updated.name).toBe('Test User');
    });

    it('should throw when user not found', async () => {
      await expect(
        repository.update('00000000-0000-0000-0000-000000000000', { name: 'New Name' })
      ).rejects.toThrow();
    });
  });

  describe('delete()', () => {
    it('should delete user from database', async () => {
      const created = await repository.create({
        email: 'delete@example.com',
        name: 'Delete User',
      });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should be idempotent (no error if already deleted)', async () => {
      const created = await repository.create({
        email: 'idempotent@example.com',
        name: 'Idempotent User',
      });

      await repository.delete(created.id);

      // Delete again - should not throw
      await expect(repository.delete(created.id)).resolves.not.toThrow();
    });

    it('should not throw when deleting non-existent user', async () => {
      await expect(
        repository.delete('00000000-0000-0000-0000-000000000000')
      ).resolves.not.toThrow();
    });
  });
});
