import type { FC } from 'react';
import { useCallback, useEffect } from 'react';

import { trackEvent } from '@/app-shell/analytics/analytics';
import { createThought } from './api/thoughtsApi';
import { CaptureInput } from './components/CaptureInput';
import { ThoughtList } from './components/ThoughtList';
import { useThoughts } from './hooks/useThoughts';
import styles from './IdeasPage.module.css';

export const IdeasPage: FC = () => {
  const { data, loading, error, refresh } = useThoughts();

  useEffect(() => {
    trackEvent('ideas.view');
  }, []);

  const handleSubmit = useCallback(
    async (text: string) => {
      try {
        await createThought(text);
        trackEvent('ideas.capture.success');
        await refresh();
      } catch (err) {
        trackEvent('ideas.capture.error');
        throw err;
      }
    },
    [refresh]
  );

  return (
    <section className={styles.container} aria-labelledby="ideas-title">
      <header className={styles.header}>
        <h1 id="ideas-title" className={styles.title}>
          Ideas
        </h1>
        <p className={styles.subtitle}>Capture ideas and keep your thinking clear.</p>
      </header>

      <CaptureInput onSubmit={handleSubmit} />

      <div className={styles.listSection}>
        <h2 className={styles.listTitle}>Latest ideas</h2>
        <ThoughtList thoughts={data} loading={loading} error={error} onRetry={refresh} />
      </div>
    </section>
  );
};
