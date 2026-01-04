import { Router, Request, Response, NextFunction } from 'express';
import { ThoughtController } from '@api/controllers/thoughtController';
import { PrismaThoughtRepository } from '@infrastructure/prisma/repositories/PrismaThoughtRepository';
import { prisma } from '@infrastructure/prisma/client';
import { validateRequest } from '@/middleware/validateRequest';
import { createThoughtSchema } from '@/validators/thoughtSchema';

const thoughtRepository = new PrismaThoughtRepository(prisma);
const thoughtController = new ThoughtController(thoughtRepository);

const router = Router();

const requireJson = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.is('application/json')) {
    res.status(415).json({ error: 'Unsupported Media Type' });
    return;
  }

  next();
};

router.post('/', requireJson, validateRequest(createThoughtSchema), thoughtController.create);

export default router;
