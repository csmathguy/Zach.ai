/**
 * Action Mapper
 */

import { Action, ActionType, ActionStatus } from '@domain/models';
import type { CreateActionDto } from '@domain/types';

interface PrismaAction {
  id: string;
  title: string;
  description: string | null;
  actionType: string;
  status: string;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const actionMapper = {
  toDomain(prismaAction: unknown): Action {
    const action = prismaAction as PrismaAction;
    return new Action(
      action.id,
      action.title,
      action.description ?? '', // Convert null to empty string
      action.actionType as ActionType,
      action.status as ActionStatus,
      action.projectId,
      action.createdAt,
      action.updatedAt
    );
  },

  toPrisma(dto: CreateActionDto): unknown {
    const result: Record<string, unknown> = {
      title: dto.title,
      actionType: dto.actionType,
    };

    if (dto.description !== undefined) {
      result.description = dto.description;
    }

    if (dto.status !== undefined) {
      result.status = dto.status;
    }

    if (dto.projectId !== undefined) {
      result.projectId = dto.projectId;
    }

    return result;
  },
};
