import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  jest,
} from '@jest/globals';
import express, { Express } from 'express';
import request from 'supertest';
import thoughtsRouter from '@api/routes/thoughts';
import { requestLogger } from '@/middleware/requestLogger';
import { errorHandler } from '@/middleware/errorHandler';
import { prisma } from '@infrastructure/prisma/client';

const MVP_USER_ID = '00000000-0000-4000-8000-000000000001';

const createTestApp = (): Express => {
  const app = express();

  app.use(requestLogger);
  app.use(express.json());
  app.use('/api/thoughts', thoughtsRouter);
  app.use(errorHandler);

  return app;
};

describe('POST /api/thoughts', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    await prisma.thought.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: {
        id: MVP_USER_ID,
        email: 'test@example.com',
        name: 'Test User',
      },
    });
  });

  afterEach(async () => {
    await prisma.thought.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create thought and return 201 with thought JSON', async () => {
    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ text: 'Capture this thought', source: 'text' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      text: 'Capture this thought',
      source: 'text',
      timestamp: expect.any(String),
      processedState: 'UNPROCESSED',
    });

    const persisted = await prisma.thought.findUnique({
      where: { id: response.body.id as string },
    });
    expect(persisted).not.toBeNull();
  });

  it('should return 400 when text is missing', async () => {
    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ source: 'text' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'text',
        }),
      ])
    );
  });

  it('should return 400 when text is empty', async () => {
    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ text: '', source: 'text' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'text',
        }),
      ])
    );
  });

  it('should return 400 when text exceeds max length', async () => {
    const longText = 'a'.repeat(10001);

    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ text: longText, source: 'text' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'text',
        }),
      ])
    );
  });

  it('should return 400 when source is invalid', async () => {
    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ text: 'Valid text', source: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'source',
        }),
      ])
    );
  });

  it('should apply default source when omitted', async () => {
    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ text: 'Default source check' });

    expect(response.status).toBe(201);
    expect(response.body.source).toBe('text');
  });

  it('should return multiple validation errors when input has multiple issues', async () => {
    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ text: '', source: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'text' }),
        expect.objectContaining({ field: 'source' }),
      ])
    );
  });

  it('should return 400 when user does not exist (foreign key violation)', async () => {
    await prisma.user.deleteMany();

    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ text: 'Missing user', source: 'text' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('User not found');
    expect(response.body.details).toEqual(
      expect.objectContaining({
        userId: MVP_USER_ID,
      })
    );
  });

  it('should return 415 when content type is not JSON', async () => {
    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'text/plain')
      .send('plain text');

    expect(response.status).toBe(415);
    expect(response.body).toEqual({
      error: 'Unsupported Media Type',
    });
  });

  it('should preserve special characters in thought text', async () => {
    const specialText = 'Symbols @#$%^&*() and emoji \uD83D\uDE03 and unicode \u00E9';

    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ text: specialText, source: 'text' });

    expect(response.status).toBe(201);
    expect(response.body.text).toBe(specialText);

    const persisted = await prisma.thought.findUnique({
      where: { id: response.body.id as string },
    });
    expect(persisted?.text).toBe(specialText);
  });

  it('should return 500 on database error', async () => {
    const createSpy = jest
      .spyOn(prisma.thought, 'create')
      .mockRejectedValueOnce(new Error('Database unavailable'));

    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ text: 'Trigger db error', source: 'text' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal server error');
    expect(response.body.requestId).toEqual(expect.any(String));
    expect(response.body).not.toHaveProperty('stack');

    createSpy.mockRestore();
  });

  it('should include request ID in response headers', async () => {
    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ text: 'Header check', source: 'text' });

    expect(response.headers['x-request-id']).toEqual(expect.any(String));
  });

  it('should respond in under 100ms for valid requests', async () => {
    const start = Date.now();

    const response = await request(app)
      .post('/api/thoughts')
      .set('Content-Type', 'application/json')
      .send({ text: 'Performance check', source: 'text' });

    const duration = Date.now() - start;

    expect(response.status).toBe(201);
    expect(duration).toBeLessThan(100);
  });
});

describe('GET /api/thoughts', () => {
  let app: Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    await prisma.thought.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: {
        id: MVP_USER_ID,
        email: 'test@example.com',
        name: 'Test User',
      },
    });
  });

  afterEach(async () => {
    await prisma.thought.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return empty array when no thoughts exist', async () => {
    const response = await request(app).get('/api/thoughts');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return thoughts ordered by timestamp DESC', async () => {
    await prisma.thought.createMany({
      data: [
        {
          text: 'First idea',
          source: 'text',
          timestamp: new Date('2026-01-01T10:00:00Z'),
          userId: MVP_USER_ID,
        },
        {
          text: 'Second idea',
          source: 'text',
          timestamp: new Date('2026-01-01T12:00:00Z'),
          userId: MVP_USER_ID,
        },
        {
          text: 'Third idea',
          source: 'voice',
          timestamp: new Date('2026-01-01T11:00:00Z'),
          userId: MVP_USER_ID,
        },
      ],
    });

    const response = await request(app).get('/api/thoughts');

    expect(response.status).toBe(200);
    expect(response.body.map((thought: { text: string }) => thought.text)).toEqual([
      'Second idea',
      'Third idea',
      'First idea',
    ]);
  });

  it('should return thoughts with response shape matching POST /api/thoughts', async () => {
    await prisma.thought.create({
      data: {
        text: 'Idea one',
        source: 'text',
        userId: MVP_USER_ID,
      },
    });

    const response = await request(app).get('/api/thoughts');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: expect.any(String),
        text: 'Idea one',
        source: 'text',
        timestamp: expect.any(String),
        processedState: 'UNPROCESSED',
      },
    ]);
  });

  it('should return 500 on database error', async () => {
    const findSpy = jest
      .spyOn(prisma.thought, 'findMany')
      .mockRejectedValueOnce(new Error('Database unavailable'));

    const response = await request(app).get('/api/thoughts');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal server error');
    expect(response.body.requestId).toEqual(expect.any(String));
    expect(response.body).not.toHaveProperty('stack');

    findSpy.mockRestore();
  });
});
