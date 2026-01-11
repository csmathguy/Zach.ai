import { z } from 'zod';
import { passwordPolicy } from './passwordPolicy';

const identifierSchema = z
  .string()
  .min(1, 'Identifier is required')
  .refine(
    (value) => {
      const trimmed = value.trim();
      if (trimmed.length === 0) return false;
      if (!trimmed.includes('@')) return true;
      return z.string().email().safeParse(trimmed).success;
    },
    { message: 'Identifier must be a valid username or email' }
  );

export const passwordPolicySchema = z
  .string()
  .min(passwordPolicy.minLength, `Password must be at least ${passwordPolicy.minLength} characters`)
  .refine(passwordPolicy.hasRequiredClasses, 'Password must include 3 of 4 character classes')
  .refine(
    (value) => !passwordPolicy.denylist.includes(value.toLowerCase()),
    'Password is too common'
  );

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Password is required'),
});

export const resetRequestSchema = z.object({
  identifier: identifierSchema,
});

export const resetConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: passwordPolicySchema,
});

export const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ADMIN']),
});

const phoneSchema = z
  .string()
  .min(7, 'Phone number is too short')
  .max(20, 'Phone number is too long')
  .regex(/^\+?[0-9()\-\s.]+$/, 'Phone number format is invalid');

export const updateProfileSchema = z
  .object({
    username: z.string().min(1, 'Username is required').optional(),
    name: z.string().min(1, 'Name is required').optional(),
    email: z.string().email('Email must be valid').nullable().optional(),
    phone: phoneSchema.nullable().optional(),
    currentPassword: z.string().min(1, 'Current password is required').optional(),
  })
  .strict()
  .refine(
    (data) =>
      Boolean(
        data.username !== undefined ||
        data.name !== undefined ||
        data.email !== undefined ||
        data.phone !== undefined
      ),
    { message: 'At least one field must be provided' }
  )
  .refine(
    (data) => {
      const requiresPassword =
        data.username !== undefined || data.email !== undefined || data.phone !== undefined;
      if (!requiresPassword) {
        return true;
      }
      return Boolean(data.currentPassword && data.currentPassword.trim().length > 0);
    },
    {
      message: 'Current password is required for this change',
      path: ['currentPassword'],
    }
  );
