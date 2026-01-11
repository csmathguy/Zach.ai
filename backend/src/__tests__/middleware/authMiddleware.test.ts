import { describe, expect, it, jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@/errors/AppError';
import { createAuthMiddleware } from '@/middleware/authMiddleware';
import type { IUserRepository } from '@domain/repositories/IUserRepository';
import type { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { User } from '@domain/models';
import type { UserProps } from '@domain/models';

const buildUserProps = (overrides: Partial<UserProps> = {}): UserProps => ({
  id: '11111111-1111-1111-1111-111111111111',
  username: 'user',
  email: 'user@example.com',
  name: 'User',
  passwordHash: 'hash',
  role: 'USER',
  status: 'ACTIVE',
  failedLoginCount: 0,
  lockoutUntil: null,
  lastLoginAt: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
});

const buildUser = (overrides: Partial<UserProps> = {}): User => new User(buildUserProps(overrides));

const createRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    headers: {},
    ...overrides,
  }) as Request;

const createResponse = (): Response => ({}) as Response;

const createUserRepository = (overrides: Partial<IUserRepository> = {}): IUserRepository => ({
  create: jest.fn<IUserRepository['create']>(),
  getById: jest.fn<IUserRepository['getById']>(),
  getByUsername: jest.fn<IUserRepository['getByUsername']>(),
  getByEmail: jest.fn<IUserRepository['getByEmail']>(),
  listAll: jest.fn<IUserRepository['listAll']>(),
  update: jest.fn<IUserRepository['update']>(),
  delete: jest.fn<IUserRepository['delete']>(),
  ...overrides,
});

const createSessionRepository = (
  overrides: Partial<ISessionRepository> = {}
): ISessionRepository => ({
  create: jest.fn<ISessionRepository['create']>(),
  getById: jest.fn<ISessionRepository['getById']>(),
  deleteById: jest.fn<ISessionRepository['deleteById']>(),
  deleteByUserId: jest.fn<ISessionRepository['deleteByUserId']>(),
  deleteExpired: jest.fn<ISessionRepository['deleteExpired']>(),
  ...overrides,
});

describe('auth middleware', () => {
  it('rejects when no session is present', async () => {
    const userRepo = createUserRepository();
    const sessionRepo = createSessionRepository();

    const { requireAuth } = createAuthMiddleware({
      userRepository: userRepo,
      sessionRepository: sessionRepo,
    });

    const req = createRequest();
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('attaches user on valid session', async () => {
    const user = buildUser();
    const userRepo = createUserRepository({
      getById: jest.fn<IUserRepository['getById']>().mockResolvedValue(user),
    });
    const sessionRepo = createSessionRepository({
      getById: jest.fn<ISessionRepository['getById']>().mockResolvedValue({
        id: 'session-1',
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      }),
    });

    const { requireAuth } = createAuthMiddleware({
      userRepository: userRepo,
      sessionRepository: sessionRepo,
    });

    const req = createRequest({
      headers: {
        'x-session-id': 'session-1',
      },
    });
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    await requireAuth(req, res, next);

    expect(req.user?.id).toBe(user.id);
    expect(next).toHaveBeenCalled();
  });

  it('blocks non-admin users', async () => {
    const user = buildUser({ role: 'USER' });
    const userRepo = createUserRepository({
      getById: jest.fn<IUserRepository['getById']>().mockResolvedValue(user),
    });
    const sessionRepo = createSessionRepository({
      getById: jest.fn<ISessionRepository['getById']>().mockResolvedValue({
        id: 'session-1',
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      }),
    });

    const { requireAdmin } = createAuthMiddleware({
      userRepository: userRepo,
      sessionRepository: sessionRepo,
    });

    const req = createRequest({
      headers: {
        'x-session-id': 'session-1',
      },
    });
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    await requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('allows admin users', async () => {
    const user = buildUser({ role: 'ADMIN' });
    const userRepo = createUserRepository({
      getById: jest.fn<IUserRepository['getById']>().mockResolvedValue(user),
    });
    const sessionRepo = createSessionRepository({
      getById: jest.fn<ISessionRepository['getById']>().mockResolvedValue({
        id: 'session-1',
        userId: user.id,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      }),
    });

    const { requireAdmin } = createAuthMiddleware({
      userRepository: userRepo,
      sessionRepository: sessionRepo,
    });

    const req = createRequest({
      headers: {
        'x-session-id': 'session-1',
      },
    });
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    await requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
