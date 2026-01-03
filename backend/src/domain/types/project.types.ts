/**
 * Project Data Transfer Objects (DTOs)
 *
 * DTOs define the shape of data when creating or updating Project entities.
 */

/**
 * DTO for creating a new Project
 * Contains required field (title) and optional fields (description, status)
 */
export interface CreateProjectDto {
  title: string;
  description?: string; // Optional: null in database if not provided
  status?: string; // Optional: defaults to 'ACTIVE' if not provided
}

/**
 * DTO for updating an existing Project
 * All fields are optional to support partial updates
 * description can be set to null to clear it
 */
export interface UpdateProjectDto {
  title?: string;
  description?: string | null; // Can be null to clear the description
  status?: string;
}
