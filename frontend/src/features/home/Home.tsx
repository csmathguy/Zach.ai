import type { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

export const Home: FC = () => {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Welcome to Your Application</h1>
        <p className={styles.heroSubtitle}>
          A modern TypeScript + React + Express starter template
        </p>
        <p className={styles.heroDescription}>
          This is a clean starting point for building your application. Customize this landing page
          to fit your project's needs.
        </p>
      </section>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📊</div>
          <h3 className={styles.featureTitle}>Codebase Analysis</h3>
          <p className={styles.featureDescription}>
            Monitor test coverage and server health in real-time
          </p>
          <Link to="/codebase-analysis" className={styles.featureLink}>
            View Dashboard →
          </Link>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🚀</div>
          <h3 className={styles.featureTitle}>Ready to Build</h3>
          <p className={styles.featureDescription}>
            TypeScript, React, Vite, Express, PM2 - everything configured and ready to go
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>⚡</div>
          <h3 className={styles.featureTitle}>Fast Development</h3>
          <p className={styles.featureDescription}>
            Hot module replacement, instant feedback, and optimized builds
          </p>
        </div>
      </section>

      <section className={styles.quickStart}>
        <h2 className={styles.quickStartTitle}>Getting Started</h2>
        <div className={styles.quickStartContent}>
          <div className={styles.quickStartStep}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Development</h3>
              <code>npm run dev</code>
              <p>Start frontend and backend in development mode</p>
            </div>
          </div>

          <div className={styles.quickStartStep}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Build</h3>
              <code>npm run build</code>
              <p>Create production-ready builds</p>
            </div>
          </div>

          <div className={styles.quickStartStep}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Deploy</h3>
              <code>npm run deploy</code>
              <p>Deploy to production environment</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
