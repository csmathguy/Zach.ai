import { describe, it, expect } from '@jest/globals';
import { User } from '@domain/models/User';
import type { UserRole, UserStatus } from '@domain/types';

describe('User Domain Model', () => {
  describe('User Creation', () => {
    it('should create user with all required fields', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const username = 'test-user';
      const email = 'test@example.com';
      const phone = '5551112222';
      const name = 'Test User';
      const passwordHash = 'hash';
      const role: UserRole = 'USER';
      const status: UserStatus = 'ACTIVE';
      const failedLoginCount = 0;
      const createdAt = new Date('2026-01-02T12:00:00Z');
      const updatedAt = new Date('2026-01-02T12:00:00Z');

      // Act
      const user = new User({
        id,
        username,
        email,
        phone,
        name,
        passwordHash,
        role,
        status,
        failedLoginCount,
        createdAt,
        updatedAt,
      });

      // Assert
      expect(user.id).toBe(id);
      expect(user.username).toBe(username);
      expect(user.email).toBe(email);
      expect(user.phone).toBe(phone);
      expect(user.name).toBe(name);
      expect(user.passwordHash).toBe(passwordHash);
      expect(user.role).toBe(role);
      expect(user.status).toBe(status);
      expect(user.failedLoginCount).toBe(0);
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });

    it('should enforce readonly properties via Object.freeze', () => {
      // Arrange
      const user = new User({
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hash',
        role: 'USER',
        status: 'ACTIVE',
        failedLoginCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act & Assert - Object.freeze makes properties immutable at runtime
      expect(() => {
        'use strict';
        (user as unknown as { email: string }).email = 'new@example.com';
      }).toThrow();
    });

    it('should throw error on empty email', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const emptyEmail = '';
      const username = 'test-user';
      const name = 'Test User';
      const passwordHash = 'hash';
      const createdAt = new Date();
      const updatedAt = new Date();

      // Act & Assert
      expect(() => {
        new User({
          id,
          username,
          email: emptyEmail,
          name,
          passwordHash,
          role: 'USER',
          status: 'ACTIVE',
          failedLoginCount: 0,
          createdAt,
          updatedAt,
        });
      }).toThrow('Email cannot be empty');
    });

    it('should throw error on empty phone', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const username = 'test-user';
      const name = 'Test User';
      const passwordHash = 'hash';
      const createdAt = new Date();
      const updatedAt = new Date();

      expect(() => {
        new User({
          id,
          username,
          phone: '',
          name,
          passwordHash,
          role: 'USER',
          status: 'ACTIVE',
          failedLoginCount: 0,
          createdAt,
          updatedAt,
        });
      }).toThrow('Phone cannot be empty');
    });

    it('should allow missing email', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const username = 'test-user';
      const name = 'Test User';
      const passwordHash = 'hash';
      const createdAt = new Date();
      const updatedAt = new Date();

      // Act
      const user = new User({
        id,
        username,
        name,
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
        failedLoginCount: 0,
        createdAt,
        updatedAt,
      });

      // Assert
      expect(user.email).toBeUndefined();
    });

    it('should throw error on empty username', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const name = 'Test User';
      const passwordHash = 'hash';
      const createdAt = new Date();
      const updatedAt = new Date();

      // Act & Assert
      expect(() => {
        new User({
          id,
          username: ' ',
          email: 'test@example.com',
          name,
          passwordHash,
          role: 'USER',
          status: 'ACTIVE',
          failedLoginCount: 0,
          createdAt,
          updatedAt,
        });
      }).toThrow('Username cannot be empty');
    });

    it('should throw error on empty name', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const email = 'test@example.com';
      const username = 'test-user';
      const emptyName = '';
      const passwordHash = 'hash';
      const createdAt = new Date();
      const updatedAt = new Date();

      // Act & Assert
      expect(() => {
        new User({
          id,
          username,
          email,
          name: emptyName,
          passwordHash,
          role: 'USER',
          status: 'ACTIVE',
          failedLoginCount: 0,
          createdAt,
          updatedAt,
        });
      }).toThrow('Name cannot be empty');
    });

    it('should throw error on invalid UUID format', () => {
      // Arrange
      const invalidId = 'not-a-uuid';
      const email = 'test@example.com';
      const username = 'test-user';
      const name = 'Test User';
      const passwordHash = 'hash';
      const createdAt = new Date();
      const updatedAt = new Date();

      // Act & Assert
      expect(() => {
        new User({
          id: invalidId,
          username,
          email,
          name,
          passwordHash,
          role: 'USER',
          status: 'ACTIVE',
          failedLoginCount: 0,
          createdAt,
          updatedAt,
        });
      }).toThrow('Invalid UUID format');
    });

    it('should accept valid UUID v4 format', () => {
      // Arrange
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const email = 'test@example.com';
      const username = 'test-user';
      const name = 'Test User';
      const passwordHash = 'hash';
      const createdAt = new Date();
      const updatedAt = new Date();

      // Act
      const user = new User({
        id: validUuid,
        username,
        email,
        name,
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
        failedLoginCount: 0,
        createdAt,
        updatedAt,
      });

      // Assert
      expect(user.id).toBe(validUuid);
    });
  });

  describe('User Equality', () => {
    it('should consider two users with same id as equal', () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const base = {
        id,
        username: 'user',
        name: 'User',
        passwordHash: 'hash',
        role: 'USER' as const,
        status: 'ACTIVE' as const,
        failedLoginCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const user1 = new User({ ...base, email: 'test1@example.com' });
      const user2 = new User({ ...base, email: 'test2@example.com' });

      // Act & Assert
      expect(user1.equals(user2)).toBe(true);
    });

    it('should consider two users with different ids as not equal', () => {
      // Arrange
      const user1 = new User({
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'user1',
        email: 'test@example.com',
        name: 'User 1',
        passwordHash: 'hash',
        role: 'USER',
        status: 'ACTIVE',
        failedLoginCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const user2 = new User({
        id: '660e8400-e29b-41d4-a716-446655440001',
        username: 'user2',
        email: 'test@example.com',
        name: 'User 2',
        passwordHash: 'hash',
        role: 'USER',
        status: 'ACTIVE',
        failedLoginCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act & Assert
      expect(user1.equals(user2)).toBe(false);
    });
  });
});
