import { Action } from '@domain/models';
import { CreateActionDto, UpdateActionDto } from '@domain/types';

/**
 * Repository interface for managing actions.
 *
 * **Design Principles**:
 * - Supports both inbox actions (null projectId) and project-specific actions
 * - Ordering: findByProject returns ASC (task list order), findAll returns DESC (global view)
 * - Idempotent operations: assignUser, unassignUser, linkThought, unlinkThought
 *
 * **Contract Guarantees**:
 * - create() with default status 'TODO' if not provided
 * - findById() returns null if not found (never throws)
 * - findInbox() filters actions where projectId is null
 * - delete() is idempotent (no error if action doesn't exist)
 * - assignUser/unassignUser are idempotent (upsert pattern)
 * - linkThought/unlinkThought are idempotent (deleteMany pattern)
 */
export interface IActionRepository {
  /**
   * Create new action with optional project assignment.
   * @param data - Action creation data
   * @returns Created action with generated ID
   */
  create(data: CreateActionDto): Promise<Action>;

  /**
   * Find action by ID.
   * @param id - Action ID
   * @returns Action if found, null otherwise
   */
  findById(id: string): Promise<Action | null>;

  /**
   * Find all actions for a specific project, ordered by createdAt ASC.
   * @param projectId - Project ID
   * @returns Array of actions (empty if none found)
   */
  findByProject(projectId: string): Promise<Action[]>;

  /**
   * Find actions by type.
   * @param actionType - Action type to filter by
   * @returns Array of actions
   */
  findByType(actionType: string): Promise<Action[]>;

  /**
   * Find actions by status.
   * @param status - Status to filter by
   * @returns Array of actions
   */
  findByStatus(status: string): Promise<Action[]>;

  /**
   * Find inbox actions (where projectId is null), ordered by createdAt DESC.
   * @returns Array of inbox actions
   */
  findInbox(): Promise<Action[]>;

  /**
   * Find all actions ordered by createdAt DESC (newest first).
   * @returns Array of all actions
   */
  findAll(): Promise<Action[]>;

  /**
   * Update action fields.
   * @param id - Action ID
   * @param data - Fields to update
   * @returns Updated action
   * @throws Error if action not found
   */
  update(id: string, data: UpdateActionDto): Promise<Action>;

  /**
   * Delete action (idempotent - no error if doesn't exist).
   * @param id - Action ID
   */
  delete(id: string): Promise<void>;

  /**
   * Assign user to action (idempotent).
   * @param actionId - Action ID
   * @param userId - User ID to assign
   */
  assignUser(actionId: string, userId: string): Promise<void>;

  /**
   * Unassign user from action (idempotent).
   * @param actionId - Action ID
   * @param userId - User ID to unassign
   */
  unassignUser(actionId: string, userId: string): Promise<void>;

  /**
   * Link thought to action (idempotent).
   * @param actionId - Action ID
   * @param thoughtId - Thought ID to link
   */
  linkThought(actionId: string, thoughtId: string): Promise<void>;

  /**
   * Unlink thought from action (idempotent).
   * @param actionId - Action ID
   * @param thoughtId - Thought ID to unlink
   */
  unlinkThought(actionId: string, thoughtId: string): Promise<void>;
}
