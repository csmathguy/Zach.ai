import { PrismaClient, Prisma } from '@prisma/client';
import { Action, ActionType, ActionStatus } from '@domain/models/Action';
import { CreateActionDto, UpdateActionDto } from '@domain/types';
import { IActionRepository } from '@domain/repositories';
import { actionMapper } from '../mappers';

/**
 * Prisma implementation of action repository.
 * Supports inbox actions (null projectId) and project-specific actions.
 */
export class PrismaActionRepository implements IActionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateActionDto): Promise<Action> {
    const prismaAction = await this.prisma.action.create({
      data: actionMapper.toPrisma(data),
    });

    return actionMapper.toDomain(prismaAction);
  }

  async findById(id: string): Promise<Action | null> {
    const prismaAction = await this.prisma.action.findUnique({
      where: { id },
    });

    return prismaAction ? actionMapper.toDomain(prismaAction) : null;
  }

  async findByProject(projectId: string): Promise<Action[]> {
    const prismaActions = await this.prisma.action.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    return prismaActions.map((pa) => actionMapper.toDomain(pa));
  }

  async findByType(actionType: ActionType): Promise<Action[]> {
    const prismaActions = await this.prisma.action.findMany({
      where: { actionType: actionType.toString() },
    });

    return prismaActions.map((pa) => actionMapper.toDomain(pa));
  }

  async findByStatus(status: ActionStatus): Promise<Action[]> {
    const prismaActions = await this.prisma.action.findMany({
      where: { status: status.toString() },
    });

    return prismaActions.map((pa) => actionMapper.toDomain(pa));
  }

  async findInbox(): Promise<Action[]> {
    const prismaActions = await this.prisma.action.findMany({
      where: { projectId: null },
    });

    return prismaActions.map((pa) => actionMapper.toDomain(pa));
  }

  async findAll(): Promise<Action[]> {
    const prismaActions = await this.prisma.action.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return prismaActions.map((pa) => actionMapper.toDomain(pa));
  }

  async update(id: string, data: UpdateActionDto): Promise<Action> {
    const updateData: Prisma.ActionUpdateInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.actionType !== undefined) {
      updateData.actionType = data.actionType;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.projectId !== undefined) {
      if (data.projectId === null) {
        updateData.project = { disconnect: true };
      } else {
        updateData.project = { connect: { id: data.projectId } };
      }
    }

    const updated = await this.prisma.action.update({
      where: { id },
      data: updateData,
    });

    return actionMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    // Idempotent delete
    await this.prisma.action.deleteMany({
      where: { id },
    });
  }

  async assignUser(actionId: string, userId: string): Promise<void> {
    // Idempotent upsert for many-to-many
    await this.prisma.actionAssignee.upsert({
      where: {
        actionId_userId: {
          actionId,
          userId,
        },
      },
      create: {
        actionId,
        userId,
      },
      update: {}, // No-op if already exists
    });
  }

  async unassignUser(actionId: string, userId: string): Promise<void> {
    // Idempotent delete for many-to-many
    await this.prisma.actionAssignee.deleteMany({
      where: {
        actionId,
        userId,
      },
    });
  }

  async linkThought(actionId: string, thoughtId: string): Promise<void> {
    // Idempotent upsert for many-to-many
    await this.prisma.actionThought.upsert({
      where: {
        actionId_thoughtId: {
          actionId,
          thoughtId,
        },
      },
      create: {
        actionId,
        thoughtId,
      },
      update: {}, // No-op if already exists
    });
  }

  async unlinkThought(actionId: string, thoughtId: string): Promise<void> {
    // Idempotent delete for many-to-many
    await this.prisma.actionThought.deleteMany({
      where: {
        actionId,
        thoughtId,
      },
    });
  }
}
