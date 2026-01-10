import type { FC } from 'react';
import { useState } from 'react';
import { useCoverageData } from './hooks/useCoverageData';
import { CoverageGauges } from './components/CoverageGauges';
import { CoverageFileTable } from './components/CoverageFileTable';
import { CoverageCharts } from './components/CoverageCharts';
import styles from './CoverageTab.module.css';

type CoverageProject = 'frontend' | 'backend';

const projectTabs: Array<{ project: CoverageProject; label: string }> = [
  { project: 'frontend', label: 'Frontend' },
  { project: 'backend', label: 'Backend' },
];

const getTabId = (project: CoverageProject) => `coverage-project-tab-${project}`;
const coveragePanelId = 'coverage-project-panel';

export const CoverageTab: FC = () => {
  const [activeProject, setActiveProject] = useState<CoverageProject>('frontend');
  const { data, loading, error, refresh } = useCoverageData(activeProject);
  const activeTabId = getTabId(activeProject);

  return (
    <div className={styles.container}>
      <div className={styles.subTabs}>
        <div className={styles.tabList} role="tablist" aria-label="Select coverage dataset">
          {projectTabs.map(({ project, label }) => {
            const isActive = activeProject === project;
            return (
              <button
                key={project}
                className={`${styles.subTab} ${isActive ? styles.subTabActive : ''}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={coveragePanelId}
                id={getTabId(project)}
                onClick={() => setActiveProject(project)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          className={styles.refreshButton}
          type="button"
          onClick={refresh}
          title="Refresh coverage data"
          aria-label="Refresh coverage data"
        >
          🔄
        </button>
      </div>

      <div
        className={styles.content}
        role="tabpanel"
        id={coveragePanelId}
        aria-labelledby={activeTabId}
        aria-live="polite"
        aria-busy={loading}
      >
        {loading && (
          <div className={styles.placeholder} role="status" aria-live="polite">
            <h2>⏳ Loading Coverage Data...</h2>
          </div>
        )}

        {error && (
          <div className={styles.error} role="alert">
            <h2>⚠️ No Coverage Data Found</h2>
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

        {data && !loading && !error ? (
          <>
            <CoverageGauges coverage={data.total} />
            <CoverageCharts data={data} />
            <div className={styles.section}>
              <h3>File Coverage</h3>
              <CoverageFileTable files={data.files} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
