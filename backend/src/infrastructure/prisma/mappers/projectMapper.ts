/**
 * Project Mapper
 */

import { Project, ProjectStatus } from '@domain/models';
import type { CreateProjectDto } from '@domain/types';

interface PrismaProject {
  id: string;
  title: string;
  description: string | null;
  status: string;
  nextActionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const projectMapper = {
  toDomain(prismaProject: unknown): Project {
    const project = prismaProject as PrismaProject;
    return new Project(
      project.id,
      project.title,
      project.description ?? '', // Convert null to empty string
      project.status as ProjectStatus,
      project.nextActionId,
      project.createdAt,
      project.updatedAt
    );
  },

  toPrisma(dto: CreateProjectDto): unknown {
    const result: Record<string, unknown> = {
      title: dto.title,
    };

    if (dto.description !== undefined) {
      result.description = dto.description;
    }

    if (dto.status !== undefined) {
      result.status = dto.status;
    }

    return result;
  },
};
