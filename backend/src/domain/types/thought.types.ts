/**
 * Thought Data Transfer Objects (DTOs)
 *
 * DTOs define the shape of data when creating Thought entities.
 * Note: Thoughts are immutable - no update DTO exists.
 */

/**
 * DTO for creating a new Thought
 * Contains required fields (text, userId) and optional fields (source, timestamp)
 */
export interface CreateThoughtDto {
  text: string;
  userId: string;
  source?: string; // Optional: defaults to 'manual' if not provided
  timestamp?: Date; // Optional: defaults to now() if not provided
}
