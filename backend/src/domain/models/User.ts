/**
 * User Domain Model
 *
 * Represents a user in the system with identity and metadata.
 * Immutable once created - all properties are readonly.
 */
import type { UserRole, UserStatus } from '@domain/types';

export interface UserProps {
  id: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  name: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  failedLoginCount: number;
  lockoutUntil?: Date | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  /**
   * Creates a new User instance
   * @param props - User properties
   * @throws {Error} If required fields are empty or invalid
   * @throws {Error} If id is not a valid UUID format
   */
  constructor(private readonly props: UserProps) {
    // Validate UUID format (basic check for UUID v4 pattern)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(props.id)) {
      throw new Error('Invalid UUID format');
    }

    // Validate non-empty username
    if (!props.username || props.username.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }

    // Validate optional email if provided
    if (props.email !== undefined && props.email !== null && props.email.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    // Validate optional phone if provided
    if (props.phone !== undefined && props.phone !== null && props.phone.trim().length === 0) {
      throw new Error('Phone cannot be empty');
    }

    // Validate non-empty name
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    // Validate password hash presence
    if (!props.passwordHash || props.passwordHash.trim().length === 0) {
      throw new Error('Password hash cannot be empty');
    }

    // Freeze the object to ensure true immutability at runtime
    Object.freeze(this);
  }

  get id(): string {
    return this.props.id;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): string | null | undefined {
    return this.props.email;
  }

  get phone(): string | null | undefined {
    return this.props.phone;
  }

  get name(): string {
    return this.props.name;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get failedLoginCount(): number {
    return this.props.failedLoginCount;
  }

  get lockoutUntil(): Date | null | undefined {
    return this.props.lockoutUntil;
  }

  get lastLoginAt(): Date | null | undefined {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
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
    return `User(id: ${this.id}, username: ${this.username})`;
  }
}
