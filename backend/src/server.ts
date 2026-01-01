import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Metrics tracking
const startTime = Date.now();
const requestTimes: number[] = [];
const MAX_REQUEST_SAMPLES = 100;

// Enable CORS for development (frontend on different port)
if (NODE_ENV === 'development') {
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  );
}

// Middleware to track response times
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestTimes.push(duration);
    if (requestTimes.length > MAX_REQUEST_SAMPLES) {
      requestTimes.shift();
    }
  });
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    port: PORT,
  });
});

// Dashboard metrics endpoint
app.get('/api/metrics', (_req, res) => {
  const uptime = Date.now() - startTime;
  const uptimeSeconds = Math.floor(uptime / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const uptimeDays = Math.floor(uptimeHours / 24);

  const avgResponseTime =
    requestTimes.length > 0
      ? Math.round(requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length)
      : 0;

  const memoryUsage = process.memoryUsage();
  const memoryMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
  };

  res.json({
    uptime: {
      milliseconds: uptime,
      seconds: uptimeSeconds,
      minutes: uptimeMinutes,
      hours: uptimeHours,
      days: uptimeDays,
      formatted: `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`,
    },
    responseTime: {
      average: avgResponseTime,
      samples: requestTimes.length,
      recent: requestTimes.slice(-10),
    },
    memory: memoryMB,
    requests: {
      total: requestTimes.length,
    },
    timestamp: new Date().toISOString(),
  });
});

// In production, serve built frontend. Prefer snapshot dir if available/env-provided.
if (NODE_ENV === 'production') {
  const envDir = process.env.FRONTEND_DIR;
  const snapshotDir = path.resolve(__dirname, '../../deploy/current/frontend/dist');
  const repoDistDir = path.resolve(__dirname, '../../frontend/dist');

  const frontendDist =
    envDir && fs.existsSync(envDir)
      ? envDir
      : fs.existsSync(snapshotDir)
        ? snapshotDir
        : repoDistDir;

  console.log(`[backend] static dir: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[backend] listening on http://localhost:${PORT} (${NODE_ENV})`);
});
