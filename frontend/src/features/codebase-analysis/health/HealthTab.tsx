import type { FC } from 'react';
import { useHealthData } from './hooks/useHealthData';
import { getViteHotStatus, getViteBuildMode } from './utils/viteHelpers';
import styles from './HealthTab.module.css';

const formatStatus = (status?: string): string => status?.toUpperCase() ?? 'UNKNOWN';

export const HealthTab: FC = () => {
  const { health, metrics, loading, error } = useHealthData(true, 30000);

  if (loading && !health && !metrics) {
    return (
      <div className={styles.container}>
        <div className={styles.loading} role="status" aria-live="polite">
          <h2>⏳ Loading Health Data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error} role="alert">
          <h2>⚠️ Error Loading Health Data</h2>
          <p>{error}</p>
          <p className={styles.errorHint}>Make sure the backend server is running on port 3000</p>
        </div>
      </div>
    );
  }

  const heapPercent = metrics
    ? Math.round((metrics.memory.heapUsed / metrics.memory.heapTotal) * 100)
    : 0;
  const statusVariant = health?.status === 'ok' ? 'ok' : 'alert';
  const envBadge = health?.env === 'production' ? '🟢 Production' : '🛠️ Development';
  const statusIcon = statusVariant === 'ok' ? '❤️' : '⚠️';
  const lastCheck = health ? new Date(health.timestamp).toLocaleTimeString() : 'N/A';

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.card} data-status={statusVariant}>
          <h3 className={styles.cardTitle}>
            <span className={styles.statusIcon} data-variant={statusVariant} aria-hidden="true">
              {statusIcon}
            </span>{' '}
            System Status
          </h3>
          <div className={styles.statusBadge} data-variant={statusVariant}>
            {envBadge}
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Status:</span>
              <span className={styles.value}>{formatStatus(health?.status)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Port:</span>
              <span className={styles.value}>{health?.port ?? 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Last Check:</span>
              <span className={styles.value}>{lastCheck}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>⏱️ Uptime</h3>
          <div className={styles.bigMetric}>{metrics?.uptime.formatted ?? '--'}</div>
          <div className={styles.subMetric}>
            {metrics?.uptime.days ?? 0}d {metrics?.uptime.hours ?? 0}h{' '}
            {metrics?.uptime.minutes ?? 0}m
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>💾 Memory Usage</h3>
          <div className={styles.bigMetric}>
            {metrics ? `${metrics.memory.heapUsed.toFixed(0)} MB` : '--'}
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              data-variant={heapPercent > 80 ? 'danger' : undefined}
              style={{ width: `${heapPercent}%` }}
            />
          </div>
          <div className={styles.subMetric}>
            {heapPercent}% of {metrics ? `${metrics.memory.heapTotal.toFixed(0)} MB` : '--'}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>⚡ Response Time</h3>
          <div className={styles.bigMetric}>
            {metrics ? `${metrics.responseTime.average.toFixed(2)}ms` : '--'}
          </div>
          <div className={styles.subMetric}>
            avg over {metrics?.responseTime.samples ?? 0} requests
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>📨 Requests</h3>
          <div className={styles.bigMetric}>{metrics?.requests.total ?? 0}</div>
          <div className={styles.subMetric}>total handled</div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>🧪 Environment</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Mode:</span>
              <span className={styles.value}>{health?.env ?? 'N/A'}</span>
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
