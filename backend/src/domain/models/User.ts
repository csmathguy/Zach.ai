/**
 * User Domain Model
 *
 * Represents a user in the system with identity and metadata.
 * Immutable once created - all properties are readonly.
 */
export class User {
  /**
   * Creates a new User instance
   * @param id - UUID v4 identifier
   * @param email - User's email address (must be non-empty)
   * @param name - User's display name (must be non-empty)
   * @param createdAt - Timestamp when user was created
   * @throws {Error} If email or name is empty
   * @throws {Error} If id is not a valid UUID format
   */
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date
  ) {
    // Validate UUID format (basic check for UUID v4 pattern)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format');
    }

    // Validate non-empty email
    if (!email || email.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    // Validate non-empty name
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    // Freeze the object to ensure true immutability at runtime
    Object.freeze(this);
  }

  /**
   * Compares this user with another based on id
   * @param other - Another User instance to compare with
   * @returns true if users have the same id, false otherwise
   */
  equals(other: User): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a string representation of the user
   * @returns String representation in format "User(id: ..., email: ...)"
   */
  toString(): string {
    return `User(id: ${this.id}, email: ${this.email}, name: ${this.name})`;
  }
}
