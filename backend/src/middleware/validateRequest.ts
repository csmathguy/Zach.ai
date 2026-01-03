import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodIssue } from 'zod';
import { ValidationError } from '../errors/AppError';

/**
 * Express middleware factory for Zod schema validation
 * Validates req.body against provided schema
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * @see work-items/O2-thought-capture/architecture/adr-001-express-validation-strategy.md
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue: ZodIssue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      throw new ValidationError('Validation failed', details);
    }

    // Replace body with parsed data (type-safe)
    req.body = result.data;
    next();
  };
};
