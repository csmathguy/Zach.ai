import type { FC } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
}

const featureCards: FeatureCard[] = [
  {
    icon: '📊',
    title: 'Codebase Analysis',
    description: 'Monitor test coverage and system health in a single, trusted view.',
    href: '/codebase-analysis',
    cta: 'View dashboard',
  },
  {
    icon: '🛠️',
    title: 'Ready to Build',
    description:
      'TypeScript, React, Vite, Express, and PM2 ƒ?" all wired up so you can focus on product.',
  },
  {
    icon: '⚡',
    title: 'Fast Development',
    description: 'Hot reloads, optimized builds, and a shell that stays out of your way.',
  },
];

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
          to fit your project&apos;s needs.
        </p>
      </section>

      <section className={styles.features} aria-labelledby="features-title">
        <h2 id="features-title" className={styles.sectionTitle}>
          Product pillars at a glance
        </h2>
        <p className={styles.sectionSubtitle}>
          Navigate between health insights, the upcoming knowledge hub, and our ideation surface.
        </p>
        <div className={styles.featureGrid}>
          {featureCards.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon} aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
              {feature.href ? (
                <Link to={feature.href} className={styles.featureLink}>
                  <span>{feature.cta}</span>
                  <span aria-hidden="true">ƒ+-</span>
                </Link>
              ) : null}
            </article>
          ))}
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
              <p>Start frontend and backend in development mode.</p>
            </div>
          </div>

          <div className={styles.quickStartStep}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Build</h3>
              <code>npm run build</code>
              <p>Create production-ready builds.</p>
            </div>
          </div>

          <div className={styles.quickStartStep}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Deploy</h3>
              <code>npm run deploy</code>
              <p>Deploy to the production environment.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
