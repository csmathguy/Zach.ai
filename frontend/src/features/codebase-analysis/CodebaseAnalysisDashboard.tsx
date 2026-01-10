import type { FC } from 'react';
import { useState } from 'react';
import { DashboardTabs, dashboardTabMetadata, type DashboardTabKey } from './shared/DashboardTabs';
import { CoverageTab } from './coverage/CoverageTab';
import { HealthTab } from './health/HealthTab';
import styles from './CodebaseAnalysisDashboard.module.css';

type TabType = DashboardTabKey;

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
        <section
          id={dashboardTabMetadata.coverage.panelId}
          role="tabpanel"
          aria-labelledby={dashboardTabMetadata.coverage.labelId}
          hidden={activeTab !== 'coverage'}
          className={styles.panel}
        >
          {activeTab === 'coverage' ? <CoverageTab /> : null}
        </section>
        <section
          id={dashboardTabMetadata.health.panelId}
          role="tabpanel"
          aria-labelledby={dashboardTabMetadata.health.labelId}
          hidden={activeTab !== 'health'}
          className={styles.panel}
        >
          {activeTab === 'health' ? <HealthTab /> : null}
        </section>
      </main>
    </div>
  );
};
