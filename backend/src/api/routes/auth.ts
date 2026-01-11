import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '@application/services/AuthService';
import { PasswordResetService } from '@application/services/PasswordResetService';
import { PrismaUserRepository } from '@infrastructure/prisma/repositories/PrismaUserRepository';
import { PrismaSessionRepository } from '@infrastructure/prisma/repositories/PrismaSessionRepository';
import { PrismaPasswordResetTokenRepository } from '@infrastructure/prisma/repositories/PrismaPasswordResetTokenRepository';
import { prisma } from '@infrastructure/prisma/client';
import { validateRequest } from '@/middleware/validateRequest';
import { createAuthMiddleware } from '@/middleware/authMiddleware';
import { loginSchema, resetRequestSchema, resetConfirmSchema } from '@/validators/authSchemas';
import { AuthController } from '@api/controllers/authController';
import { hashPassword, verifyPassword } from '@/utils/passwordHasher';

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const sessionTtlMinutes = parseNumber(process.env.SESSION_TTL_MINUTES, 240);
const resetTokenTtlMinutes = parseNumber(process.env.RESET_TOKEN_TTL_MINUTES, 30);
const lockoutThreshold = parseNumber(process.env.LOCKOUT_THRESHOLD, 5);
const lockoutWindowMinutes = parseNumber(process.env.LOCKOUT_WINDOW_MINUTES, 15);

const userRepository = new PrismaUserRepository(prisma);
const sessionRepository = new PrismaSessionRepository(prisma);
const resetTokenRepository = new PrismaPasswordResetTokenRepository(prisma);

const authService = new AuthService(
  userRepository,
  sessionRepository,
  { verify: verifyPassword },
  {
    sessionTtlMinutes,
    lockoutThreshold,
    lockoutWindowMinutes,
  }
);

const resetService = new PasswordResetService(
  userRepository,
  resetTokenRepository,
  { resetTokenTtlMinutes },
  { hash: hashPassword }
);

const authController = new AuthController(
  userRepository,
  sessionRepository,
  authService,
  resetService,
  sessionTtlMinutes
);

const { requireAuth } = createAuthMiddleware({ userRepository, sessionRepository });

const router = Router();

const requireJson = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.is('application/json')) {
    res.status(415).json({ error: 'Unsupported Media Type' });
    return;
  }

  next();
};

router.post('/login', requireJson, validateRequest(loginSchema), authController.login);
router.post('/logout', requireAuth, authController.logout);
router.post(
  '/reset/request',
  requireJson,
  validateRequest(resetRequestSchema),
  authController.resetRequest
);
router.post(
  '/reset/confirm',
  requireJson,
  validateRequest(resetConfirmSchema),
  authController.resetConfirm
);

export default router;
