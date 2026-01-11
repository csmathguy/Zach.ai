import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import crypto from 'crypto';
import { prisma } from '@infrastructure/prisma/client';
import { requestLogger } from '@/middleware/requestLogger';
import { errorHandler } from '@/middleware/errorHandler';
import { accountRouter } from '@api/routes';
import { hashPassword } from '@/utils/passwordHasher';

const createTestApp = (): Express => {
  const app = express();
  app.use(requestLogger);
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/me', accountRouter);
  app.use(errorHandler);
  return app;
};

const buildUser = async (
  overrides: Partial<{
    username: string;
    email: string | null;
    phone: string | null;
    name: string;
    role: 'USER' | 'ADMIN';
    status: 'ACTIVE' | 'DISABLED' | 'LOCKED';
    password: string;
  }> = {}
) => {
  const password = overrides.password ?? 'ValidPass12!';
  const passwordHash = await hashPassword(password);

  return prisma.user.create({
    data: {
      username: overrides.username ?? `user-${crypto.randomUUID()}`,
      email: overrides.email ?? null,
      phone: overrides.phone ?? null,
      name: overrides.name ?? 'Test User',
      passwordHash,
      role: overrides.role ?? 'USER',
      status: overrides.status ?? 'ACTIVE',
      failedLoginCount: 0,
      lockoutUntil: null,
      lastLoginAt: null,
    },
  });
};

const buildSession = async (userId: string) =>
  prisma.session.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      createdAt: new Date(),
    },
  });

describe('Account profile routes', () => {
  let app: Express;

  beforeEach(async () => {
    app = createTestApp();
    await prisma.passwordResetToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  it('requires auth to view profile', async () => {
    const response = await request(app).get('/api/me');
    expect(response.status).toBe(401);
  });

  it('returns the current user profile', async () => {
    const user = await buildUser({ username: 'profile-user', email: 'user@example.com' });
    const session = await buildSession(user.id);

    const response = await request(app).get('/api/me').set('x-session-id', session.id);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: null,
      name: user.name,
      role: user.role,
      status: user.status,
    });
  });

  it('updates name without requiring current password', async () => {
    const user = await buildUser({ name: 'Old Name' });
    const session = await buildSession(user.id);

    const response = await request(app)
      .patch('/api/me')
      .set('Content-Type', 'application/json')
      .set('x-session-id', session.id)
      .send({ name: 'New Name' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('New Name');
  });

  it('requires current password for email changes', async () => {
    const user = await buildUser({ email: 'old@example.com' });
    const session = await buildSession(user.id);

    const response = await request(app)
      .patch('/api/me')
      .set('Content-Type', 'application/json')
      .set('x-session-id', session.id)
      .send({ email: 'new@example.com' });

    expect(response.status).toBe(400);
  });

  it('rejects invalid current password', async () => {
    const user = await buildUser({ email: 'old@example.com', password: 'ValidPass12!' });
    const session = await buildSession(user.id);

    const response = await request(app)
      .patch('/api/me')
      .set('Content-Type', 'application/json')
      .set('x-session-id', session.id)
      .send({ email: 'new@example.com', currentPassword: 'WrongPass12!' });

    expect(response.status).toBe(401);
  });

  it('rejects role changes', async () => {
    const user = await buildUser({ role: 'USER' });
    const session = await buildSession(user.id);

    const response = await request(app)
      .patch('/api/me')
      .set('Content-Type', 'application/json')
      .set('x-session-id', session.id)
      .send({ role: 'ADMIN' });

    expect(response.status).toBe(400);
  });
});
