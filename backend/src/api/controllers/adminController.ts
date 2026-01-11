import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/errors/AppError';
import { logger } from '@/utils/logger';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { PasswordResetService } from '@application/services/PasswordResetService';
import type { UserRole } from '@domain/types';
import { hashPassword } from '@/utils/passwordHasher';

export class AdminController {
  constructor(
    private userRepository: IUserRepository,
    private resetService: PasswordResetService
  ) {}

  listUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userRepository.listAll();
      res.status(200).json({
        users: users.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email ?? null,
          name: user.name,
          role: user.role,
          status: user.status,
          lastLoginAt: user.lastLoginAt ?? null,
          createdAt: user.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as {
        username: string;
        name: string;
        email?: string;
        role: UserRole;
      };

      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const randomPassword = crypto.randomBytes(24).toString('base64url');
      const passwordHash = await hashPassword(randomPassword);
      const created = await this.userRepository.create({
        username: input.username,
        email: input.email ?? null,
        name: input.name,
        role: input.role,
        status: 'ACTIVE',
        passwordHash,
      });

      const { rawToken } = await this.resetService.issueToken(req.user.id, created.id, new Date());

      logger.info({
        event: 'admin.user-created',
        adminUserId: req.user.id,
        userId: created.id,
      });

      res.status(201).json({ userId: created.id, resetToken: rawToken });
    } catch (error) {
      next(error);
    }
  };

  resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const userId = req.params.id;
      const user = await this.userRepository.getById(userId);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      const { rawToken } = await this.resetService.issueToken(req.user.id, userId, new Date());

      logger.info({
        event: 'admin.reset-token-issued',
        adminUserId: req.user.id,
        userId,
      });

      res.status(200).json({ resetToken: rawToken });
    } catch (error) {
      next(error);
    }
  };
}
