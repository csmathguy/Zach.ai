import type { FC } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from '../features/home/Home';
import { CodebaseAnalysisDashboard } from '../features/codebase-analysis/CodebaseAnalysisDashboard';
import styles from './App.module.css';

export const App: FC = () => {
  return (
    <BrowserRouter>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>🚀 Application Dashboard</h1>
          <p className={styles.tagline}>TypeScript, React &amp; Express starter</p>
          <nav className={styles.nav}>
            <Link to="/" className={styles.navLink}>
              Home
            </Link>
            <Link to="/codebase-analysis" className={styles.navLink}>
              Codebase Analysis
            </Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/codebase-analysis" element={<CodebaseAnalysisDashboard />} />
        </Routes>

        <footer className={styles.footer}>
          <p>Built with TypeScript, React, Vite, Express &amp; PM2 | Deployed with ❤️</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};
