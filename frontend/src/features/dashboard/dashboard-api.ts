import { DEBUGGER } from '../../shared/debugger';

interface HealthStatus {
  status: string;
  timestamp: string;
  env: string;
  port: number;
}

interface MetricsData {
  uptime: {
    formatted: string;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  responseTime: {
    average: number;
    samples: number;
    recent: number[];
  };
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  requests: {
    total: number;
  };
  timestamp: string;
}

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
let initialized = false;

async function checkHealth() {
  const healthEl = document.getElementById('health-status');
  if (!healthEl) return;

  try {
    DEBUGGER.info('Checking health at', `${API_BASE}/health`);
    const response = await fetch(`${API_BASE}/health`);
    const data: HealthStatus = await response.json();

    DEBUGGER.log('Health response', data);

    const badge =
      data.env === 'production'
        ? '<span class="status-badge live">🟢 Production</span>'
        : '<span class="status-badge dev">🟡 Development</span>';

    const lastCheck = new Date(data.timestamp).toLocaleString();

    healthEl.innerHTML = `
      <p>✅ Server is running</p>
      ${badge}
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Status:</span>
          <span class="info-value">${data.status.toUpperCase()}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Port:</span>
          <span class="info-value">${data.port}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Last Check:</span>
          <span class="info-value">${lastCheck}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Next Check:</span>
          <span class="info-value">In 5 minutes</span>
        </div>
      </div>
    `;
  } catch (error) {
    DEBUGGER.error('Health check failed', error);
    healthEl.innerHTML = '<p class="error">❌ Server unreachable</p>';
  }
}

async function fetchMetrics() {
  const metricsEl = document.getElementById('dashboard-metrics');
  if (!metricsEl) return;

  try {
    DEBUGGER.info('Fetching metrics from', `${API_BASE}/api/metrics`);
    const response = await fetch(`${API_BASE}/api/metrics`);
    const data: MetricsData = await response.json();

    DEBUGGER.log('Metrics response', data);

    const heapPercent = Math.round((data.memory.heapUsed / data.memory.heapTotal) * 100);

    metricsEl.innerHTML = `
      <div class="metric-group">
        <h3>⏱️ Uptime</h3>
        <div class="metric-value">${data.uptime.formatted}</div>
      </div>
      
      <div class="metric-group">
        <h3>⚡ Response Time</h3>
        <div class="metric-value">${data.responseTime.average}ms</div>
        <div class="metric-detail">avg over ${data.responseTime.samples} requests</div>
      </div>
      
      <div class="metric-group">
        <h3>💾 Memory Usage</h3>
        <div class="metric-value">${data.memory.heapUsed} MB</div>
        <div class="metric-detail">${heapPercent}% of ${data.memory.heapTotal} MB heap</div>
        <div class="metric-detail">RSS: ${data.memory.rss} MB</div>
      </div>
      
      <div class="metric-group">
        <h3>📊 Requests</h3>
        <div class="metric-value">${data.requests.total}</div>
        <div class="metric-detail">total handled</div>
      </div>
    `;
  } catch (error) {
    DEBUGGER.error('Metrics fetch failed', error);
    metricsEl.innerHTML = '<p class="error">❌ Unable to load metrics</p>';
  }
}

function displayEnvironmentInfo() {
  const envEl = document.getElementById('environment-info');
  if (!envEl) return;

  const isDev = import.meta.env.DEV;
  const mode = import.meta.env.MODE;

  envEl.innerHTML = `
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Mode:</span>
        <span class="info-value">${isDev ? '🔧 Development' : '🚀 Production'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Hot Reload:</span>
        <span class="info-value">${isDev ? '✅ Enabled' : '❌ Disabled'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Build:</span>
        <span class="info-value">${mode}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Time:</span>
        <span class="info-value">${new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  `;
}

export function initializeDashboard(): void {
  if (initialized) {
    DEBUGGER.info('Dashboard already initialized');
    return;
  }

  initialized = true;
  DEBUGGER.info('Initializing dashboard');
  checkHealth();
  fetchMetrics();
  displayEnvironmentInfo();

  setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
  setInterval(fetchMetrics, HEALTH_CHECK_INTERVAL);
}
