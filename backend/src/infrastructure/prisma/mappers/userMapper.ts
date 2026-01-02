/**
 * User Mapper
 *
 * Converts between Prisma User types and Domain User models.
 */

import { User } from '@domain/models';
import type { CreateUserDto } from '@domain/types';

interface PrismaUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export const userMapper = {
  /**
   * Convert Prisma User to Domain User
   */
  toDomain(prismaUser: unknown): User {
    const user = prismaUser as PrismaUser;
    return new User(user.id, user.email, user.name, user.createdAt);
  },

  /**
   * Convert CreateUserDto to Prisma input format
   */
  toPrisma(dto: CreateUserDto): unknown {
    return {
      email: dto.email,
      name: dto.name,
    };
  },
};
