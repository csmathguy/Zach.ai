import { Router, Request, Response, NextFunction } from 'express';
import { PrismaUserRepository } from '@infrastructure/prisma/repositories/PrismaUserRepository';
import { PrismaSessionRepository } from '@infrastructure/prisma/repositories/PrismaSessionRepository';
import { PrismaPasswordResetTokenRepository } from '@infrastructure/prisma/repositories/PrismaPasswordResetTokenRepository';
import { prisma } from '@infrastructure/prisma/client';
import { createAuthMiddleware } from '@/middleware/authMiddleware';
import { validateRequest } from '@/middleware/validateRequest';
import { createUserSchema } from '@/validators/authSchemas';
import { AdminController } from '@api/controllers/adminController';
import { PasswordResetService } from '@application/services/PasswordResetService';
import { hashPassword } from '@/utils/passwordHasher';

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const resetTokenTtlMinutes = parseNumber(process.env.RESET_TOKEN_TTL_MINUTES, 30);

const userRepository = new PrismaUserRepository(prisma);
const sessionRepository = new PrismaSessionRepository(prisma);
const resetTokenRepository = new PrismaPasswordResetTokenRepository(prisma);

const resetService = new PasswordResetService(
  userRepository,
  resetTokenRepository,
  { resetTokenTtlMinutes },
  { hash: hashPassword }
);

const adminController = new AdminController(userRepository, resetService);
const { requireAdmin } = createAuthMiddleware({ userRepository, sessionRepository });

const router = Router();

const requireJson = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.is('application/json')) {
    res.status(415).json({ error: 'Unsupported Media Type' });
    return;
  }

  next();
};

router.get('/users', requireAdmin, adminController.listUsers);
router.post(
  '/users',
  requireAdmin,
  requireJson,
  validateRequest(createUserSchema),
  adminController.createUser
);
router.post('/users/:id/reset', requireAdmin, adminController.resetUserPassword);

export default router;
