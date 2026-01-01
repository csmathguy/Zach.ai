import type { FC } from 'react';
import { Dashboard } from '../features/dashboard/Dashboard';
import styles from './App.module.css';

export const App: FC = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🚀 Application Dashboard</h1>
        <p className={styles.tagline}>TypeScript, React &amp; Express starter</p>
      </header>

      <Dashboard />

      <footer className={styles.footer}>
        <p>Built with TypeScript, React, Vite, Express &amp; PM2 | Deployed with ❤️</p>
      </footer>
    </div>
  );
};
