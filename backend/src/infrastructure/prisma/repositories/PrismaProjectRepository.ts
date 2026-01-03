import { PrismaClient, Prisma } from '@prisma/client';
import { Project } from '@domain/models/Project';
import { IProjectRepository } from '@domain/repositories/IProjectRepository';
import { CreateProjectDto, UpdateProjectDto } from '@domain/types';
import { projectMapper } from '../mappers';

/**
 * Prisma implementation of Project repository
 */
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateProjectDto): Promise<Project> {
    const prismaInput = projectMapper.toPrisma(data);
    const prismaProject = await this.prisma.project.create({
      data: prismaInput,
    });
    return projectMapper.toDomain(prismaProject);
  }

  async findById(id: string): Promise<Project | null> {
    const prismaProject = await this.prisma.project.findUnique({
      where: { id },
    });

    return prismaProject ? projectMapper.toDomain(prismaProject) : null;
  }

  async findAll(): Promise<Project[]> {
    const prismaProjects = await this.prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return prismaProjects.map((p) => projectMapper.toDomain(p));
  }

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    // Build update input manually since UpdateProjectDto has all optional fields
    const updateData: Prisma.ProjectUpdateInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: updateData,
    });

    return projectMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.project.delete({
        where: { id },
      });
    } catch {
      // Idempotent: silently succeed if already deleted
    }
  }

  async linkThought(projectId: string, thoughtId: string): Promise<void> {
    await this.prisma.projectThought.upsert({
      where: {
        projectId_thoughtId: {
          projectId,
          thoughtId,
        },
      },
      create: {
        projectId,
        thoughtId,
      },
      update: {}, // Already exists, nothing to update
    });
  }

  async unlinkThought(projectId: string, thoughtId: string): Promise<void> {
    try {
      await this.prisma.projectThought.delete({
        where: {
          projectId_thoughtId: {
            projectId,
            thoughtId,
          },
        },
      });
    } catch {
      // Idempotent: silently succeed if link doesn't exist
    }
  }

  async setNextAction(projectId: string, actionId: string | null): Promise<void> {
    if (actionId !== null) {
      const action = await this.prisma.action.findUnique({
        where: { id: actionId },
        select: { projectId: true },
      });

      if (!action) {
        throw new Error(`Action with id ${actionId} not found`);
      }

      if (action.projectId !== projectId) {
        throw new Error('Action does not belong to the specified project');
      }
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: { nextActionId: actionId },
    });
  }
}
