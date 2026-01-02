/**
 * User Data Transfer Objects (DTOs)
 *
 * DTOs define the shape of data when creating or updating User entities.
 */

/**
 * DTO for creating a new User
 * Contains only the fields needed from external input (no id or createdAt)
 */
export interface CreateUserDto {
  email: string;
  name: string;
}

/**
 * DTO for updating an existing User
 * All fields are optional to support partial updates
 */
export interface UpdateUserDto {
  email?: string;
  name?: string;
}
