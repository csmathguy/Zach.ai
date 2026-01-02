/**
 * User Mapper
 *
 * Converts between Prisma User types and Domain User models.
 */

import { Prisma } from '@prisma/client';
import { User } from '@domain/models';
import type { CreateUserDto } from '@domain/types';

export const userMapper = {
  /**
   * Convert Prisma User to Domain User
   */
  toDomain(prismaUser: Prisma.UserGetPayload<object>): User {
    return new User(prismaUser.id, prismaUser.email, prismaUser.name, prismaUser.createdAt);
  },

  /**
   * Convert CreateUserDto to Prisma input format
   */
  toPrisma(dto: CreateUserDto): Prisma.UserCreateInput {
    return {
      email: dto.email,
      name: dto.name,
    };
  },
};
