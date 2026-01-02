import { describe, it, expect } from '@jest/globals';
import { Thought } from '@domain/models/Thought';

describe('Thought Domain Model', () => {
  describe('Thought Creation', () => {
    it('should create thought with all required fields', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const text = 'This is a test thought';
      const userId = '660e8400-e29b-41d4-a716-446655440001';
      const timestamp = new Date('2026-01-02T12:00:00Z');
      const source = 'manual';
      const processedState = 'UNPROCESSED';

      // Act
      const thought = new Thought(id, text, userId, timestamp, source, processedState);

      // Assert
      expect(thought.id).toBe(id);
      expect(thought.text).toBe(text);
      expect(thought.userId).toBe(userId);
      expect(thought.timestamp).toBe(timestamp);
      expect(thought.source).toBe(source);
      expect(thought.processedState).toBe(processedState);
    });

    it('should enforce readonly properties (immutability)', () => {
      // Arrange
      const thought = new Thought(
        '550e8400-e29b-41d4-a716-446655440000',
        'Original thought',
        '660e8400-e29b-41d4-a716-446655440001',
        new Date(),
        'manual',
        'UNPROCESSED'
      );

      // Act & Assert - Object.freeze ensures immutability at runtime
      expect(() => {
        'use strict';
        (thought as any).text = 'Modified thought';
      }).toThrow();
    });

    it('should throw error on empty text', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Thought(
          '550e8400-e29b-41d4-a716-446655440000',
          '',
          '660e8400-e29b-41d4-a716-446655440001',
          new Date(),
          'manual',
          'UNPROCESSED'
        );
      }).toThrow('Thought text cannot be empty');
    });

    it('should throw error on invalid UUID format for id', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Thought(
          'not-a-uuid',
          'Test thought',
          '660e8400-e29b-41d4-a716-446655440001',
          new Date(),
          'manual',
          'UNPROCESSED'
        );
      }).toThrow('Invalid UUID format for id');
    });

    it('should throw error on invalid UUID format for userId', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Thought(
          '550e8400-e29b-41d4-a716-446655440000',
          'Test thought',
          'not-a-uuid',
          new Date(),
          'manual',
          'UNPROCESSED'
        );
      }).toThrow('Invalid UUID format for userId');
    });

    it('should accept valid source values', () => {
      // Arrange
      const validSources = ['manual', 'chat', 'email', 'api'];

      // Act & Assert
      validSources.forEach((source) => {
        const thought = new Thought(
          '550e8400-e29b-41d4-a716-446655440000',
          'Test thought',
          '660e8400-e29b-41d4-a716-446655440001',
          new Date(),
          source,
          'UNPROCESSED'
        );
        expect(thought.source).toBe(source);
      });
    });

    it('should accept valid processed states', () => {
      // Arrange
      const validStates = ['UNPROCESSED', 'PROCESSED', 'ARCHIVED'];

      // Act & Assert
      validStates.forEach((state) => {
        const thought = new Thought(
          '550e8400-e29b-41d4-a716-446655440000',
          'Test thought',
          '660e8400-e29b-41d4-a716-446655440001',
          new Date(),
          'manual',
          state
        );
        expect(thought.processedState).toBe(state);
      });
    });
  });

  describe('Thought Business Rules', () => {
    it('should be immutable after creation (no update methods)', () => {
      // Arrange
      const thought = new Thought(
        '550e8400-e29b-41d4-a716-446655440000',
        'Original thought',
        '660e8400-e29b-41d4-a716-446655440001',
        new Date(),
        'manual',
        'UNPROCESSED'
      );

      // Act & Assert - Verify no update methods exist
      expect((thought as any).update).toBeUndefined();
      expect((thought as any).setText).toBeUndefined();
      expect((thought as any).setProcessedState).toBeUndefined();
    });
  });

  describe('Thought Equality', () => {
    it('should consider two thoughts with same id as equal', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const thought1 = new Thought(
        id,
        'Thought 1',
        '660e8400-e29b-41d4-a716-446655440001',
        new Date(),
        'manual',
        'UNPROCESSED'
      );
      const thought2 = new Thought(
        id,
        'Thought 2',
        '660e8400-e29b-41d4-a716-446655440001',
        new Date(),
        'chat',
        'PROCESSED'
      );

      // Act & Assert
      expect(thought1.equals(thought2)).toBe(true);
    });

    it('should consider two thoughts with different ids as not equal', () => {
      // Arrange
      const thought1 = new Thought(
        '550e8400-e29b-41d4-a716-446655440000',
        'Thought 1',
        '660e8400-e29b-41d4-a716-446655440001',
        new Date(),
        'manual',
        'UNPROCESSED'
      );
      const thought2 = new Thought(
        '770e8400-e29b-41d4-a716-446655440002',
        'Thought 1',
        '660e8400-e29b-41d4-a716-446655440001',
        new Date(),
        'manual',
        'UNPROCESSED'
      );

      // Act & Assert
      expect(thought1.equals(thought2)).toBe(false);
    });
  });
});
