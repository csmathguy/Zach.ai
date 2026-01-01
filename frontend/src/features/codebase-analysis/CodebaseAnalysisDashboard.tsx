import type { FC } from 'react';
import { useState } from 'react';
import { DashboardTabs } from './shared/DashboardTabs';
import { CoverageTab } from './coverage/CoverageTab';
import { HealthTab } from './health/HealthTab';
import styles from './CodebaseAnalysisDashboard.module.css';

type TabType = 'coverage' | 'health';

export const CodebaseAnalysisDashboard: FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('coverage');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>📊 Codebase Analysis</h1>
        <p className={styles.subtitle}>Test Coverage • API Health</p>
      </header>

      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className={styles.content}>
        {activeTab === 'coverage' && <CoverageTab />}
        {activeTab === 'health' && <HealthTab />}
      </main>
    </div>
  );
};
