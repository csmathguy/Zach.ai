import type { FC } from 'react';
import styles from './DashboardTabs.module.css';

export const dashboardTabMetadata = {
  coverage: {
    icon: '\u{1F4CA}', // 📊
    label: 'Coverage',
    labelId: 'codebase-analysis-tab-coverage',
    panelId: 'codebase-analysis-panel-coverage',
  },
  health: {
    icon: '\u2764\uFE0F', // ❤️
    label: 'Health',
    labelId: 'codebase-analysis-tab-health',
    panelId: 'codebase-analysis-panel-health',
  },
} as const;

export type DashboardTabKey = keyof typeof dashboardTabMetadata;

interface DashboardTabsProps {
  activeTab: DashboardTabKey;
  onTabChange: (tab: DashboardTabKey) => void;
}

const orderedTabs: DashboardTabKey[] = ['coverage', 'health'];

export const DashboardTabs: FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => (
  <div className={styles.tabs} role="tablist" aria-label="Codebase analysis sections">
    {orderedTabs.map((tabKey) => {
      const tab = dashboardTabMetadata[tabKey];
      const isActive = activeTab === tabKey;
      return (
        <button
          key={tabKey}
          className={styles.tab}
          type="button"
          role="tab"
          aria-selected={isActive}
          aria-controls={tab.panelId}
          id={tab.labelId}
          onClick={() => onTabChange(tabKey)}
        >
          <span className={styles.tabIcon} aria-hidden="true">
            {tab.icon}
          </span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      );
    })}
  </div>
);
