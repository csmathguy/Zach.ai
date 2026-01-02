/**
 * Project Mapper
 */

import { Prisma } from '@prisma/client';
import { Project, ProjectStatus } from '@domain/models';
import type { CreateProjectDto } from '@domain/types';

export const projectMapper = {
  toDomain(prismaProject: Prisma.ProjectGetPayload<object>): Project {
    return new Project(
      prismaProject.id,
      prismaProject.title,
      prismaProject.description ?? '', // Convert null to empty string
      prismaProject.status as ProjectStatus,
      prismaProject.nextActionId,
      prismaProject.createdAt,
      prismaProject.updatedAt
    );
  },

  toPrisma(dto: CreateProjectDto): Prisma.ProjectCreateInput {
    const input: Prisma.ProjectCreateInput = {
      title: dto.title,
    };

    if (dto.description !== undefined) {
      input.description = dto.description;
    }

    if (dto.status !== undefined) {
      input.status = dto.status;
    }

    return input;
  },
};
