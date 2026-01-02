/**
 * ActionType Enum
 *
 * Categorizes the type/nature of an action in the GTD workflow.
 */
export enum ActionType {
  Manual = 'Manual',
  AgentTask = 'AgentTask',
  Clarification = 'Clarification',
  Review = 'Review',
  Recurring = 'Recurring',
  Reference = 'Reference',
}

/**
 * ActionStatus Enum
 *
 * Tracks the current state of an action in its lifecycle.
 */
export enum ActionStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Action Domain Model
 *
 * Represents a concrete next action in the GTD system.
 * Actions can belong to projects or exist in the inbox (projectId = null).
 */
export class Action {
  /**
   * Creates a new Action instance
   * @param id - UUID v4 identifier
   * @param title - Action title (must be non-empty)
   * @param description - Detailed action description
   * @param actionType - Type/category of the action
   * @param status - Current action status
   * @param projectId - UUID of associated project, or null if inbox action
   * @param createdAt - Timestamp when action was created
   * @param updatedAt - Timestamp when action was last updated
   * @throws {Error} If title is empty
   * @throws {Error} If id or projectId is not a valid UUID format
   */
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly actionType: ActionType,
    public readonly status: ActionStatus,
    public readonly projectId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    // Validate UUID format for id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format for id');
    }

    // Validate UUID format for projectId if provided
    if (projectId !== null && !uuidRegex.test(projectId)) {
      throw new Error('Invalid UUID format for projectId');
    }

    // Validate non-empty title
    if (!title || title.trim().length === 0) {
      throw new Error('Action title cannot be empty');
    }

    // Freeze the object to ensure true immutability at runtime
    Object.freeze(this);
  }

  /**
   * Compares this action with another based on id
   * @param other - Another Action instance to compare with
   * @returns true if actions have the same id, false otherwise
   */
  equals(other: Action): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a string representation of the action
   * @returns String representation with id, title, and status
   */
  toString(): string {
    const projectInfo = this.projectId ? `, project: ${this.projectId}` : ' (inbox)';
    return `Action(id: ${this.id}, title: "${this.title}", status: ${this.status}${projectInfo})`;
  }
}
