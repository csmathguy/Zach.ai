/**
 * Mapper Tests
 *
 * Tests for mapper functions that convert between Prisma types and Domain models.
 * Mappers handle the impedance mismatch between database and domain layers.
 *
 * TDD Phase: RED → GREEN → REFACTOR
 */

import { describe, it, expect } from '@jest/globals';
import type { User as PrismaUser } from '@prisma/client';

// Domain models
import { User, Thought, Project, Action } from '@domain/models';

// DTOs
import type {
  CreateUserDto,
  CreateThoughtDto,
  CreateProjectDto,
  CreateActionDto,
} from '@domain/types';

// Mappers (will fail until implemented - RED phase)
import {
  userMapper,
  thoughtMapper,
  projectMapper,
  actionMapper,
} from '@infrastructure/prisma/mappers';

describe('User Mapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma User to Domain User', () => {
      const prismaUser: PrismaUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      };

      const domainUser = userMapper.toDomain(prismaUser);

      expect(domainUser).toBeInstanceOf(User);
      expect(domainUser.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(domainUser.email).toBe('test@example.com');
      expect(domainUser.name).toBe('Test User');
      expect(domainUser.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    });

    it('should handle JavaScript Date objects from Prisma', () => {
      const now = new Date();
      const prismaUser: PrismaUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: now,
      };

      const domainUser = userMapper.toDomain(prismaUser);

      expect(domainUser.createdAt).toBe(now);
    });
  });

  describe('toPrisma', () => {
    it('should convert CreateUserDto to Prisma input format', () => {
      const dto: CreateUserDto = {
        email: 'new@example.com',
        name: 'New User',
      };

      const prismaInput = userMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.email).toBe('new@example.com');
      expect(prismaInput.name).toBe('New User');
      expect(prismaInput.id).toBeUndefined(); // ID should not be in DTO
      expect(prismaInput.createdAt).toBeUndefined(); // CreatedAt is auto-generated
    });

    it('should pass through all fields from DTO', () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test',
      };

      const prismaInput = userMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput).toEqual({
        email: 'test@example.com',
        name: 'Test',
      });
    });
  });
});

describe('Thought Mapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma Thought to Domain Thought', () => {
      const prismaThought = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        text: 'Test thought',
        source: 'manual',
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        processedState: 'UNPROCESSED',
        userId: '223e4567-e89b-12d3-a456-426614174111',
      };

      const domainThought = thoughtMapper.toDomain(prismaThought);

      expect(domainThought).toBeInstanceOf(Thought);
      expect(domainThought.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(domainThought.text).toBe('Test thought');
      expect(domainThought.source).toBe('manual');
      expect(domainThought.timestamp).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(domainThought.processedState).toBe('UNPROCESSED');
      expect(domainThought.userId).toBe('223e4567-e89b-12d3-a456-426614174111');
    });

    it('should handle default values from Prisma', () => {
      const prismaThought = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        text: 'Test',
        source: 'agent',
        timestamp: new Date(),
        processedState: 'PROCESSED',
        userId: '223e4567-e89b-12d3-a456-426614174111',
      };

      const domainThought = thoughtMapper.toDomain(prismaThought);

      expect(domainThought.source).toBe('agent');
      expect(domainThought.processedState).toBe('PROCESSED');
    });
  });

  describe('toPrisma', () => {
    it('should convert CreateThoughtDto to Prisma input format', () => {
      const dto: CreateThoughtDto = {
        text: 'New thought',
        userId: 'user-123',
      };

      const prismaInput = thoughtMapper.toPrisma(dto);

      expect(prismaInput.text).toBe('New thought');
      expect(prismaInput.user).toEqual({ connect: { id: 'user-123' } });
    });

    it('should include optional source field when provided', () => {
      const dto: CreateThoughtDto = {
        text: 'Agent thought',
        userId: 'user-123',
        source: 'agent',
      };

      const prismaInput = thoughtMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.source).toBe('agent');
    });

    it('should include optional timestamp when provided', () => {
      const timestamp = new Date('2024-01-01');
      const dto: CreateThoughtDto = {
        text: 'Backdated thought',
        userId: 'user-123',
        timestamp,
      };

      const prismaInput = thoughtMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.timestamp).toBe(timestamp);
    });

    it('should omit optional fields when not provided', () => {
      const dto: CreateThoughtDto = {
        text: 'Simple thought',
        userId: 'user-123',
      };

      const prismaInput = thoughtMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.source).toBeUndefined();
      expect(prismaInput.timestamp).toBeUndefined();
    });
  });
});

describe('Project Mapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma Project to Domain Project', () => {
      const prismaProject = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Project',
        description: 'Project description',
        status: 'ACTIVE',
        nextActionId: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      };

      const domainProject = projectMapper.toDomain(prismaProject);

      expect(domainProject).toBeInstanceOf(Project);
      expect(domainProject.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(domainProject.title).toBe('Test Project');
      expect(domainProject.description).toBe('Project description');
      expect(domainProject.status).toBe('ACTIVE');
      expect(domainProject.nextActionId).toBeNull();
      expect(domainProject.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(domainProject.updatedAt).toEqual(new Date('2024-01-02T00:00:00.000Z'));
    });

    it('should handle null description', () => {
      const prismaProject = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Minimal Project',
        description: null,
        status: 'ACTIVE',
        nextActionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const domainProject = projectMapper.toDomain(prismaProject);

      expect(domainProject.description).toBe(''); // Domain converts null to empty string
    });

    it('should handle nextActionId when present', () => {
      const prismaProject = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Project with next action',
        description: null,
        status: 'ACTIVE',
        nextActionId: '323e4567-e89b-12d3-a456-426614174222',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const domainProject = projectMapper.toDomain(prismaProject);

      expect(domainProject.nextActionId).toBe('323e4567-e89b-12d3-a456-426614174222');
    });
  });

  describe('toPrisma', () => {
    it('should convert CreateProjectDto to Prisma input format', () => {
      const dto: CreateProjectDto = {
        title: 'New Project',
      };

      const prismaInput = projectMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.title).toBe('New Project');
    });

    it('should include optional description when provided', () => {
      const dto: CreateProjectDto = {
        title: 'New Project',
        description: 'With description',
      };

      const prismaInput = projectMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.description).toBe('With description');
    });

    it('should include optional status when provided', () => {
      const dto: CreateProjectDto = {
        title: 'Paused Project',
        status: 'PAUSED',
      };

      const prismaInput = projectMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.status).toBe('PAUSED');
    });

    it('should omit optional fields when not provided', () => {
      const dto: CreateProjectDto = {
        title: 'Simple Project',
      };

      const prismaInput = projectMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.description).toBeUndefined();
      expect(prismaInput.status).toBeUndefined();
    });
  });
});

describe('Action Mapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma Action to Domain Action', () => {
      const prismaAction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Action',
        description: 'Action details',
        actionType: 'Manual',
        status: 'TODO',
        projectId: '423e4567-e89b-12d3-a456-426614174333',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      };

      const domainAction = actionMapper.toDomain(prismaAction);

      expect(domainAction).toBeInstanceOf(Action);
      expect(domainAction.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(domainAction.title).toBe('Test Action');
      expect(domainAction.description).toBe('Action details');
      expect(domainAction.actionType).toBe('Manual');
      expect(domainAction.status).toBe('TODO');
      expect(domainAction.projectId).toBe('423e4567-e89b-12d3-a456-426614174333');
      expect(domainAction.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
      expect(domainAction.updatedAt).toEqual(new Date('2024-01-02T00:00:00.000Z'));
    });

    it('should handle null description', () => {
      const prismaAction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Minimal Action',
        description: null,
        actionType: 'Review',
        status: 'TODO',
        projectId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const domainAction = actionMapper.toDomain(prismaAction);

      expect(domainAction.description).toBe(''); // Domain converts null to empty string
    });

    it('should handle null projectId for inbox actions', () => {
      const prismaAction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Inbox Action',
        description: null,
        actionType: 'Clarification',
        status: 'TODO',
        projectId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const domainAction = actionMapper.toDomain(prismaAction);

      expect(domainAction.projectId).toBeNull();
    });
  });

  describe('toPrisma', () => {
    it('should convert CreateActionDto to Prisma input format', () => {
      const dto: CreateActionDto = {
        title: 'New Action',
        actionType: 'Manual',
      };

      const prismaInput = actionMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.title).toBe('New Action');
      expect(prismaInput.actionType).toBe('Manual');
    });

    it('should include optional description when provided', () => {
      const dto: CreateActionDto = {
        title: 'Action with description',
        actionType: 'AgentTask',
        description: 'Details',
      };

      const prismaInput = actionMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.description).toBe('Details');
    });

    it('should include optional status when provided', () => {
      const dto: CreateActionDto = {
        title: 'In progress action',
        actionType: 'Manual',
        status: 'IN_PROGRESS',
      };

      const prismaInput = actionMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.status).toBe('IN_PROGRESS');
    });

    it('should include optional projectId when provided', () => {
      const dto: CreateActionDto = {
        title: 'Project action',
        actionType: 'Manual',
        projectId: 'project-123',
      };

      const prismaInput = actionMapper.toPrisma(dto);

      expect(prismaInput.project).toEqual({ connect: { id: 'project-123' } });
    });

    it('should handle null projectId explicitly', () => {
      const dto: CreateActionDto = {
        title: 'Inbox action',
        actionType: 'Clarification',
        projectId: null,
      };

      const prismaInput = actionMapper.toPrisma(dto);

      expect(prismaInput.project).toBeUndefined();
    });

    it('should omit optional fields when not provided', () => {
      const dto: CreateActionDto = {
        title: 'Simple action',
        actionType: 'Reference',
      };

      const prismaInput = actionMapper.toPrisma(dto) as Record<string, unknown>;

      expect(prismaInput.description).toBeUndefined();
      expect(prismaInput.status).toBeUndefined();
      expect(prismaInput.projectId).toBeUndefined();
    });
  });
});
