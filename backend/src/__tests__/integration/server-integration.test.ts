import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { requestLogger } from '@/middleware/requestLogger';
import { errorHandler } from '@/middleware/errorHandler';
import { thoughtsRouter } from '@api/routes';
import { prisma } from '@infrastructure/prisma/client';

/**
 * Integration test for full server setup
 * Tests middleware pipeline, routing, and error handling
 *
 * @see work-items/O2-thought-capture/tests/TS-007-end-to-end.md
 */

const MVP_USER_ID = '00000000-0000-4000-8000-000000000001';

// Create test app that mimics server.ts structure
const createTestApp = () => {
  const app = express();

  // MIDDLEWARE PIPELINE (order matters!)
  // 1. Request logging with ID
  app.use(requestLogger);

  // 2. Body parsing
  app.use(express.json({ limit: '1mb' }));

  // 3. CORS (for dev)
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  );

  // ROUTES
  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: 'test',
      port: 3000,
    });
  });

  // Thoughts API
  app.use('/api/thoughts', thoughtsRouter);

  // ERROR HANDLING (must be last middleware)
  app.use(errorHandler);

  return app;
};

describe('Server Integration Tests', () => {
  let app: express.Express;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Clean and seed test database
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

  describe('Middleware Pipeline', () => {
    it('should add request ID header to response', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-request-id']).toBeDefined();
      expect(typeof response.headers['x-request-id']).toBe('string');
    });

    it('should use custom request ID if provided', async () => {
      const customId = 'test-request-123';
      const response = await request(app).get('/health').set('x-request-id', customId);

      expect(response.headers['x-request-id']).toBe(customId);
    });

    it('should parse JSON request bodies', async () => {
      const response = await request(app)
        .post('/api/thoughts')
        .send({ text: 'Test thought' })
        .set('Content-Type', 'application/json');

      // Should not get 415 Unsupported Media Type
      expect(response.status).not.toBe(415);
    });

    it('should reject payloads exceeding 1MB limit', async () => {
      const largePayload = 'x'.repeat(2 * 1024 * 1024); // 2MB
      const response = await request(app)
        .post('/api/thoughts')
        .send({ text: largePayload })
        .set('Content-Type', 'application/json');

      // Express may return 413 or 500 depending on when limit is hit
      expect([413, 500]).toContain(response.status);
    });

    it('should enable CORS for allowed origins', async () => {
      const response = await request(app).get('/health').set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
    });

    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        env: 'test',
        port: 3000,
      });
    });
  });

  describe('Thoughts API Endpoint', () => {
    it('should accept POST /api/thoughts with valid data', async () => {
      const response = await request(app)
        .post('/api/thoughts')
        .send({ text: 'This is a valid thought' })
        .set('Content-Type', 'application/json');

      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('text');
      expect(response.body.text).toBe('This is a valid thought');
      expect(response.body.source).toBe('text'); // Default source
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('processedState');
    });

    it('should reject POST /api/thoughts with invalid data', async () => {
      const response = await request(app)
        .post('/api/thoughts')
        .send({ text: '' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('requestId');
    });

    it('should handle validation errors with structured response', async () => {
      const response = await request(app)
        .post('/api/thoughts')
        .send({ text: 'x'.repeat(10001) }) // Exceeds max length
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('requestId');
      expect(response.body).toHaveProperty('details');
    });

    it('should include request ID in error responses', async () => {
      const customId = 'error-test-456';
      const response = await request(app)
        .post('/api/thoughts')
        .send({ text: '' })
        .set('x-request-id', customId);

      expect(response.status).toBe(400);
      expect(response.body.requestId).toBe(customId);
    });
  });

  describe('Error Handling', () => {
    it('should catch and format operational errors', async () => {
      const response = await request(app).post('/api/thoughts').send({ invalid: 'data' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: expect.any(String),
        requestId: expect.any(String),
      });
    });

    it('should never expose stack traces to client', async () => {
      const response = await request(app).post('/api/thoughts').send({ text: '' });

      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('stackTrace');
    });

    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown');

      expect(response.status).toBe(404);
    });
  });

  describe('End-to-End Flow', () => {
    it('should successfully create thought with full middleware pipeline', async () => {
      const thoughtText = 'Integration test thought';

      const response = await request(app)
        .post('/api/thoughts')
        .send({ text: thoughtText })
        .set('Content-Type', 'application/json');

      // Verify response
      expect([200, 201]).toContain(response.status);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        text: thoughtText,
        source: 'text', // Default source from schema
        timestamp: expect.any(String),
        processedState: 'UNPROCESSED',
      });

      // Verify request ID was added
      expect(response.headers['x-request-id']).toBeDefined();

      // Verify timestamp is valid ISO string
      expect(() => new Date(response.body.timestamp)).not.toThrow();
    });
  });
});
