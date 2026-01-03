import { z } from 'zod';

/**
 * Validation schema for creating a thought.
 *
 * Validates incoming thought data from POST /api/thoughts endpoint.
 * - text: 1-10,000 characters (required)
 * - source: enum ['text', 'voice', 'api'] (optional, defaults to 'text')
 */
export const createThoughtSchema = z.object({
  text: z
    .string()
    .min(1, 'Text must contain at least 1 character')
    .max(10000, 'Text must contain at most 10000 characters'),

  source: z.enum(['text', 'voice', 'api']).default('text').optional(),
});

/**
 * TypeScript type inferred from Zod schema.
 * Represents validated input for creating a thought.
 */
export type CreateThoughtInput = z.infer<typeof createThoughtSchema>;
