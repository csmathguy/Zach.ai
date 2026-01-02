/**
 * Thought Domain Model
 *
 * Represents an immutable thought/note captured in the system.
 * Once created, thoughts cannot be modified - they are permanent records.
 * This enforces the GTD principle of capturing thoughts as-is without editing.
 */
export class Thought {
  /**
   * Creates a new Thought instance
   * @param id - UUID v4 identifier
   * @param text - The thought content (must be non-empty)
   * @param userId - UUID of the user who created this thought
   * @param timestamp - When the thought was captured
   * @param source - Where the thought came from ('manual', 'chat', 'email', 'api')
   * @param processedState - Processing status ('UNPROCESSED', 'PROCESSED', 'ARCHIVED')
   * @throws {Error} If text is empty
   * @throws {Error} If id or userId is not a valid UUID format
   */
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly userId: string,
    public readonly timestamp: Date,
    public readonly source: string,
    public readonly processedState: string
  ) {
    // Validate UUID format for id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format for id');
    }

    // Validate UUID format for userId
    if (!uuidRegex.test(userId)) {
      throw new Error('Invalid UUID format for userId');
    }

    // Validate non-empty text
    if (!text || text.trim().length === 0) {
      throw new Error('Thought text cannot be empty');
    }

    // Freeze the object to ensure true immutability at runtime
    Object.freeze(this);
  }

  /**
   * Compares this thought with another based on id
   * @param other - Another Thought instance to compare with
   * @returns true if thoughts have the same id, false otherwise
   */
  equals(other: Thought): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a string representation of the thought
   * @returns String representation with id and truncated text
   */
  toString(): string {
    const truncatedText = this.text.length > 50 ? `${this.text.substring(0, 50)}...` : this.text;
    return `Thought(id: ${this.id}, text: "${truncatedText}", state: ${this.processedState})`;
  }
}
