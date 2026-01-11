import express from 'express';
import { prisma } from '@/infrastructure/prisma/client';
import { PrismaUserRepository } from '@infrastructure/prisma/repositories/PrismaUserRepository';
import { PrismaSessionRepository } from '@infrastructure/prisma/repositories/PrismaSessionRepository';
import { createAuthMiddleware } from '@/middleware/authMiddleware';
import { validateRequest } from '@/middleware/validateRequest';
import { updateProfileSchema } from '@/validators/authSchemas';
import { AccountController } from '@api/controllers/accountController';

const router = express.Router();

const userRepository = new PrismaUserRepository(prisma);
const sessionRepository = new PrismaSessionRepository(prisma);
const { requireAuth } = createAuthMiddleware({ userRepository, sessionRepository });
const accountController = new AccountController(userRepository);

router.get('/', requireAuth, accountController.getProfile);
router.patch(
  '/',
  requireAuth,
  validateRequest(updateProfileSchema),
  accountController.updateProfile
);

export default router;
