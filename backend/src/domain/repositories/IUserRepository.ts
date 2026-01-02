/**
 * User Repository Interface
 *
 * Contract for user data access operations.
 * Implementations: PrismaUserRepository
 */

import { User } from '@domain/models';
import { CreateUserDto, UpdateUserDto } from '@domain/types';

export interface IUserRepository {
  /**
   * Create a new user
   * @throws Error if email already exists (unique constraint)
   */
  create(data: CreateUserDto): Promise<User>;

  /**
   * Find user by ID
   * @returns User if found, null otherwise
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   * @returns User if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find all users
   * @returns Array of users, empty array if none exist
   */
  findAll(): Promise<User[]>;

  /**
   * Update user fields (partial update)
   * @throws Error if user not found
   */
  update(id: string, data: UpdateUserDto): Promise<User>;

  /**
   * Delete user by ID
   * Idempotent - no error if user doesn't exist
   */
  delete(id: string): Promise<void>;
}
