import { describe, it, expect } from '@jest/globals';
import { User } from '@domain/models/User';

describe('User Domain Model', () => {
  describe('User Creation', () => {
    it('should create user with all required fields', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const email = 'test@example.com';
      const name = 'Test User';
      const createdAt = new Date('2026-01-02T12:00:00Z');

      // Act
      const user = new User(id, email, name, createdAt);

      // Assert
      expect(user.id).toBe(id);
      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
      expect(user.createdAt).toBe(createdAt);
    });

    it('should enforce readonly properties via Object.freeze', () => {
      // Arrange
      const user = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'test@example.com',
        'Test User',
        new Date()
      );

      // Act & Assert - Object.freeze makes properties immutable at runtime
      expect(() => {
        'use strict';
        (user as any).email = 'new@example.com';
      }).toThrow();
    });

    it('should throw error on empty email', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const emptyEmail = '';
      const name = 'Test User';
      const createdAt = new Date();

      // Act & Assert
      expect(() => {
        new User(id, emptyEmail, name, createdAt);
      }).toThrow('Email cannot be empty');
    });

    it('should throw error on empty name', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const email = 'test@example.com';
      const emptyName = '';
      const createdAt = new Date();

      // Act & Assert
      expect(() => {
        new User(id, email, emptyName, createdAt);
      }).toThrow('Name cannot be empty');
    });

    it('should throw error on invalid UUID format', () => {
      // Arrange
      const invalidId = 'not-a-uuid';
      const email = 'test@example.com';
      const name = 'Test User';
      const createdAt = new Date();

      // Act & Assert
      expect(() => {
        new User(invalidId, email, name, createdAt);
      }).toThrow('Invalid UUID format');
    });

    it('should accept valid UUID v4 format', () => {
      // Arrange
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const email = 'test@example.com';
      const name = 'Test User';
      const createdAt = new Date();

      // Act
      const user = new User(validUuid, email, name, createdAt);

      // Assert
      expect(user.id).toBe(validUuid);
    });
  });

  describe('User Equality', () => {
    it('should consider two users with same id as equal', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const user1 = new User(id, 'test1@example.com', 'User 1', new Date());
      const user2 = new User(id, 'test2@example.com', 'User 2', new Date());

      // Act & Assert
      expect(user1.equals(user2)).toBe(true);
    });

    it('should consider two users with different ids as not equal', () => {
      // Arrange
      const user1 = new User(
        '550e8400-e29b-41d4-a716-446655440000',
        'test@example.com',
        'User 1',
        new Date()
      );
      const user2 = new User(
        '660e8400-e29b-41d4-a716-446655440001',
        'test@example.com',
        'User 2',
        new Date()
      );

      // Act & Assert
      expect(user1.equals(user2)).toBe(false);
    });
  });
});
