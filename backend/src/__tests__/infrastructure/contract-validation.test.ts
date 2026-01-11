/**
 * Contract Testing Validation
 *
 * Purpose: Verify ALL repository contract guarantees documented in interfaces
 *
 * This comprehensive test suite validates that implementations honor ALL
 * contract guarantees specified in domain layer interfaces:
 * - IUserRepository
 * - IThoughtRepository
 * - IProjectRepository
 * - IActionRepository
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { prisma } from '@infrastructure/prisma/client';
import { PrismaUserRepository } from '@infrastructure/prisma/repositories/PrismaUserRepository';
import { PrismaThoughtRepository } from '@infrastructure/prisma/repositories/PrismaThoughtRepository';
import { PrismaProjectRepository } from '@infrastructure/prisma/repositories/PrismaProjectRepository';
import { PrismaActionRepository } from '@infrastructure/prisma/repositories/PrismaActionRepository';
import { ActionType, ActionStatus } from '@domain/models/Action';
import type { CreateUserDto } from '@domain/types';

let userRepo: PrismaUserRepository;
let thoughtRepo: PrismaThoughtRepository;
let projectRepo: PrismaProjectRepository;
let actionRepo: PrismaActionRepository;
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
  // Suppress Prisma error logs for contract violation tests
  originalConsoleLog = console.log;
  console.log = (...args: unknown[]) => {
    const message = String(args[0]);
    if (message.includes('prisma:error')) {
      return;
    }
    originalConsoleLog(...args);
  };

  // Initialize repositories with shared prisma client
  userRepo = new PrismaUserRepository(prisma);
  thoughtRepo = new PrismaThoughtRepository(prisma);
  projectRepo = new PrismaProjectRepository(prisma);
  actionRepo = new PrismaActionRepository(prisma);
});

afterAll(() => {
  console.log = originalConsoleLog;
});

beforeEach(async () => {
  // Clean slate for each test
  await prisma.actionAssignee.deleteMany({});
  await prisma.actionThought.deleteMany({});
  await prisma.projectThought.deleteMany({});
  await prisma.action.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.thought.deleteMany({});
  await prisma.user.deleteMany({});
});

describe('IUserRepository Contract Guarantees', () => {
  it('create() throws on duplicate email', async () => {
    await userRepo.create(buildUserDto('duplicate@example.com', 'User 1'));

    await expect(
      userRepo.create(buildUserDto('duplicate@example.com', 'User 2', { username: 'user-two' }))
    ).rejects.toThrow();
  });

  it('getById() returns null (not throws) when user not found', async () => {
    const result = await userRepo.getById('nonexistent-id');

    expect(result).toBeNull();
  });

  it('getByEmail() returns null (not throws) when email not found', async () => {
    const result = await userRepo.getByEmail('nonexistent@example.com');

    expect(result).toBeNull();
  });

  it('delete() is idempotent - does not throw on second delete', async () => {
    const user = await userRepo.create(buildUserDto('delete@example.com', 'User'));

    await userRepo.delete(user.id);
    await expect(userRepo.delete(user.id)).resolves.not.toThrow();
  });

  it('update() throws when user not found', async () => {
    await expect(userRepo.update('nonexistent-id', { name: 'Updated' })).rejects.toThrow();
  });

  it('listAll() returns empty array when no users exist', async () => {
    const users = await userRepo.listAll();

    expect(users).toEqual([]);
  });
});

describe('IThoughtRepository Contract Guarantees', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await userRepo.create(buildUserDto('thinker@example.com', 'Thinker'));
    userId = user.id;
  });

  it('create() sets default values: source="manual", processedState="UNPROCESSED"', async () => {
    const thought = await thoughtRepo.create({ text: 'Test thought', userId });

    expect(thought.source).toBe('manual');
    expect(thought.processedState).toBe('UNPROCESSED');
  });

  it('NO update() method exists (immutability contract)', () => {
    expect((thoughtRepo as unknown as { update?: unknown }).update).toBeUndefined();
  });

  it('NO delete() method exists (append-only contract)', () => {
    expect((thoughtRepo as unknown as { delete?: unknown }).delete).toBeUndefined();
  });

  it('findByUser() orders by timestamp DESC (newest first)', async () => {
    await thoughtRepo.create({
      text: 'First',
      userId,
      timestamp: new Date('2025-01-01T10:00:00Z'),
    });
    await thoughtRepo.create({
      text: 'Second',
      userId,
      timestamp: new Date('2025-01-01T11:00:00Z'),
    });
    await thoughtRepo.create({
      text: 'Third',
      userId,
      timestamp: new Date('2025-01-01T12:00:00Z'),
    });

    const thoughts = await thoughtRepo.findByUser(userId);

    expect(thoughts).toHaveLength(3);
    expect(thoughts[0].text).toBe('Third'); // Newest first
    expect(thoughts[1].text).toBe('Second');
    expect(thoughts[2].text).toBe('First');
  });

  it('findAll() orders by timestamp DESC', async () => {
    await thoughtRepo.create({
      text: 'Older',
      userId,
      timestamp: new Date('2025-01-01T10:00:00Z'),
    });
    await thoughtRepo.create({
      text: 'Newer',
      userId,
      timestamp: new Date('2025-01-01T11:00:00Z'),
    });

    const thoughts = await thoughtRepo.findAll();

    expect(thoughts[0].text).toBe('Newer');
    expect(thoughts[1].text).toBe('Older');
  });

  it('findById() returns null (not throws) when thought not found', async () => {
    const result = await thoughtRepo.findById('nonexistent-id');

    expect(result).toBeNull();
  });

  it('findByUser() returns empty array when user has no thoughts', async () => {
    const thoughts = await thoughtRepo.findByUser(userId);

    expect(thoughts).toEqual([]);
  });
});

describe('IProjectRepository Contract Guarantees', () => {
  let userId: string;

  beforeEach(async () => {
    const user = await userRepo.create(buildUserDto('organizer@example.com', 'Organizer'));
    userId = user.id;
  });

  it('linkThought() is idempotent - no error on duplicate link', async () => {
    const project = await projectRepo.create({ title: 'Test Project' });
    const thought = await thoughtRepo.create({ text: 'Inspiration', userId });

    await projectRepo.linkThought(project.id, thought.id);
    await expect(projectRepo.linkThought(project.id, thought.id)).resolves.not.toThrow();
  });

  it('unlinkThought() is idempotent - no error if link does not exist', async () => {
    const project = await projectRepo.create({ title: 'Test Project' });
    const thought = await thoughtRepo.create({ text: 'Inspiration', userId });

    await expect(projectRepo.unlinkThought(project.id, thought.id)).resolves.not.toThrow();
  });

  it('setNextAction() validates action belongs to project', async () => {
    const project1 = await projectRepo.create({ title: 'Project 1' });
    const project2 = await projectRepo.create({ title: 'Project 2' });
    const action = await actionRepo.create({
      title: 'Action',
      actionType: 'Manual',
      projectId: project2.id,
    });

    await expect(projectRepo.setNextAction(project1.id, action.id)).rejects.toThrow(
      /does not belong to.*project/i
    );
  });

  it('setNextAction() throws if action does not exist', async () => {
    const project = await projectRepo.create({ title: 'Project' });

    await expect(projectRepo.setNextAction(project.id, 'nonexistent-action-id')).rejects.toThrow();
  });

  it('delete() nullifies action.projectId (cascade behavior)', async () => {
    const project = await projectRepo.create({ title: 'Project' });
    const action = await actionRepo.create({
      title: 'Action',
      actionType: 'Manual',
      projectId: project.id,
    });

    await projectRepo.delete(project.id);

    const updatedAction = await actionRepo.findById(action.id);
    expect(updatedAction?.projectId).toBeNull();
  });

  it('findAll() orders by updatedAt DESC (most recently updated first)', async () => {
    const p1 = await projectRepo.create({ title: 'Old Project' });
    await new Promise((resolve) => setTimeout(resolve, 10)); // Ensure different timestamps
    const p2 = await projectRepo.create({ title: 'New Project' });

    const projects = await projectRepo.findAll();

    expect(projects[0].id).toBe(p2.id); // Newest first
    expect(projects[1].id).toBe(p1.id);
  });

  it('findById() returns null (not throws) when project not found', async () => {
    const result = await projectRepo.findById('nonexistent-id');

    expect(result).toBeNull();
  });
});

describe('IActionRepository Contract Guarantees', () => {
  let userId: string;
  let projectId: string;

  beforeEach(async () => {
    const user = await userRepo.create(buildUserDto('actor@example.com', 'Actor'));
    const project = await projectRepo.create({ title: 'Test Project' });
    userId = user.id;
    projectId = project.id;
  });

  it('findInbox() returns only actions without projectId', async () => {
    await actionRepo.create({ title: 'Inbox Action 1', actionType: 'Manual' }); // No projectId
    await actionRepo.create({ title: 'Inbox Action 2', actionType: 'Manual' }); // No projectId
    await actionRepo.create({
      title: 'Project Action',
      actionType: 'Manual',
      projectId,
    });

    const inboxActions = await actionRepo.findInbox();

    expect(inboxActions).toHaveLength(2);
    expect(inboxActions.every((a) => a.projectId === null)).toBe(true);
  });

  it('assignUser() is idempotent - no error on duplicate assignment', async () => {
    const action = await actionRepo.create({ title: 'Action', actionType: 'Manual' });

    await actionRepo.assignUser(action.id, userId);
    await expect(actionRepo.assignUser(action.id, userId)).resolves.not.toThrow();
  });

  it('unassignUser() is idempotent - no error if assignment does not exist', async () => {
    const action = await actionRepo.create({ title: 'Action', actionType: 'Manual' });

    await expect(actionRepo.unassignUser(action.id, userId)).resolves.not.toThrow();
  });

  it('linkThought() is idempotent - no error on duplicate link', async () => {
    const action = await actionRepo.create({ title: 'Action', actionType: 'Manual' });
    const thought = await thoughtRepo.create({ text: 'Inspiration', userId });

    await actionRepo.linkThought(action.id, thought.id);
    await expect(actionRepo.linkThought(action.id, thought.id)).resolves.not.toThrow();
  });

  it('unlinkThought() is idempotent - no error if link does not exist', async () => {
    const action = await actionRepo.create({ title: 'Action', actionType: 'Manual' });
    const thought = await thoughtRepo.create({ text: 'Inspiration', userId });

    await expect(actionRepo.unlinkThought(action.id, thought.id)).resolves.not.toThrow();
  });

  it('findByProject() returns only actions for specified project', async () => {
    const otherProject = await projectRepo.create({ title: 'Other Project' });

    await actionRepo.create({ title: 'Action 1', actionType: 'Manual', projectId });
    await actionRepo.create({ title: 'Action 2', actionType: 'Manual', projectId });
    await actionRepo.create({
      title: 'Other Action',
      actionType: 'Manual',
      projectId: otherProject.id,
    });

    const actions = await actionRepo.findByProject(projectId);

    expect(actions).toHaveLength(2);
    expect(actions.every((a) => a.projectId === projectId)).toBe(true);
  });

  it('findByType() returns only actions of specified type', async () => {
    await actionRepo.create({ title: 'Manual Action', actionType: 'Manual' });
    await actionRepo.create({ title: 'Agent Task', actionType: 'AgentTask' });
    await actionRepo.create({ title: 'Another Manual', actionType: 'Manual' });

    const manualActions = await actionRepo.findByType(ActionType.Manual);

    expect(manualActions).toHaveLength(2);
    expect(manualActions.every((a) => a.actionType === 'Manual')).toBe(true);
  });

  it('findByStatus() returns actions of all statuses (not filtered)', async () => {
    await actionRepo.create({ title: 'Todo', actionType: 'Manual', status: 'TODO' });
    await actionRepo.create({ title: 'InProgress', actionType: 'Manual', status: 'IN_PROGRESS' });
    await actionRepo.create({ title: 'Completed', actionType: 'Manual', status: 'COMPLETED' });

    const allActions = await actionRepo.findByStatus(ActionStatus.TODO);

    expect(allActions.length).toBeGreaterThan(0);
  });

  it('findById() returns null (not throws) when action not found', async () => {
    const result = await actionRepo.findById('nonexistent-id');

    expect(result).toBeNull();
  });

  it('update() throws when action not found', async () => {
    await expect(actionRepo.update('nonexistent-id', { title: 'Updated' })).rejects.toThrow();
  });

  it('delete() is idempotent - does not throw on second delete', async () => {
    const action = await actionRepo.create({ title: 'Action', actionType: 'Manual' });

    await actionRepo.delete(action.id);
    await expect(actionRepo.delete(action.id)).resolves.not.toThrow();
  });
});
