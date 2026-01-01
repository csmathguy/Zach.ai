import '@testing-library/jest-dom/jest-globals';
import { beforeAll, afterAll, jest } from '@jest/globals';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for jsdom (needed for react-router-dom)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Suppress console.info and console.log during tests to reduce noise
global.console.info = jest.fn();
global.console.log = jest.fn();

// Mock fetch for jsdom environment
global.fetch = jest.fn<typeof fetch>((url: string | URL | Request) => {
  const urlString = typeof url === 'string' ? url : url.toString();

  // Mock health endpoint
  if (urlString.includes('/health')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'ok',
        timestamp: Date.now(),
      }),
    } as Response);
  }

  // Mock metrics endpoint
  if (urlString.includes('/api/metrics')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        uptime: 123456,
        memory: {
          rss: 75000000,
          heapTotal: 100000000,
          heapUsed: 50000000,
          external: 5000000,
        },
        responseTime: 15,
        requests: {
          total: 1234,
        },
        timestamp: new Date().toISOString(),
      }),
    } as Response);
  }

  // Default mock
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({}),
  } as Response);
}) as typeof fetch;

// Global test setup
beforeAll(() => {
  // Setup before all tests run
});

afterAll(() => {
  // Cleanup after all tests complete
});
