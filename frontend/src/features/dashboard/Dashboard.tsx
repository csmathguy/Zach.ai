import type { FC } from 'react';
import { useEffect } from 'react';
import { initializeDashboard } from './dashboard-api';
import styles from './Dashboard.module.css';

export const Dashboard: FC = () => {
  useEffect(() => {
    initializeDashboard();
  }, []);

  return (
    <div className={styles.cards}>
      <section className={styles.card} aria-labelledby="health-heading">
        <h2 id="health-heading" className={styles.cardTitle}>
          � Health Check
        </h2>
        <div id="health-status" className="loading">
          Checking server...
        </div>
      </section>

      <section className={styles.card} aria-labelledby="dashboard-heading">
        <h2 id="dashboard-heading" className={styles.cardTitle}>
          📊 Dashboard
        </h2>
        <div id="dashboard-metrics" className="loading">
          Loading metrics...
        </div>
      </section>

      <section className={styles.card} aria-labelledby="environment-heading">
        <h2 id="environment-heading" className={styles.cardTitle}>
          ⚡ Environment
        </h2>
        <div id="environment-info" className="loading">
          Loading...
        </div>
      </section>
    </div>
  );
};
