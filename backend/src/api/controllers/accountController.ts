import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@/errors/AppError';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { UpdateUserDto } from '@domain/types';
import { verifyPassword } from '@/utils/passwordHasher';

interface UpdateProfileRequest {
  username?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  currentPassword?: string;
}

export class AccountController {
  constructor(private userRepository: IUserRepository) {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const user = await this.userRepository.getById(req.user.id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email ?? null,
        phone: user.phone ?? null,
        name: user.name,
        role: user.role,
        status: user.status,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const input = req.body as UpdateProfileRequest;
      const user = await this.userRepository.getById(req.user.id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      const requiresPassword =
        input.username !== undefined || input.email !== undefined || input.phone !== undefined;
      if (requiresPassword) {
        if (!input.currentPassword) {
          throw new AppError(400, 'Current password is required');
        }

        const matches = await verifyPassword(input.currentPassword, user.passwordHash);
        if (!matches) {
          throw new AppError(401, 'Invalid credentials');
        }
      }

      const updates: UpdateUserDto = {};
      if (input.username !== undefined) updates.username = input.username;
      if (input.email !== undefined) updates.email = input.email;
      if (input.phone !== undefined) updates.phone = input.phone;
      if (input.name !== undefined) updates.name = input.name;

      const updated = await this.userRepository.update(user.id, updates);

      res.status(200).json({
        id: updated.id,
        username: updated.username,
        email: updated.email ?? null,
        phone: updated.phone ?? null,
        name: updated.name,
        role: updated.role,
        status: updated.status,
      });
    } catch (error) {
      next(error);
    }
  };
}
