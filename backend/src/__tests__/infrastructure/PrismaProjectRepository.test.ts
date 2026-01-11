import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from '@infrastructure/prisma/client';
import { PrismaProjectRepository } from '@infrastructure/prisma/repositories/PrismaProjectRepository';
import { PrismaUserRepository } from '@infrastructure/prisma/repositories/PrismaUserRepository';
import { PrismaThoughtRepository } from '@infrastructure/prisma/repositories/PrismaThoughtRepository';
import { ProjectStatus } from '@domain/models/Project';
import type { CreateUserDto } from '@domain/types';

describe('PrismaProjectRepository', () => {
  let repository: PrismaProjectRepository;
  let userRepository: PrismaUserRepository;
  let thoughtRepository: PrismaThoughtRepository;
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
    // Clean up database before each test
    await prisma.projectThought.deleteMany({});
    await prisma.action.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.thought.deleteMany({});
    await prisma.user.deleteMany({});

    // Initialize repositories
    repository = new PrismaProjectRepository(prisma);
    userRepository = new PrismaUserRepository(prisma);
    thoughtRepository = new PrismaThoughtRepository(prisma);
  });

  describe('create()', () => {
    it('should create project with all fields', async () => {
      const project = await repository.create({
        title: 'Test Project',
        description: 'A test project',
        status: ProjectStatus.ACTIVE,
      });

      expect(project.id).toBeDefined();
      expect(project.title).toBe('Test Project');
      expect(project.description).toBe('A test project');
      expect(project.status).toBe(ProjectStatus.ACTIVE);
      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
    });

    it('should create project with default status ACTIVE', async () => {
      const project = await repository.create({
        title: 'Test Project',
      });

      expect(project.status).toBe(ProjectStatus.ACTIVE);
    });

    it('should save project to database', async () => {
      const project = await repository.create({
        title: 'Test Project',
      });

      const found = await prisma.project.findUnique({
        where: { id: project.id },
      });

      expect(found).toBeDefined();
      expect(found?.title).toBe('Test Project');
    });
  });

  describe('findById()', () => {
    it('should return project when it exists', async () => {
      const created = await repository.create({
        title: 'Test Project',
      });

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Test Project');
    });

    it('should return null when project not found', async () => {
      const found = await repository.findById('nonexistent-id');

      expect(found).toBeNull();
    });
  });

  describe('findAll()', () => {
    it('should return all projects', async () => {
      await repository.create({ title: 'Project 1' });
      await repository.create({ title: 'Project 2' });
      await repository.create({ title: 'Project 3' });

      const projects = await repository.findAll();

      expect(projects).toHaveLength(3);
    });

    it('should return empty array when no projects exist', async () => {
      const projects = await repository.findAll();

      expect(projects).toEqual([]);
    });

    it('should order projects by updatedAt DESC', async () => {
      const project1 = await repository.create({ title: 'Project 1' });
      // Small delay to ensure different updatedAt timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
      const project2 = await repository.create({ title: 'Project 2' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const project3 = await repository.create({ title: 'Project 3' });

      const projects = await repository.findAll();

      expect(projects[0].id).toBe(project3.id); // Most recent first
      expect(projects[1].id).toBe(project2.id);
      expect(projects[2].id).toBe(project1.id); // Oldest last
    });
  });

  describe('update()', () => {
    it('should update project fields', async () => {
      const project = await repository.create({
        title: 'Old Title',
        description: 'Old description',
      });

      const updated = await repository.update(project.id, {
        title: 'New Title',
        description: 'New description',
      });

      expect(updated.title).toBe('New Title');
      expect(updated.description).toBe('New description');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(project.updatedAt.getTime());
    });

    it('should update only provided fields', async () => {
      const project = await repository.create({
        title: 'Original Title',
        description: 'Original description',
      });

      const updated = await repository.update(project.id, {
        title: 'New Title',
      });

      expect(updated.title).toBe('New Title');
      expect(updated.description).toBe('Original description'); // Unchanged
    });

    it('should allow updating status', async () => {
      const project = await repository.create({
        title: 'Test Project',
        status: ProjectStatus.ACTIVE,
      });

      const updated = await repository.update(project.id, {
        status: ProjectStatus.COMPLETED,
      });

      expect(updated.status).toBe(ProjectStatus.COMPLETED);
    });

    it('should throw when project not found', async () => {
      await expect(repository.update('nonexistent-id', { title: 'New Title' })).rejects.toThrow();
    });
  });

  describe('delete()', () => {
    it('should remove project from database', async () => {
      const project = await repository.create({
        title: 'Test Project',
      });

      await repository.delete(project.id);

      const found = await prisma.project.findUnique({
        where: { id: project.id },
      });

      expect(found).toBeNull();
    });

    it('should be idempotent', async () => {
      const project = await repository.create({
        title: 'Test Project',
      });

      await repository.delete(project.id);

      // Should not throw on second delete
      await expect(repository.delete(project.id)).resolves.not.toThrow();
    });

    it('should nullify projectId on related actions when project is deleted', async () => {
      const project = await repository.create({
        title: 'Project with actions',
      });

      const action = await prisma.action.create({
        data: {
          title: 'Linked action',
          actionType: 'Manual',
          status: 'TODO',
          projectId: project.id,
        },
      });

      await repository.delete(project.id);

      const updatedAction = await prisma.action.findUnique({
        where: { id: action.id },
      });

      expect(updatedAction?.projectId).toBeNull();
    });
  });

  describe('linkThought()', () => {
    it('should create association between project and thought', async () => {
      const user = await userRepository.create(buildUserDto('test@example.com', 'Test User'));

      const thought = await thoughtRepository.create({
        text: 'Test thought',
        userId: user.id,
      });

      const project = await repository.create({
        title: 'Test Project',
      });

      await repository.linkThought(project.id, thought.id);

      // Verify the link exists in database
      const link = await prisma.projectThought.findUnique({
        where: {
          projectId_thoughtId: {
            projectId: project.id,
            thoughtId: thought.id,
          },
        },
      });

      expect(link).toBeDefined();
    });

    it('should be idempotent', async () => {
      const user = await userRepository.create(buildUserDto('test@example.com', 'Test User'));

      const thought = await thoughtRepository.create({
        text: 'Test thought',
        userId: user.id,
      });

      const project = await repository.create({
        title: 'Test Project',
      });

      await repository.linkThought(project.id, thought.id);

      // Should not throw on second link
      await expect(repository.linkThought(project.id, thought.id)).resolves.not.toThrow();
    });

    it('should throw when project not found', async () => {
      const user = await userRepository.create(buildUserDto('test@example.com', 'Test User'));

      const thought = await thoughtRepository.create({
        text: 'Test thought',
        userId: user.id,
      });

      await expect(repository.linkThought('nonexistent-project-id', thought.id)).rejects.toThrow();
    });

    it('should throw when thought not found', async () => {
      const project = await repository.create({
        title: 'Test Project',
      });

      await expect(repository.linkThought(project.id, 'nonexistent-thought-id')).rejects.toThrow();
    });
  });

  describe('unlinkThought()', () => {
    it('should remove association between project and thought', async () => {
      const user = await userRepository.create(buildUserDto('test@example.com', 'Test User'));

      const thought = await thoughtRepository.create({
        text: 'Test thought',
        userId: user.id,
      });

      const project = await repository.create({
        title: 'Test Project',
      });

      await repository.linkThought(project.id, thought.id);
      await repository.unlinkThought(project.id, thought.id);

      // Verify the link no longer exists
      const link = await prisma.projectThought.findUnique({
        where: {
          projectId_thoughtId: {
            projectId: project.id,
            thoughtId: thought.id,
          },
        },
      });

      expect(link).toBeNull();
    });

    it('should be idempotent', async () => {
      const user = await userRepository.create(buildUserDto('test@example.com', 'Test User'));

      const thought = await thoughtRepository.create({
        text: 'Test thought',
        userId: user.id,
      });

      const project = await repository.create({
        title: 'Test Project',
      });

      await repository.linkThought(project.id, thought.id);
      await repository.unlinkThought(project.id, thought.id);

      // Should not throw on second unlink
      await expect(repository.unlinkThought(project.id, thought.id)).resolves.not.toThrow();
    });
  });

  describe('setNextAction()', () => {
    it('should set nextActionId for project', async () => {
      const project = await repository.create({
        title: 'Test Project',
      });

      const action = await prisma.action.create({
        data: {
          title: 'Test Action',
          actionType: 'Manual',
          status: 'TODO',
          projectId: project.id,
        },
      });

      await repository.setNextAction(project.id, action.id);

      const updated = await repository.findById(project.id);

      expect(updated?.nextActionId).toBe(action.id);
    });

    it('should allow clearing nextActionId with null', async () => {
      const project = await repository.create({
        title: 'Test Project',
      });

      const action = await prisma.action.create({
        data: {
          title: 'Test Action',
          actionType: 'Manual',
          status: 'TODO',
          projectId: project.id,
        },
      });

      await repository.setNextAction(project.id, action.id);
      await repository.setNextAction(project.id, null);

      const updated = await repository.findById(project.id);

      expect(updated?.nextActionId).toBeNull();
    });

    it('should throw when project not found', async () => {
      const action = await prisma.action.create({
        data: {
          title: 'Test Action',
          actionType: 'Manual',
          status: 'TODO',
        },
      });

      await expect(repository.setNextAction('nonexistent-project-id', action.id)).rejects.toThrow();
    });

    it('should throw when action does not belong to the project', async () => {
      const projectA = await repository.create({
        title: 'Project A',
      });

      const projectB = await repository.create({
        title: 'Project B',
      });

      const action = await prisma.action.create({
        data: {
          title: 'Project B action',
          actionType: 'Manual',
          status: 'TODO',
          projectId: projectB.id,
        },
      });

      await expect(repository.setNextAction(projectA.id, action.id)).rejects.toThrow(
        'Action does not belong to the specified project'
      );
    });

    it('should throw when action does not exist', async () => {
      const project = await repository.create({
        title: 'Project with missing action',
      });

      await expect(repository.setNextAction(project.id, 'nonexistent-action')).rejects.toThrow(
        'Action with id'
      );
    });
  });
});
