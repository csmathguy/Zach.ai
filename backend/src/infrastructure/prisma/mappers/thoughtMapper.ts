/**
 * Thought Mapper
 */

import { Thought } from '@domain/models';
import type { CreateThoughtDto } from '@domain/types';

interface PrismaThought {
  id: string;
  text: string;
  source: string;
  timestamp: Date;
  processedState: string;
  userId: string;
}

export const thoughtMapper = {
  toDomain(prismaThought: unknown): Thought {
    const thought = prismaThought as PrismaThought;
    return new Thought(
      thought.id,
      thought.text,
      thought.userId,
      thought.timestamp,
      thought.source,
      thought.processedState
    );
  },

  toPrisma(dto: CreateThoughtDto): unknown {
    const result: Record<string, unknown> = {
      text: dto.text,
      userId: dto.userId,
    };

    if (dto.source !== undefined) {
      result.source = dto.source;
    }

    if (dto.timestamp !== undefined) {
      result.timestamp = dto.timestamp;
    }

    return result;
  },
};
