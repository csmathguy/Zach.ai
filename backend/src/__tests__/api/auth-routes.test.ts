import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import crypto from 'crypto';
import { prisma } from '@infrastructure/prisma/client';
import { requestLogger } from '@/middleware/requestLogger';
import { errorHandler } from '@/middleware/errorHandler';
import { authRouter, adminRouter } from '@api/routes';
import { hashPassword, verifyPassword } from '@/utils/passwordHasher';

const createTestApp = (): Express => {
  const app = express();
  app.use(requestLogger);
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use(errorHandler);
  return app;
};

const buildUser = async (
  overrides: Partial<{
    username: string;
    email: string | null;
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

describe('Auth + Admin API routes', () => {
  let app: Express;

  beforeEach(async () => {
    app = createTestApp();
    await prisma.passwordResetToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  it('login success returns session cookie', async () => {
    const password = 'ValidPass12!';
    const user = await buildUser({ username: 'zach', password });

    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ identifier: user.username, password });

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain('session_id=');
  });

  it('login failure increments lockout', async () => {
    const user = await buildUser({ username: 'locked-user', password: 'ValidPass12!' });

    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ identifier: user.username, password: 'WrongPass12!' });

    expect(response.status).toBe(401);

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.failedLoginCount).toBe(1);
  });

  it('logout clears session', async () => {
    const user = await buildUser({ role: 'USER' });
    const session = await buildSession(user.id);

    const response = await request(app).post('/api/auth/logout').set('x-session-id', session.id);

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie'][0]).toContain('session_id=');

    const deleted = await prisma.session.findUnique({ where: { id: session.id } });
    expect(deleted).toBeNull();
  });

  it('reset token request accepted', async () => {
    const user = await buildUser({ username: 'reset-user' });

    const response = await request(app)
      .post('/api/auth/reset/request')
      .set('Content-Type', 'application/json')
      .send({ identifier: user.username });

    expect(response.status).toBe(200);
  });

  it('reset token confirm sets new password', async () => {
    const admin = await buildUser({ role: 'ADMIN', username: 'admin-user' });
    const session = await buildSession(admin.id);
    const target = await buildUser({ username: 'target-user' });

    const resetResponse = await request(app)
      .post(`/api/admin/users/${target.id}/reset`)
      .set('x-session-id', session.id);

    const resetToken = resetResponse.body.resetToken as string;
    expect(resetResponse.status).toBe(200);
    expect(resetToken).toBeDefined();

    const confirmResponse = await request(app)
      .post('/api/auth/reset/confirm')
      .set('Content-Type', 'application/json')
      .send({ token: resetToken, newPassword: 'ValidPass12!' });

    expect(confirmResponse.status).toBe(200);

    const updated = await prisma.user.findUnique({ where: { id: target.id } });
    expect(updated).not.toBeNull();
    if (updated) {
      const matches = await verifyPassword('ValidPass12!', updated.passwordHash);
      expect(matches).toBe(true);
    }

    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { userId: target.id, usedAt: { not: null } },
    });
    expect(tokenRecord).not.toBeNull();
  });

  it('admin list users requires admin role', async () => {
    const user = await buildUser({ role: 'USER' });
    const session = await buildSession(user.id);

    const response = await request(app).get('/api/admin/users').set('x-session-id', session.id);

    expect(response.status).toBe(403);
  });

  it('admin create user requires auth', async () => {
    const response = await request(app)
      .post('/api/admin/users')
      .set('Content-Type', 'application/json')
      .send({
        username: 'new-user',
        name: 'New User',
        role: 'USER',
      });

    expect(response.status).toBe(401);
  });

  it('admin create user issues reset token', async () => {
    const admin = await buildUser({ role: 'ADMIN', username: 'admin-creator' });
    const session = await buildSession(admin.id);

    const response = await request(app)
      .post('/api/admin/users')
      .set('Content-Type', 'application/json')
      .set('x-session-id', session.id)
      .send({
        username: 'new-user',
        name: 'New User',
        role: 'USER',
        email: 'new-user@example.com',
      });

    expect(response.status).toBe(201);
    expect(response.body.resetToken).toBeDefined();
    expect(response.body.userId).toBeDefined();

    const created = await prisma.user.findUnique({ where: { id: response.body.userId } });
    expect(created).not.toBeNull();

    const tokens = await prisma.passwordResetToken.findMany({
      where: { userId: response.body.userId },
    });
    expect(tokens.length).toBe(1);
  });

  it('admin reset token issuance', async () => {
    const admin = await buildUser({ role: 'ADMIN', username: 'admin-reset' });
    const session = await buildSession(admin.id);
    const target = await buildUser({ username: 'target-reset' });

    const response = await request(app)
      .post(`/api/admin/users/${target.id}/reset`)
      .set('x-session-id', session.id);

    expect(response.status).toBe(200);
    expect(response.body.resetToken).toBeDefined();

    const tokens = await prisma.passwordResetToken.findMany({ where: { userId: target.id } });
    expect(tokens.length).toBe(1);
  });

  it('admin reset token returns 404 for missing user', async () => {
    const admin = await buildUser({ role: 'ADMIN', username: 'admin-missing' });
    const session = await buildSession(admin.id);

    const response = await request(app)
      .post('/api/admin/users/00000000-0000-0000-0000-000000000000/reset')
      .set('x-session-id', session.id);

    expect(response.status).toBe(404);
  });
});
