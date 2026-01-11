import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from '@infrastructure/prisma/client';
import { PrismaThoughtRepository } from '@infrastructure/prisma/repositories/PrismaThoughtRepository';
import { Thought } from '@domain/models/Thought';
import { User } from '@domain/models/User';
import { PrismaUserRepository } from '@infrastructure/prisma/repositories/PrismaUserRepository';
import type { CreateUserDto } from '@domain/types';

describe('PrismaThoughtRepository', () => {
  let repository: PrismaThoughtRepository;
  let userRepository: PrismaUserRepository;
  let testUser: User;
  let originalConsoleLog: typeof console.log;

  const buildUserDto = (
    email: string,
    name: string,
    overrides: Partial<CreateUserDto> = {}
  ): CreateUserDto => ({
    username: email.split('@')[0],
    email,
    name,
    passwordHash: 'hash',
    role: 'USER',
    status: 'ACTIVE',
    ...overrides,
  });

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
    // Initialize repositories
    repository = new PrismaThoughtRepository(prisma);
    userRepository = new PrismaUserRepository(prisma);

    // Clean up test data before each test
    await prisma.thought.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user for foreign key relations
    testUser = await userRepository.create(buildUserDto('test@example.com', 'Test User'));
  });

  afterEach(async () => {
    // Clean up test data after each test
    await prisma.thought.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('create', () => {
    it('should create thought with all fields', async () => {
      const thought = await repository.create({
        text: 'Test thought',
        userId: testUser.id,
        source: 'manual',
      });

      expect(thought).toBeInstanceOf(Thought);
      expect(thought.id).toBeDefined();
      expect(thought.text).toBe('Test thought');
      expect(thought.userId).toBe(testUser.id);
      expect(thought.source).toBe('manual');
      expect(thought.processedState).toBe('UNPROCESSED');
      expect(thought.timestamp).toBeInstanceOf(Date);
    });

    it('should create thought with default source', async () => {
      const thought = await repository.create({
        text: 'Test thought',
        userId: testUser.id,
      });

      expect(thought.source).toBe('manual');
    });

    it('should create thought with default processedState', async () => {
      const thought = await repository.create({
        text: 'Test thought',
        userId: testUser.id,
      });

      expect(thought.processedState).toBe('UNPROCESSED');
    });

    it('should generate timestamp on creation', async () => {
      const beforeCreation = new Date();
      const thought = await repository.create({
        text: 'Test thought',
        userId: testUser.id,
      });
      const afterCreation = new Date();

      expect(thought.timestamp.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(thought.timestamp.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });

    it('should throw error when userId does not exist', async () => {
      await expect(
        repository.create({
          text: 'Test thought',
          userId: 'nonexistent-user-id',
        })
      ).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return thought when exists', async () => {
      const created = await repository.create({
        text: 'Test thought',
        userId: testUser.id,
      });

      const found = await repository.findById(created.id);

      expect(found).toBeInstanceOf(Thought);
      expect(found?.id).toBe(created.id);
      expect(found?.text).toBe('Test thought');
    });

    it('should return null when thought does not exist', async () => {
      const found = await repository.findById('nonexistent-id');

      expect(found).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('should return thoughts ordered by timestamp DESC', async () => {
      // Create thoughts with slight delay to ensure different timestamps
      const thought1 = await repository.create({
        text: 'First thought',
        userId: testUser.id,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const thought2 = await repository.create({
        text: 'Second thought',
        userId: testUser.id,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const thought3 = await repository.create({
        text: 'Third thought',
        userId: testUser.id,
      });

      const thoughts = await repository.findByUser(testUser.id);

      expect(thoughts).toHaveLength(3);
      expect(thoughts[0].id).toBe(thought3.id); // Most recent first
      expect(thoughts[1].id).toBe(thought2.id);
      expect(thoughts[2].id).toBe(thought1.id); // Oldest last
    });

    it('should return empty array when user has no thoughts', async () => {
      const thoughts = await repository.findByUser(testUser.id);

      expect(thoughts).toEqual([]);
    });

    it('should only return thoughts for specified user', async () => {
      // Create another user
      const otherUser = await userRepository.create(
        buildUserDto('other@example.com', 'Other User')
      );

      // Create thoughts for both users
      await repository.create({
        text: 'Test user thought',
        userId: testUser.id,
      });

      await repository.create({
        text: 'Other user thought',
        userId: otherUser.id,
      });

      const thoughts = await repository.findByUser(testUser.id);

      expect(thoughts).toHaveLength(1);
      expect(thoughts[0].userId).toBe(testUser.id);
    });
  });

  describe('findAll', () => {
    it('should return all thoughts ordered by timestamp DESC', async () => {
      const thought1 = await repository.create({
        text: 'First thought',
        userId: testUser.id,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const thought2 = await repository.create({
        text: 'Second thought',
        userId: testUser.id,
      });

      const thoughts = await repository.findAll();

      expect(thoughts).toHaveLength(2);
      expect(thoughts[0].id).toBe(thought2.id); // Most recent first
      expect(thoughts[1].id).toBe(thought1.id); // Oldest last
    });

    it('should return empty array when no thoughts exist', async () => {
      const thoughts = await repository.findAll();

      expect(thoughts).toEqual([]);
    });
  });

  describe('immutability contract', () => {
    it('should NOT have update method', () => {
      expect((repository as unknown as { update?: unknown }).update).toBeUndefined();
    });

    it('should NOT have delete method', () => {
      expect((repository as unknown as { delete?: unknown }).delete).toBeUndefined();
    });
  });
});
