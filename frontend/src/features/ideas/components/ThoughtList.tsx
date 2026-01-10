import type { FC } from 'react';

import type { Thought } from '../types';
import { ThoughtItem } from './ThoughtItem';
import styles from './ThoughtList.module.css';

interface ThoughtListProps {
  thoughts: Thought[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const ThoughtList: FC<ThoughtListProps> = ({ thoughts, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <span>Loading ideas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p>Failed to load thoughts. Retry</p>
        <button className={styles.retry} type="button" onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  if (thoughts.length === 0) {
    return <p className={styles.empty}>No thoughts yet. Start capturing!</p>;
  }

  return (
    <ul className={styles.list} role="list">
      {thoughts.map((thought) => (
        <ThoughtItem key={thought.id} thought={thought} />
      ))}
    </ul>
  );
};
