import type { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthPages.module.css';

export const AccessDeniedPage: FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.heroTitle}>Access denied</h1>
        <p className={styles.heroSubtitle}>You do not have access to this page.</p>
        <Link to="/ideas" className={styles.secondaryLink}>
          Return to Ideas
        </Link>
      </section>
    </div>
  );
};
