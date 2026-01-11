import type { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthPages.module.css';

export const LandingPage: FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Zach.ai</h1>
          <h2 className={styles.heroSubtitle}>Organize thoughts into action.</h2>
          <p className={styles.mutedText}>
            A focused workspace for capturing ideas, analyzing the codebase, and turning intent into
            execution.
          </p>
          <Link to="/login" className={styles.heroCta}>
            Log in
          </Link>
          <span className={styles.mutedText}>Internal access only.</span>
        </div>
      </section>
    </div>
  );
};
