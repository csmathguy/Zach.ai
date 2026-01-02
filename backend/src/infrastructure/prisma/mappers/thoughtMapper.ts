/**
 * Thought Mapper
 */

import { Prisma } from '@prisma/client';
import { Thought } from '@domain/models';
import type { CreateThoughtDto } from '@domain/types';

export const thoughtMapper = {
  toDomain(prismaThought: Prisma.ThoughtGetPayload<object>): Thought {
    return new Thought(
      prismaThought.id,
      prismaThought.text,
      prismaThought.userId,
      prismaThought.timestamp,
      prismaThought.source,
      prismaThought.processedState
    );
  },

  toPrisma(dto: CreateThoughtDto): Prisma.ThoughtCreateInput {
    const input: Prisma.ThoughtCreateInput = {
      text: dto.text,
      user: {
        connect: { id: dto.userId },
      },
    };

    if (dto.source !== undefined) {
      input.source = dto.source;
    }

    if (dto.timestamp !== undefined) {
      input.timestamp = dto.timestamp;
    }

    return input;
  },
};
