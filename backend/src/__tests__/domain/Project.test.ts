import { describe, it, expect } from '@jest/globals';
import { Project, ProjectStatus } from '@domain/models/Project';

describe('Project Domain Model', () => {
  describe('Project Creation', () => {
    it('should create project with all required fields', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const title = 'Test Project';
      const description = 'A test project description';
      const status = ProjectStatus.ACTIVE;
      const nextActionId = '660e8400-e29b-41d4-a716-446655440001';
      const createdAt = new Date('2026-01-02T12:00:00Z');
      const updatedAt = new Date('2026-01-02T13:00:00Z');

      // Act
      const project = new Project(
        id,
        title,
        description,
        status,
        nextActionId,
        createdAt,
        updatedAt
      );

      // Assert
      expect(project.id).toBe(id);
      expect(project.title).toBe(title);
      expect(project.description).toBe(description);
      expect(project.status).toBe(status);
      expect(project.nextActionId).toBe(nextActionId);
      expect(project.createdAt).toBe(createdAt);
      expect(project.updatedAt).toBe(updatedAt);
    });

    it('should allow null nextActionId', () => {
      // Arrange & Act
      const project = new Project(
        '550e8400-e29b-41d4-a716-446655440000',
        'Test Project',
        'Description',
        ProjectStatus.ACTIVE,
        null,
        new Date(),
        new Date()
      );

      // Assert
      expect(project.nextActionId).toBeNull();
    });

    it('should throw error on empty title', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Project(
          '550e8400-e29b-41d4-a716-446655440000',
          '',
          'Description',
          ProjectStatus.ACTIVE,
          null,
          new Date(),
          new Date()
        );
      }).toThrow('Project title cannot be empty');
    });

    it('should throw error on invalid UUID format for id', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Project(
          'not-a-uuid',
          'Test Project',
          'Description',
          ProjectStatus.ACTIVE,
          null,
          new Date(),
          new Date()
        );
      }).toThrow('Invalid UUID format for id');
    });

    it('should throw error on invalid UUID format for nextActionId', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Project(
          '550e8400-e29b-41d4-a716-446655440000',
          'Test Project',
          'Description',
          ProjectStatus.ACTIVE,
          'not-a-uuid',
          new Date(),
          new Date()
        );
      }).toThrow('Invalid UUID format for nextActionId');
    });
  });

  describe('ProjectStatus Enum', () => {
    it('should have ACTIVE status', () => {
      expect(ProjectStatus.ACTIVE).toBe('ACTIVE');
    });

    it('should have PAUSED status', () => {
      expect(ProjectStatus.PAUSED).toBe('PAUSED');
    });

    it('should have COMPLETED status', () => {
      expect(ProjectStatus.COMPLETED).toBe('COMPLETED');
    });

    it('should accept all valid status values', () => {
      // Arrange
      const validStatuses = [ProjectStatus.ACTIVE, ProjectStatus.PAUSED, ProjectStatus.COMPLETED];

      // Act & Assert
      validStatuses.forEach((status) => {
        const project = new Project(
          '550e8400-e29b-41d4-a716-446655440000',
          'Test Project',
          'Description',
          status,
          null,
          new Date(),
          new Date()
        );
        expect(project.status).toBe(status);
      });
    });
  });

  describe('Project Immutability', () => {
    it('should enforce readonly properties', () => {
      // Arrange
      const project = new Project(
        '550e8400-e29b-41d4-a716-446655440000',
        'Original Title',
        'Original Description',
        ProjectStatus.ACTIVE,
        null,
        new Date(),
        new Date()
      );

      // Act & Assert - Object.freeze ensures immutability at runtime
      expect(() => {
        'use strict';
        (project as any).title = 'Modified Title';
      }).toThrow();
    });
  });

  describe('Project Equality', () => {
    it('should consider two projects with same id as equal', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const project1 = new Project(
        id,
        'Project 1',
        'Description 1',
        ProjectStatus.ACTIVE,
        null,
        new Date(),
        new Date()
      );
      const project2 = new Project(
        id,
        'Project 2',
        'Description 2',
        ProjectStatus.PAUSED,
        null,
        new Date(),
        new Date()
      );

      // Act & Assert
      expect(project1.equals(project2)).toBe(true);
    });

    it('should consider two projects with different ids as not equal', () => {
      // Arrange
      const project1 = new Project(
        '550e8400-e29b-41d4-a716-446655440000',
        'Project 1',
        'Description',
        ProjectStatus.ACTIVE,
        null,
        new Date(),
        new Date()
      );
      const project2 = new Project(
        '660e8400-e29b-41d4-a716-446655440001',
        'Project 1',
        'Description',
        ProjectStatus.ACTIVE,
        null,
        new Date(),
        new Date()
      );

      // Act & Assert
      expect(project1.equals(project2)).toBe(false);
    });
  });
});
