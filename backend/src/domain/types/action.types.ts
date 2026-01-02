/**
 * Action Data Transfer Objects (DTOs)
 *
 * DTOs define the shape of data when creating or updating Action entities.
 */

/**
 * DTO for creating a new Action
 * Contains required fields (title, actionType) and optional fields
 */
export interface CreateActionDto {
  title: string;
  description?: string; // Optional: null in database if not provided
  actionType: string; // Required: 'Manual', 'AgentTask', 'Clarification', 'Review', 'Recurring', 'Reference'
  status?: string; // Optional: defaults to 'TODO' if not provided
  projectId?: string | null; // Optional: null for inbox actions, string for project actions
}

/**
 * DTO for updating an existing Action
 * All fields are optional to support partial updates
 * description and projectId can be set to null to clear them
 */
export interface UpdateActionDto {
  title?: string;
  description?: string | null; // Can be null to clear the description
  actionType?: string;
  status?: string;
  projectId?: string | null; // Can be null to move to inbox
}
