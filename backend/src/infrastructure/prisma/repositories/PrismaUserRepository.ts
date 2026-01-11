import { PrismaClient } from '@prisma/client';
import { User } from '@domain/models/User';
import { CreateUserDto, UpdateUserDto } from '@domain/types';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { userMapper } from '@infrastructure/prisma/mappers';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserDto): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: userMapper.toPrisma(data),
    });
    return userMapper.toDomain(prismaUser);
  }

  async getById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { id } });
    return prismaUser ? userMapper.toDomain(prismaUser) : null;
  }

  async getByUsername(username: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { username } });
    return prismaUser ? userMapper.toDomain(prismaUser) : null;
  }

  async getByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { email } });
    return prismaUser ? userMapper.toDomain(prismaUser) : null;
  }

  async listAll(): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany();
    return prismaUsers.map((u) => userMapper.toDomain(u));
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    // Build update data object, only including fields that are defined
    const updateData: Record<string, unknown> = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
    if (data.failedLoginCount !== undefined) updateData.failedLoginCount = data.failedLoginCount;
    if (data.lockoutUntil !== undefined) updateData.lockoutUntil = data.lockoutUntil;
    if (data.lastLoginAt !== undefined) updateData.lastLoginAt = data.lastLoginAt;

    const prismaUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    return userMapper.toDomain(prismaUser);
  }

  async delete(id: string): Promise<void> {
    // Idempotent delete - use deleteMany to avoid errors if not found
    await this.prisma.user.deleteMany({ where: { id } });
  }
}
