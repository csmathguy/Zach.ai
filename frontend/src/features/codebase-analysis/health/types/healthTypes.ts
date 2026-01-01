export interface HealthStatus {
  status: string;
  timestamp: string;
  env: string;
  port: number;
}

export interface MetricsData {
  uptime: {
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    formatted: string;
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

export interface HealthData {
  health: HealthStatus;
  metrics: MetricsData;
}
