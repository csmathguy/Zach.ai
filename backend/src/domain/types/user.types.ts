/**
 * User Data Transfer Objects (DTOs)
 *
 * DTOs define the shape of data when creating or updating User entities.
 */

export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'DISABLED' | 'LOCKED';

/**
 * DTO for creating a new User
 * Contains only the fields needed from external input (no id or timestamps)
 */
export interface CreateUserDto {
  username: string;
  email?: string | null;
  phone?: string | null;
  name: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
}

/**
 * DTO for updating an existing User
 * All fields are optional to support partial updates
 */
export interface UpdateUserDto {
  username?: string;
  email?: string | null;
  phone?: string | null;
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  passwordHash?: string;
  failedLoginCount?: number;
  lockoutUntil?: Date | null;
  lastLoginAt?: Date | null;
}
