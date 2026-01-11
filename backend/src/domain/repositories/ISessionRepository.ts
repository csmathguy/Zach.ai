import type { Session } from '@domain/types/session.types';

export interface ISessionRepository {
  create(session: Session): Promise<Session>;
  getById(id: string): Promise<Session | null>;
  deleteById(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpired(now: Date): Promise<number>;
}
