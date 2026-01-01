import type { FC } from 'react';
import { useHealthData } from './hooks/useHealthData';
import { getViteHotStatus, getViteBuildMode } from './utils/viteHelpers';
import styles from './HealthTab.module.css';

export const HealthTab: FC = () => {
  const { health, metrics, loading, error } = useHealthData(true, 30000);

  if (loading && !health && !metrics) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>⏳ Loading Health Data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>❌ Error Loading Health Data</h2>
          <p>{error}</p>
          <p className={styles.errorHint}>Make sure the backend server is running on port 3000</p>
        </div>
      </div>
    );
  }

  const heapPercent = metrics
    ? Math.round((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100)
    : 0;

  const getStatusColor = () => {
    if (!health) return 'gray';
    if (health.status === 'ok') return '#27ae60';
    return '#e74c3c';
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* System Status Card */}
        <div className={styles.card} style={{ borderColor: getStatusColor() }}>
          <h3 className={styles.cardTitle}>
            <span style={{ color: getStatusColor() }}>●</span> System Status
          </h3>
          <div className={styles.statusBadge}>
            {health?.env === 'production' ? '🟢 Production' : '🟡 Development'}
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Status:</span>
              <span className={styles.value}>{health?.status.toUpperCase()}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Port:</span>
              <span className={styles.value}>{health?.port}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Last Check:</span>
              <span className={styles.value}>
                {health ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Uptime Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>⏱️ Uptime</h3>
          <div className={styles.bigMetric}>{metrics?.uptime.formatted}</div>
          <div className={styles.subMetric}>
            {metrics?.uptime.days}d {metrics?.uptime.hours}h {metrics?.uptime.minutes}m
          </div>
        </div>

        {/* Memory Usage Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>💾 Memory Usage</h3>
          <div className={styles.bigMetric}>{metrics?.memory.heapUsed.toFixed(0)} MB</div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${heapPercent}%`,
                backgroundColor: heapPercent > 80 ? '#e74c3c' : '#667eea',
              }}
            />
          </div>
          <div className={styles.subMetric}>
            {heapPercent}% of {metrics?.memory.heapTotal.toFixed(0)} MB
          </div>
        </div>

        {/* Response Time Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>⚡ Response Time</h3>
          <div className={styles.bigMetric}>{metrics?.responseTime.average.toFixed(2)}ms</div>
          <div className={styles.subMetric}>avg over {metrics?.responseTime.samples} requests</div>
        </div>

        {/* Requests Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>📊 Requests</h3>
          <div className={styles.bigMetric}>{metrics?.requests.total}</div>
          <div className={styles.subMetric}>total handled</div>
        </div>

        {/* Environment Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>⚙️ Environment</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Mode:</span>
              <span className={styles.value}>{health?.env}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Hot Reload:</span>
              <span className={styles.value}>{getViteHotStatus()}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Build:</span>
              <span className={styles.value}>{getViteBuildMode()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
