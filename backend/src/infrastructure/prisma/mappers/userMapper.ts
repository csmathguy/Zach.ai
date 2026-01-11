/**
 * User Mapper
 *
 * Converts between Prisma User types and Domain User models.
 */

import { Prisma } from '@prisma/client';
import { User } from '@domain/models';
import type { CreateUserDto, UserRole, UserStatus } from '@domain/types';

const parseUserRole = (role: string): UserRole => {
  if (role === 'USER' || role === 'ADMIN') {
    return role;
  }
  throw new Error(`Invalid user role: ${role}`);
};

const parseUserStatus = (status: string): UserStatus => {
  if (status === 'ACTIVE' || status === 'DISABLED' || status === 'LOCKED') {
    return status;
  }
  throw new Error(`Invalid user status: ${status}`);
};

export const userMapper = {
  /**
   * Convert Prisma User to Domain User
   */
  toDomain(prismaUser: Prisma.UserGetPayload<object>): User {
    return new User({
      id: prismaUser.id,
      username: prismaUser.username,
      email: prismaUser.email,
      phone: prismaUser.phone,
      name: prismaUser.name,
      passwordHash: prismaUser.passwordHash,
      role: parseUserRole(prismaUser.role),
      status: parseUserStatus(prismaUser.status),
      failedLoginCount: prismaUser.failedLoginCount,
      lockoutUntil: prismaUser.lockoutUntil,
      lastLoginAt: prismaUser.lastLoginAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  },

  /**
   * Convert CreateUserDto to Prisma input format
   */
  toPrisma(dto: CreateUserDto): Prisma.UserCreateInput {
    return {
      username: dto.username,
      email: dto.email ?? undefined,
      phone: dto.phone === undefined ? undefined : dto.phone,
      name: dto.name,
      passwordHash: dto.passwordHash,
      role: dto.role,
      status: dto.status,
    };
  },
};
