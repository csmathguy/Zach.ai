import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@/errors/AppError';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { ISessionRepository } from '@domain/repositories/ISessionRepository';

export const getSessionIdFromRequest = (req: Request): string | null => {
  const headerValue = req.headers['x-session-id'];
  if (typeof headerValue === 'string' && headerValue.trim().length > 0) {
    return headerValue;
  }

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map((part) => part.trim());
  const match = parts.find((part) => part.startsWith('session_id='));
  if (!match) return null;
  const [, value] = match.split('=');
  return value || null;
};

export const createAuthMiddleware = (deps: {
  userRepository: IUserRepository;
  sessionRepository: ISessionRepository;
}) => {
  const resolveUser = async (req: Request): Promise<void> => {
    const sessionId = getSessionIdFromRequest(req);
    if (!sessionId) {
      throw new AppError(401, 'Unauthorized');
    }

    const session = await deps.sessionRepository.getById(sessionId);
    if (!session || session.expiresAt < new Date()) {
      throw new AppError(401, 'Unauthorized');
    }

    const user = await deps.userRepository.getById(session.userId);
    if (!user) {
      throw new AppError(401, 'Unauthorized');
    }

    req.user = {
      id: user.id,
      role: user.role,
    };
  };

  const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await resolveUser(req);
      next();
    } catch (error) {
      next(error);
    }
  };

  const requireAdmin = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await resolveUser(req);
      if (req.user?.role !== 'ADMIN') {
        throw new AppError(403, 'Forbidden');
      }
      next();
    } catch (error) {
      next(error);
    }
  };

  return { requireAuth, requireAdmin };
};
