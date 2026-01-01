import type { FC } from 'react';
import { useState } from 'react';
import { useCoverageData } from './hooks/useCoverageData';
import { CoverageGauges } from './components/CoverageGauges';
import { CoverageFileTable } from './components/CoverageFileTable';
import { CoverageCharts } from './components/CoverageCharts';
import styles from './CoverageTab.module.css';

type CoverageProject = 'frontend' | 'backend';

export const CoverageTab: FC = () => {
  const [activeProject, setActiveProject] = useState<CoverageProject>('frontend');
  const { data, loading, error, refresh } = useCoverageData(activeProject);

  return (
    <div className={styles.container}>
      <div className={styles.subTabs}>
        <button
          className={`${styles.subTab} ${activeProject === 'frontend' ? styles.active : ''}`}
          onClick={() => setActiveProject('frontend')}
        >
          Frontend
        </button>
        <button
          className={`${styles.subTab} ${activeProject === 'backend' ? styles.active : ''}`}
          onClick={() => setActiveProject('backend')}
        >
          Backend
        </button>
        <button className={styles.refreshButton} onClick={refresh} title="Refresh coverage data">
          🔄
        </button>
      </div>

      <div className={styles.content}>
        {loading && (
          <div className={styles.placeholder}>
            <h2>⏳ Loading Coverage Data...</h2>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <h2>❌ No Coverage Data Found</h2>
            <p>{error}</p>
            <div className={styles.instructions}>
              <h3>Generate Coverage Data:</h3>
              <code>npm run test:coverage --prefix {activeProject}</code>
              <p className={styles.hint}>
                Then copy <code>{activeProject}/coverage/coverage-summary.json</code> to{' '}
                <code>frontend/public/coverage/{activeProject}-coverage-summary.json</code>
              </p>
            </div>
          </div>
        )}

        {data && (
          <>
            <CoverageGauges coverage={data.total} />
            
            <CoverageCharts data={data} />
            
            <div className={styles.section}>
              <h3>File Coverage</h3>
              <CoverageFileTable files={data.files} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
