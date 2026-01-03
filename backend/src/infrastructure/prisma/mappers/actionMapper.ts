/**
 * Action Mapper
 */

import { Prisma } from '@prisma/client';
import { Action, ActionType, ActionStatus } from '@domain/models';
import type { CreateActionDto } from '@domain/types';

export const actionMapper = {
  toDomain(prismaAction: Prisma.ActionGetPayload<object>): Action {
    return new Action(
      prismaAction.id,
      prismaAction.title,
      prismaAction.description ?? '', // Convert null to empty string
      prismaAction.actionType as ActionType,
      prismaAction.status as ActionStatus,
      prismaAction.projectId,
      prismaAction.createdAt,
      prismaAction.updatedAt
    );
  },

  toPrisma(dto: CreateActionDto): Prisma.ActionCreateInput {
    const input: Prisma.ActionCreateInput = {
      title: dto.title,
      actionType: dto.actionType,
    };

    if (dto.description !== undefined) {
      input.description = dto.description;
    }

    if (dto.status !== undefined) {
      input.status = dto.status;
    }

    if (dto.projectId) {
      input.project = { connect: { id: dto.projectId } };
    }

    return input;
  },
};
