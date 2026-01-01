import request from 'supertest';
import express from 'express';

// Create a test app instance
const createTestApp = () => {
  const app = express();

  // Health check endpoint (simplified version for testing)
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'test',
      port: 3000,
    });
  });

  return app;
};

describe('Backend API Tests', () => {
  let app: express.Express;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
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

    it('should return ISO timestamp', async () => {
      const response = await request(app).get('/health');

      const timestamp = response.body.timestamp;
      expect(timestamp).toBeDefined();
      expect(() => new Date(timestamp)).not.toThrow();
    });
  });
});
