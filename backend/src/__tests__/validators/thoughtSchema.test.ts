import { describe, it, expect } from '@jest/globals';
import { createThoughtSchema, type CreateThoughtInput } from '../../validators/thoughtSchema';

describe('createThoughtSchema', () => {
  describe('text field validation', () => {
    it('should accept valid text with 1 character', () => {
      const input = { text: 'a', source: 'text' as const };
      const result = createThoughtSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept valid text with 10,000 characters', () => {
      const input = { text: 'a'.repeat(10000), source: 'text' as const };
      const result = createThoughtSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject empty text', () => {
      const input = { text: '', source: 'text' as const };
      const result = createThoughtSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('text');
        expect(result.error.issues[0].message).toMatch(/at least 1 character/i);
      }
    });

    it('should reject text over 10,000 characters', () => {
      const input = { text: 'a'.repeat(10001), source: 'text' as const };
      const result = createThoughtSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('text');
        expect(result.error.issues[0].message).toMatch(/at most 10000 characters/i);
      }
    });

    it('should reject non-string text', () => {
      const input = { text: 123, source: 'text' };
      const result = createThoughtSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('text');
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });

    it('should reject missing text field', () => {
      const input = { source: 'text' };
      const result = createThoughtSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('text');
        expect(result.error.issues[0].code).toBe('invalid_type');
      }
    });
  });

  describe('source field validation', () => {
    it('should accept "text" as valid source', () => {
      const input = { text: 'Buy groceries', source: 'text' as const };
      const result = createThoughtSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept "voice" as valid source', () => {
      const input = { text: 'Buy groceries', source: 'voice' as const };
      const result = createThoughtSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept "api" as valid source', () => {
      const input = { text: 'Buy groceries', source: 'api' as const };
      const result = createThoughtSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should default to "text" when source is missing', () => {
      const input = { text: 'Buy groceries' };
      const result = createThoughtSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source).toBe('text');
      }
    });

    it('should reject invalid source value', () => {
      const input = { text: 'Buy groceries', source: 'invalid' };
      const result = createThoughtSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('source');
        expect(result.error.issues[0].message).toMatch(/invalid_enum_value|text|voice|api/i);
      }
    });
  });

  describe('TypeScript type inference', () => {
    it('should infer correct TypeScript type', () => {
      // This test verifies compile-time type inference
      const validInput: CreateThoughtInput = {
        text: 'Buy groceries',
        source: 'text',
      };

      const result = createThoughtSchema.safeParse(validInput);
      expect(result.success).toBe(true);

      // TypeScript should allow this without errors
      if (result.success) {
        const data: CreateThoughtInput = result.data;
        expect(data.text).toBeDefined();
        expect(data.source).toBeDefined();
      }
    });
  });
});
