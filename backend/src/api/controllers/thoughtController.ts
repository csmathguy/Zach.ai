import { Request, Response, NextFunction } from 'express';
import { IThoughtRepository } from '@domain/repositories/IThoughtRepository';
import { CreateThoughtInput } from '@/validators/thoughtSchema';

/**
 * ThoughtController
 *
 * Handles HTTP-specific logic for thought endpoints.
 * Delegates business logic to repository layer.
 *
 * @see work-items/O2-thought-capture/architecture/adr-004-layered-architecture.md
 */
export class ThoughtController {
  constructor(private thoughtRepository: IThoughtRepository) {}

  /**
   * Hardcoded user ID for MVP (no auth)
   * TODO: Extract from JWT token in O8 (Authentication feature)
   */
  private static readonly MVP_USER_ID = '00000000-0000-4000-8000-000000000001';

  /**
   * POST /api/thoughts - Create a new thought
   * Request body validated by middleware (Zod schema)
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as CreateThoughtInput;

      const thought = await this.thoughtRepository.create({
        text: input.text,
        source: input.source,
        userId: ThoughtController.MVP_USER_ID,
      });

      return res.status(201).json({
        id: thought.id,
        text: thought.text,
        source: thought.source,
        timestamp: thought.timestamp,
        processedState: thought.processedState,
      });
    } catch (error) {
      next(error);
    }
  };
}
