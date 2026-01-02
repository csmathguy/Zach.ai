import { PrismaClient } from '@prisma/client';
import { Thought } from '@domain/models/Thought';
import { CreateThoughtDto } from '@domain/types';
import { IThoughtRepository } from '@domain/repositories/IThoughtRepository';
import { thoughtMapper } from '../mappers/thoughtMapper';

/**
 * PrismaThoughtRepository
 *
 * Implements thought persistence using Prisma ORM.
 * Thoughts are immutable - no update or delete operations.
 */
export class PrismaThoughtRepository implements IThoughtRepository {
  constructor(private prisma: PrismaClient) {}

  async create(dto: CreateThoughtDto): Promise<Thought> {
    const prismaThought = await this.prisma.thought.create({
      data: thoughtMapper.toPrisma(dto),
    });

    return thoughtMapper.toDomain(prismaThought);
  }

  async findById(id: string): Promise<Thought | null> {
    const prismaThought = await this.prisma.thought.findUnique({
      where: { id },
    });

    if (!prismaThought) {
      return null;
    }

    return thoughtMapper.toDomain(prismaThought);
  }

  async findByUser(userId: string): Promise<Thought[]> {
    const prismaThoughts = await this.prisma.thought.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    return prismaThoughts.map((t) => thoughtMapper.toDomain(t));
  }

  async findAll(): Promise<Thought[]> {
    const prismaThoughts = await this.prisma.thought.findMany({
      orderBy: { timestamp: 'desc' },
    });

    return prismaThoughts.map((t) => thoughtMapper.toDomain(t));
  }

  // NO update() method - thoughts are immutable
  // NO delete() method - thoughts are immutable
}
