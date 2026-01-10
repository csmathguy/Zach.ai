import type { FC } from 'react';

import type { Thought } from '../types';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import styles from './ThoughtItem.module.css';

const sourceIconMap: Record<Thought['source'], string> = {
  text: '📝',
  voice: '🎙️',
  api: '⚙️',
};

interface ThoughtItemProps {
  thought: Thought;
}

export const ThoughtItem: FC<ThoughtItemProps> = ({ thought }) => {
  const timestampLabel = formatRelativeTime(thought.timestamp);

  return (
    <li className={styles.item}>
      <span className={styles.icon} aria-label={thought.source}>
        {sourceIconMap[thought.source]}
      </span>
      <div className={styles.content}>
        <p className={styles.text}>{thought.text}</p>
        <time className={styles.time} dateTime={thought.timestamp}>
          {timestampLabel}
        </time>
      </div>
    </li>
  );
};
