import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/errors/AppError';
import { logger } from '@/utils/logger';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { ISessionRepository } from '@domain/repositories/ISessionRepository';
import type { AuthService } from '@application/services/AuthService';
import type { PasswordResetService } from '@application/services/PasswordResetService';
import { getSessionIdFromRequest } from '@/middleware/authMiddleware';

export class AuthController {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: ISessionRepository,
    private authService: AuthService,
    private resetService: PasswordResetService,
    private sessionTtlMinutes: number
  ) {}

  private getCookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.sessionTtlMinutes * 60 * 1000,
      path: '/',
    };
  }

  private getClearCookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier, password } = req.body as { identifier: string; password: string };
      const now = new Date();
      const result = await this.authService.login({ identifier, password }, now);
      const user = await this.userRepository.getById(result.userId);

      if (!user) {
        throw new AppError(500, 'User not found after login');
      }

      res.cookie('session_id', result.sessionId, this.getCookieOptions());
      res.status(200).json({
        userId: user.id,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = getSessionIdFromRequest(req);
      if (!sessionId) {
        throw new AppError(401, 'Unauthorized');
      }

      await this.sessionRepository.deleteById(sessionId);
      res.clearCookie('session_id', this.getClearCookieOptions());
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      next(error);
    }
  };

  resetRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier } = req.body as { identifier: string };
      const trimmed = identifier.trim();
      const user = trimmed.includes('@')
        ? await this.userRepository.getByEmail(trimmed)
        : await this.userRepository.getByUsername(trimmed);

      logger.info({
        event: 'auth.reset-request',
        identifier: trimmed,
        userFound: Boolean(user),
      });

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      next(error);
    }
  };

  resetConfirm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body as { token: string; newPassword: string };
      await this.resetService.resetPassword(token, newPassword, new Date());
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      next(error);
    }
  };
}
