import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { IThoughtRepository } from '@domain/repositories/IThoughtRepository';
import { ValidationError } from '@/errors';
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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2003' || error.code === 'P2025')
      ) {
        next(new ValidationError('User not found', { userId: ThoughtController.MVP_USER_ID }));
        return;
      }

      next(error);
    }
  };

  /**
   * GET /api/thoughts - List thoughts for the MVP user
   */
  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const thoughts = await this.thoughtRepository.findByUser(ThoughtController.MVP_USER_ID);

      return res.status(200).json(
        thoughts.map((thought) => ({
          id: thought.id,
          text: thought.text,
          source: thought.source,
          timestamp: thought.timestamp,
          processedState: thought.processedState,
        }))
      );
    } catch (error) {
      next(error);
    }
  };
}
