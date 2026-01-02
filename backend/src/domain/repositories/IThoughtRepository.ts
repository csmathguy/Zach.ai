import { Thought } from '@domain/models/Thought';
import { CreateThoughtDto } from '@domain/types';

/**
 * IThoughtRepository
 *
 * Contract for thought persistence.
 * Thoughts are immutable - no update or delete operations.
 *
 * Contract Guarantees:
 * - create(): Saves thought to database, returns domain model with generated ID
 * - create(): Throws error if userId does not exist (foreign key constraint)
 * - findById(): Returns thought if exists, null otherwise (never throws)
 * - findByUser(): Returns thoughts ordered by timestamp DESC (most recent first)
 * - findByUser(): Returns empty array if user has no thoughts
 * - findAll(): Returns all thoughts ordered by timestamp DESC
 * - findAll(): Returns empty array if no thoughts exist
 * - NO update() method - thoughts are immutable
 * - NO delete() method - thoughts are immutable
 */
export interface IThoughtRepository {
  /**
   * Create a new thought
   * @throws Error if userId does not exist
   */
  create(dto: CreateThoughtDto): Promise<Thought>;

  /**
   * Find thought by ID
   * @returns Thought if found, null otherwise
   */
  findById(id: string): Promise<Thought | null>;

  /**
   * Find all thoughts for a user, ordered by timestamp DESC
   * @returns Array of thoughts (empty if none found)
   */
  findByUser(userId: string): Promise<Thought[]>;

  /**
   * Find all thoughts, ordered by timestamp DESC
   * @returns Array of thoughts (empty if none found)
   */
  findAll(): Promise<Thought[]>;

  // NO update() - thoughts are immutable
  // NO delete() - thoughts are immutable
}
