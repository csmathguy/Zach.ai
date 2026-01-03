import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from '@infrastructure/prisma/client';
import { PrismaActionRepository } from '@infrastructure/prisma/repositories/PrismaActionRepository';
import { Action } from '@domain/models/Action';
import { ActionType, ActionStatus } from '@domain/models/Action';
import { randomUUID } from 'crypto';

describe('PrismaActionRepository', () => {
  let repository: PrismaActionRepository;
  let originalConsoleLog: typeof console.log;

  // Test user for FK constraints
  const testUserId = randomUUID();
  // Test project for FK constraints
  const testProjectId = randomUUID();
  // Test thought for linking
  const testThoughtId = randomUUID();

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

  afterAll(async () => {
    // Restore original console.log
    console.log = originalConsoleLog;
  });

  beforeEach(async () => {
    repository = new PrismaActionRepository(prisma);

    // Clean all tables (maintain referential integrity order)
    await prisma.actionAssignee.deleteMany({});
    await prisma.actionThought.deleteMany({});
    await prisma.projectThought.deleteMany({});
    await prisma.action.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.thought.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user for FK constraints
    await prisma.user.create({
      data: {
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    // Create test project for FK constraints
    await prisma.project.create({
      data: {
        id: testProjectId,
        title: 'Test Project',
        description: 'Test Description',
        status: 'ACTIVE',
      },
    });

    // Create test thought for linking
    await prisma.thought.create({
      data: {
        id: testThoughtId,
        text: 'Test thought for action linking',
        userId: testUserId,
      },
    });
  });

  // CRUD Operations
  describe('create()', () => {
    it('should save action to database with generated UUID', async () => {
      const action = await repository.create({
        title: 'New Action',
        actionType: ActionType.Manual,
      });

      expect(action).toBeInstanceOf(Action);
      expect(action.id).toBeDefined();
      expect(action.title).toBe('New Action');

      // Verify in database
      const dbAction = await prisma.action.findUnique({ where: { id: action.id } });
      expect(dbAction).toBeDefined();
      expect(dbAction?.title).toBe('New Action');
    });

    it('should set default status=TODO if not provided', async () => {
      const action = await repository.create({
        title: 'Action Without Status',
        actionType: ActionType.Manual,
      });

      expect(action.status).toBe(ActionStatus.TODO);

      const dbAction = await prisma.action.findUnique({ where: { id: action.id } });
      expect(dbAction?.status).toBe('TODO');
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      const before = new Date();
      const action = await repository.create({
        title: 'Timestamped Action',
        actionType: ActionType.Manual,
      });
      const after = new Date();

      expect(action.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(action.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(action.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(action.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should allow null projectId (inbox actions)', async () => {
      const action = await repository.create({
        title: 'Inbox Action',
        actionType: ActionType.Manual,
        projectId: null,
      });

      expect(action.projectId).toBeNull();

      const dbAction = await prisma.action.findUnique({ where: { id: action.id } });
      expect(dbAction?.projectId).toBeNull();
    });

    it('should link action to project when projectId provided', async () => {
      const action = await repository.create({
        title: 'Project Action',
        actionType: ActionType.Manual,
        projectId: testProjectId,
      });

      expect(action.projectId).toBe(testProjectId);

      const dbAction = await prisma.action.findUnique({ where: { id: action.id } });
      expect(dbAction?.projectId).toBe(testProjectId);
    });
  });

  describe('findById()', () => {
    it('should return Action from database', async () => {
      const created = await repository.create({
        title: 'Find Me',
        actionType: ActionType.Manual,
      });

      const found = await repository.findById(created.id);

      expect(found).toBeInstanceOf(Action);
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Find Me');
    });

    it('should return null when action not found (NOT throws)', async () => {
      const notFound = await repository.findById('nonexistent-id');

      expect(notFound).toBeNull();
    });
  });

  describe('findByProject()', () => {
    it('should return actions for specific project', async () => {
      await repository.create({
        title: 'Project Action 1',
        actionType: ActionType.Manual,
        projectId: testProjectId,
      });
      await repository.create({
        title: 'Project Action 2',
        actionType: ActionType.AgentTask,
        projectId: testProjectId,
      });

      // Create another project for testing filtering
      const otherProjectId = randomUUID();
      await prisma.project.create({
        data: {
          id: otherProjectId,
          title: 'Other Project',
          status: 'ACTIVE',
        },
      });

      await repository.create({
        title: 'Other Project Action',
        actionType: ActionType.Manual,
        projectId: otherProjectId,
      });

      const actions = await repository.findByProject(testProjectId);

      expect(actions).toHaveLength(2);
      expect(actions[0].title).toBe('Project Action 1');
      expect(actions[1].title).toBe('Project Action 2');
    });

    it('should return empty array when project has no actions', async () => {
      const emptyProjectId = randomUUID();
      await prisma.project.create({
        data: {
          id: emptyProjectId,
          title: 'Empty Project',
          status: 'ACTIVE',
        },
      });

      const actions = await repository.findByProject(emptyProjectId);

      expect(actions).toEqual([]);
    });

    it('should order by createdAt ASC', async () => {
      // Create actions with slight delay to ensure ordering
      const action1 = await repository.create({
        title: 'First Action',
        actionType: ActionType.Manual,
        projectId: testProjectId,
      });

      await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay

      const action2 = await repository.create({
        title: 'Second Action',
        actionType: ActionType.Manual,
        projectId: testProjectId,
      });

      const actions = await repository.findByProject(testProjectId);

      expect(actions).toHaveLength(2);
      expect(actions[0].id).toBe(action1.id);
      expect(actions[1].id).toBe(action2.id);
    });
  });

  describe('findByType()', () => {
    it('should return actions of specific type', async () => {
      await repository.create({ title: 'Manual 1', actionType: ActionType.Manual });
      await repository.create({ title: 'Manual 2', actionType: ActionType.Manual });
      await repository.create({ title: 'Agent Task', actionType: ActionType.AgentTask });

      const manualActions = await repository.findByType(ActionType.Manual);

      expect(manualActions).toHaveLength(2);
      expect(manualActions[0].actionType).toBe(ActionType.Manual);
      expect(manualActions[1].actionType).toBe(ActionType.Manual);
    });

    it('should return empty array when no actions of type exist', async () => {
      await repository.create({ title: 'Manual', actionType: ActionType.Manual });

      const clarifications = await repository.findByType(ActionType.Clarification);

      expect(clarifications).toEqual([]);
    });
  });

  describe('findByStatus()', () => {
    it('should return actions of specific status', async () => {
      await repository.create({
        title: 'Todo 1',
        actionType: ActionType.Manual,
        status: ActionStatus.TODO,
      });
      await repository.create({
        title: 'Todo 2',
        actionType: ActionType.Manual,
        status: ActionStatus.TODO,
      });
      await repository.create({
        title: 'In Progress',
        actionType: ActionType.Manual,
        status: ActionStatus.IN_PROGRESS,
      });

      const todoActions = await repository.findByStatus(ActionStatus.TODO);

      expect(todoActions).toHaveLength(2);
      expect(todoActions[0].status).toBe(ActionStatus.TODO);
      expect(todoActions[1].status).toBe(ActionStatus.TODO);
    });

    it('should include actions from all projects', async () => {
      const project2Id = randomUUID();
      await prisma.project.create({
        data: { id: project2Id, title: 'Project 2', status: 'ACTIVE' },
      });

      await repository.create({
        title: 'Project 1 Todo',
        actionType: ActionType.Manual,
        projectId: testProjectId,
        status: ActionStatus.TODO,
      });
      await repository.create({
        title: 'Project 2 Todo',
        actionType: ActionType.Manual,
        projectId: project2Id,
        status: ActionStatus.TODO,
      });

      const todoActions = await repository.findByStatus(ActionStatus.TODO);

      expect(todoActions).toHaveLength(2);
    });
  });

  describe('findInbox()', () => {
    it('should return actions where projectId is null', async () => {
      await repository.create({
        title: 'Inbox Action 1',
        actionType: ActionType.Manual,
        projectId: null,
      });
      await repository.create({
        title: 'Inbox Action 2',
        actionType: ActionType.Clarification,
        projectId: null,
      });
      await repository.create({
        title: 'Project Action',
        actionType: ActionType.Manual,
        projectId: testProjectId,
      });

      const inboxActions = await repository.findInbox();

      expect(inboxActions).toHaveLength(2);
      expect(inboxActions[0].projectId).toBeNull();
      expect(inboxActions[1].projectId).toBeNull();
    });

    it('should return empty array when no inbox actions exist', async () => {
      await repository.create({
        title: 'Project Action',
        actionType: ActionType.Manual,
        projectId: testProjectId,
      });

      const inboxActions = await repository.findInbox();

      expect(inboxActions).toEqual([]);
    });
  });

  describe('findAll()', () => {
    it('should return all actions from database', async () => {
      await repository.create({ title: 'Action 1', actionType: ActionType.Manual });
      await repository.create({ title: 'Action 2', actionType: ActionType.AgentTask });
      await repository.create({ title: 'Action 3', actionType: ActionType.Review });

      const allActions = await repository.findAll();

      expect(allActions).toHaveLength(3);
    });

    it('should order by createdAt DESC', async () => {
      const action1 = await repository.create({ title: 'First', actionType: ActionType.Manual });
      await new Promise((resolve) => setTimeout(resolve, 10));
      const action2 = await repository.create({ title: 'Second', actionType: ActionType.Manual });

      const allActions = await repository.findAll();

      expect(allActions).toHaveLength(2);
      expect(allActions[0].id).toBe(action2.id); // Most recent first
      expect(allActions[1].id).toBe(action1.id);
    });
  });

  describe('update()', () => {
    it('should update action fields and updatedAt timestamp', async () => {
      const action = await repository.create({
        title: 'Original Title',
        actionType: ActionType.Manual,
      });

      const originalUpdatedAt = action.updatedAt;
      await new Promise((resolve) => setTimeout(resolve, 10)); // Ensure timestamp difference

      const updated = await repository.update(action.id, {
        title: 'Updated Title',
        status: ActionStatus.IN_PROGRESS,
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.status).toBe(ActionStatus.IN_PROGRESS);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

      const dbAction = await prisma.action.findUnique({ where: { id: action.id } });
      expect(dbAction?.title).toBe('Updated Title');
      expect(dbAction?.status).toBe('IN_PROGRESS');
    });

    it('should throw when action not found', async () => {
      await expect(repository.update('nonexistent-id', { title: 'Updated' })).rejects.toThrow();
    });
  });

  describe('delete()', () => {
    it('should remove action from database', async () => {
      const action = await repository.create({
        title: 'To Delete',
        actionType: ActionType.Manual,
      });

      await repository.delete(action.id);

      const dbAction = await prisma.action.findUnique({ where: { id: action.id } });
      expect(dbAction).toBeNull();
    });

    it('should be idempotent', async () => {
      const action = await repository.create({
        title: 'To Delete',
        actionType: ActionType.Manual,
      });

      await repository.delete(action.id);
      await expect(repository.delete(action.id)).resolves.not.toThrow();
    });
  });

  // Many-to-Many Operations
  describe('assignUser()', () => {
    it('should create many-to-many association', async () => {
      const action = await repository.create({
        title: 'Assign Test',
        actionType: ActionType.Manual,
      });

      await repository.assignUser(action.id, testUserId);

      const dbAssignee = await prisma.actionAssignee.findUnique({
        where: {
          actionId_userId: {
            actionId: action.id,
            userId: testUserId,
          },
        },
      });

      expect(dbAssignee).toBeDefined();
    });

    it('should be idempotent (no error if already assigned)', async () => {
      const action = await repository.create({
        title: 'Assign Test',
        actionType: ActionType.Manual,
      });

      await repository.assignUser(action.id, testUserId);
      await expect(repository.assignUser(action.id, testUserId)).resolves.not.toThrow();

      const assignees = await prisma.actionAssignee.findMany({
        where: { actionId: action.id },
      });
      expect(assignees).toHaveLength(1);
    });

    it('should throw if action not found', async () => {
      await expect(repository.assignUser('nonexistent', testUserId)).rejects.toThrow();
    });

    it('should throw if user not found', async () => {
      const action = await repository.create({
        title: 'Assign Test',
        actionType: ActionType.Manual,
      });

      await expect(repository.assignUser(action.id, 'nonexistent-user')).rejects.toThrow();
    });
  });

  describe('unassignUser()', () => {
    it('should remove many-to-many association', async () => {
      const action = await repository.create({
        title: 'Unassign Test',
        actionType: ActionType.Manual,
      });

      await repository.assignUser(action.id, testUserId);
      await repository.unassignUser(action.id, testUserId);

      const dbAssignee = await prisma.actionAssignee.findUnique({
        where: {
          actionId_userId: {
            actionId: action.id,
            userId: testUserId,
          },
        },
      });

      expect(dbAssignee).toBeNull();
    });

    it('should be idempotent (no error if not assigned)', async () => {
      const action = await repository.create({
        title: 'Unassign Test',
        actionType: ActionType.Manual,
      });

      await expect(repository.unassignUser(action.id, testUserId)).resolves.not.toThrow();
    });
  });

  describe('linkThought()', () => {
    it('should create many-to-many association with thought', async () => {
      const action = await repository.create({
        title: 'Link Test',
        actionType: ActionType.Manual,
      });

      await repository.linkThought(action.id, testThoughtId);

      const dbLink = await prisma.actionThought.findUnique({
        where: {
          actionId_thoughtId: {
            actionId: action.id,
            thoughtId: testThoughtId,
          },
        },
      });

      expect(dbLink).toBeDefined();
    });

    it('should be idempotent', async () => {
      const action = await repository.create({
        title: 'Link Test',
        actionType: ActionType.Manual,
      });

      await repository.linkThought(action.id, testThoughtId);
      await expect(repository.linkThought(action.id, testThoughtId)).resolves.not.toThrow();

      const links = await prisma.actionThought.findMany({
        where: { actionId: action.id },
      });
      expect(links).toHaveLength(1);
    });

    it('should throw if action not found', async () => {
      await expect(repository.linkThought('nonexistent', testThoughtId)).rejects.toThrow();
    });

    it('should throw if thought not found', async () => {
      const action = await repository.create({
        title: 'Link Test',
        actionType: ActionType.Manual,
      });

      await expect(repository.linkThought(action.id, 'nonexistent-thought')).rejects.toThrow();
    });
  });

  describe('unlinkThought()', () => {
    it('should remove many-to-many association with thought', async () => {
      const action = await repository.create({
        title: 'Unlink Test',
        actionType: ActionType.Manual,
      });

      await repository.linkThought(action.id, testThoughtId);
      await repository.unlinkThought(action.id, testThoughtId);

      const dbLink = await prisma.actionThought.findUnique({
        where: {
          actionId_thoughtId: {
            actionId: action.id,
            thoughtId: testThoughtId,
          },
        },
      });

      expect(dbLink).toBeNull();
    });

    it('should be idempotent', async () => {
      const action = await repository.create({
        title: 'Unlink Test',
        actionType: ActionType.Manual,
      });

      await expect(repository.unlinkThought(action.id, testThoughtId)).resolves.not.toThrow();
    });
  });
});
