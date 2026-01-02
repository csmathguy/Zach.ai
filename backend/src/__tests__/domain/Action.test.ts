import { describe, it, expect } from '@jest/globals';
import { Action, ActionType, ActionStatus } from '@domain/models/Action';

describe('Action Domain Model', () => {
  describe('Action Creation', () => {
    it('should create action with all required fields', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const title = 'Test Action';
      const description = 'A test action description';
      const actionType = ActionType.Manual;
      const status = ActionStatus.TODO;
      const projectId = '660e8400-e29b-41d4-a716-446655440001';
      const createdAt = new Date('2026-01-02T12:00:00Z');
      const updatedAt = new Date('2026-01-02T13:00:00Z');

      // Act
      const action = new Action(
        id,
        title,
        description,
        actionType,
        status,
        projectId,
        createdAt,
        updatedAt
      );

      // Assert
      expect(action.id).toBe(id);
      expect(action.title).toBe(title);
      expect(action.description).toBe(description);
      expect(action.actionType).toBe(actionType);
      expect(action.status).toBe(status);
      expect(action.projectId).toBe(projectId);
      expect(action.createdAt).toBe(createdAt);
      expect(action.updatedAt).toBe(updatedAt);
    });

    it('should allow null projectId (inbox actions)', () => {
      // Arrange & Act
      const action = new Action(
        '550e8400-e29b-41d4-a716-446655440000',
        'Inbox Action',
        'Not yet assigned to a project',
        ActionType.Manual,
        ActionStatus.TODO,
        null,
        new Date(),
        new Date()
      );

      // Assert
      expect(action.projectId).toBeNull();
    });

    it('should throw error on empty title', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Action(
          '550e8400-e29b-41d4-a716-446655440000',
          '',
          'Description',
          ActionType.Manual,
          ActionStatus.TODO,
          null,
          new Date(),
          new Date()
        );
      }).toThrow('Action title cannot be empty');
    });

    it('should throw error on invalid UUID format for id', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Action(
          'not-a-uuid',
          'Test Action',
          'Description',
          ActionType.Manual,
          ActionStatus.TODO,
          null,
          new Date(),
          new Date()
        );
      }).toThrow('Invalid UUID format for id');
    });

    it('should throw error on invalid UUID format for projectId', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Action(
          '550e8400-e29b-41d4-a716-446655440000',
          'Test Action',
          'Description',
          ActionType.Manual,
          ActionStatus.TODO,
          'not-a-uuid',
          new Date(),
          new Date()
        );
      }).toThrow('Invalid UUID format for projectId');
    });
  });

  describe('ActionType Enum', () => {
    it('should have all action types', () => {
      expect(ActionType.Manual).toBe('Manual');
      expect(ActionType.AgentTask).toBe('AgentTask');
      expect(ActionType.Clarification).toBe('Clarification');
      expect(ActionType.Review).toBe('Review');
      expect(ActionType.Recurring).toBe('Recurring');
      expect(ActionType.Reference).toBe('Reference');
    });

    it('should accept all valid action types', () => {
      // Arrange
      const validTypes = [
        ActionType.Manual,
        ActionType.AgentTask,
        ActionType.Clarification,
        ActionType.Review,
        ActionType.Recurring,
        ActionType.Reference,
      ];

      // Act & Assert
      validTypes.forEach((type) => {
        const action = new Action(
          '550e8400-e29b-41d4-a716-446655440000',
          'Test Action',
          'Description',
          type,
          ActionStatus.TODO,
          null,
          new Date(),
          new Date()
        );
        expect(action.actionType).toBe(type);
      });
    });
  });

  describe('ActionStatus Enum', () => {
    it('should have all status values', () => {
      expect(ActionStatus.TODO).toBe('TODO');
      expect(ActionStatus.IN_PROGRESS).toBe('IN_PROGRESS');
      expect(ActionStatus.COMPLETED).toBe('COMPLETED');
      expect(ActionStatus.CANCELLED).toBe('CANCELLED');
    });

    it('should accept all valid status values', () => {
      // Arrange
      const validStatuses = [
        ActionStatus.TODO,
        ActionStatus.IN_PROGRESS,
        ActionStatus.COMPLETED,
        ActionStatus.CANCELLED,
      ];

      // Act & Assert
      validStatuses.forEach((status) => {
        const action = new Action(
          '550e8400-e29b-41d4-a716-446655440000',
          'Test Action',
          'Description',
          ActionType.Manual,
          status,
          null,
          new Date(),
          new Date()
        );
        expect(action.status).toBe(status);
      });
    });
  });

  describe('Action Immutability', () => {
    it('should enforce readonly properties', () => {
      // Arrange
      const action = new Action(
        '550e8400-e29b-41d4-a716-446655440000',
        'Original Title',
        'Original Description',
        ActionType.Manual,
        ActionStatus.TODO,
        null,
        new Date(),
        new Date()
      );

      // Act & Assert - Object.freeze ensures immutability at runtime
      expect(() => {
        'use strict';
        (action as unknown as { title: string }).title = 'Modified Title';
      }).toThrow();
    });
  });

  describe('Action Equality', () => {
    it('should consider two actions with same id as equal', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const action1 = new Action(
        id,
        'Action 1',
        'Description 1',
        ActionType.Manual,
        ActionStatus.TODO,
        null,
        new Date(),
        new Date()
      );
      const action2 = new Action(
        id,
        'Action 2',
        'Description 2',
        ActionType.AgentTask,
        ActionStatus.COMPLETED,
        null,
        new Date(),
        new Date()
      );

      // Act & Assert
      expect(action1.equals(action2)).toBe(true);
    });

    it('should consider two actions with different ids as not equal', () => {
      // Arrange
      const action1 = new Action(
        '550e8400-e29b-41d4-a716-446655440000',
        'Action 1',
        'Description',
        ActionType.Manual,
        ActionStatus.TODO,
        null,
        new Date(),
        new Date()
      );
      const action2 = new Action(
        '660e8400-e29b-41d4-a716-446655440001',
        'Action 1',
        'Description',
        ActionType.Manual,
        ActionStatus.TODO,
        null,
        new Date(),
        new Date()
      );

      // Act & Assert
      expect(action1.equals(action2)).toBe(false);
    });
  });
});
