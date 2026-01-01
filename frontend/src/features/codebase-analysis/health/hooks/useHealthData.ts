import { useState, useEffect } from 'react';

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

interface HealthData {
  health: HealthStatus | null;
  metrics: MetricsData | null;
  loading: boolean;
  error: string | null;
}

const isDevEnv =
  typeof window !== 'undefined' && window.location && window.location.port === '5173';
const API_BASE = isDevEnv ? 'http://localhost:3000' : '';

export function useHealthData(autoRefresh = false, intervalMs = 30000): HealthData {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [healthResponse, metricsResponse] = await Promise.all([
        fetch(`${API_BASE}/health`),
        fetch(`${API_BASE}/api/metrics`),
      ]);

      if (!healthResponse.ok || !metricsResponse.ok) {
        throw new Error('Failed to fetch health data');
      }

      const healthData: HealthStatus = await healthResponse.json();
      const metricsData: MetricsData = await metricsResponse.json();

      setHealth(healthData);
      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, intervalMs);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, intervalMs]);

  return { health, metrics, loading, error };
}
