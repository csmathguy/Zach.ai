import type { FC } from 'react';
import styles from './DashboardTabs.module.css';

interface DashboardTabsProps {
  activeTab: 'coverage' | 'health';
  onTabChange: (tab: 'coverage' | 'health') => void;
}

export const DashboardTabs: FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === 'coverage' ? styles.active : ''}`}
        onClick={() => onTabChange('coverage')}
      >
        📈 Coverage
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'health' ? styles.active : ''}`}
        onClick={() => onTabChange('health')}
      >
        💚 Health
      </button>
    </div>
  );
};
