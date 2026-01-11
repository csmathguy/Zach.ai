import { describe, expect, it } from '@jest/globals';
import {
  createUserSchema,
  loginSchema,
  passwordPolicySchema,
  resetConfirmSchema,
  resetRequestSchema,
  updateProfileSchema,
} from '@/validators/authSchemas';

describe('Auth validation schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid username login', () => {
      const result = loginSchema.safeParse({
        identifier: 'zach',
        password: 'ValidPass1!',
      });

      expect(result.success).toBe(true);
    });

    it('accepts valid email login', () => {
      const result = loginSchema.safeParse({
        identifier: 'zach@example.com',
        password: 'ValidPass1!',
      });

      expect(result.success).toBe(true);
    });

    it('rejects empty identifier', () => {
      const result = loginSchema.safeParse({
        identifier: '',
        password: 'ValidPass1!',
      });

      expect(result.success).toBe(false);
    });

    it('rejects malformed email when identifier contains @', () => {
      const result = loginSchema.safeParse({
        identifier: 'not-an-email@',
        password: 'ValidPass1!',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('passwordPolicySchema', () => {
    it('rejects passwords shorter than 12 characters', () => {
      const result = passwordPolicySchema.safeParse('Short1!');
      expect(result.success).toBe(false);
    });

    it('rejects passwords without 3 of 4 character classes', () => {
      const result = passwordPolicySchema.safeParse('alllowercase12');
      expect(result.success).toBe(false);
    });

    it('rejects denylisted passwords', () => {
      const result = passwordPolicySchema.safeParse('password');
      expect(result.success).toBe(false);
    });

    it('accepts a valid password', () => {
      const result = passwordPolicySchema.safeParse('ValidPass12!');
      expect(result.success).toBe(true);
    });
  });

  describe('resetRequestSchema', () => {
    it('requires identifier', () => {
      const result = resetRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('resetConfirmSchema', () => {
    it('requires token and newPassword', () => {
      const result = resetConfirmSchema.safeParse({
        token: '',
        newPassword: '',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    it('accepts username, name, optional email, and role', () => {
      const result = createUserSchema.safeParse({
        username: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('updateProfileSchema', () => {
    it('allows name-only updates without current password', () => {
      const result = updateProfileSchema.safeParse({
        name: 'New Name',
      });

      expect(result.success).toBe(true);
    });

    it('requires current password for email changes', () => {
      const result = updateProfileSchema.safeParse({
        email: 'new@example.com',
      });

      expect(result.success).toBe(false);
    });

    it('accepts sensitive changes with current password', () => {
      const result = updateProfileSchema.safeParse({
        email: 'new@example.com',
        currentPassword: 'ValidPass12!',
      });

      expect(result.success).toBe(true);
    });
  });
});
