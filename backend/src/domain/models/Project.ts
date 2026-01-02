/**
 * ProjectStatus Enum
 *
 * Represents the current state of a project in the GTD workflow.
 */
export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

/**
 * Project Domain Model
 *
 * Represents a project (multi-step outcome) in the GTD system.
 * Projects have associated actions and can link to thoughts for context.
 */
export class Project {
  /**
   * Creates a new Project instance
   * @param id - UUID v4 identifier
   * @param title - Project title (must be non-empty)
   * @param description - Detailed project description
   * @param status - Current project status (ACTIVE, PAUSED, COMPLETED)
   * @param nextActionId - UUID of the next action to take, or null if none defined
   * @param createdAt - Timestamp when project was created
   * @param updatedAt - Timestamp when project was last updated
   * @throws {Error} If title is empty
   * @throws {Error} If id or nextActionId is not a valid UUID format
   */
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly status: ProjectStatus,
    public readonly nextActionId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    // Validate UUID format for id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format for id');
    }

    // Validate UUID format for nextActionId if provided
    if (nextActionId !== null && !uuidRegex.test(nextActionId)) {
      throw new Error('Invalid UUID format for nextActionId');
    }

    // Validate non-empty title
    if (!title || title.trim().length === 0) {
      throw new Error('Project title cannot be empty');
    }

    // Freeze the object to ensure true immutability at runtime
    Object.freeze(this);
  }

  /**
   * Compares this project with another based on id
   * @param other - Another Project instance to compare with
   * @returns true if projects have the same id, false otherwise
   */
  equals(other: Project): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a string representation of the project
   * @returns String representation with id, title, and status
   */
  toString(): string {
    return `Project(id: ${this.id}, title: "${this.title}", status: ${this.status})`;
  }
}
