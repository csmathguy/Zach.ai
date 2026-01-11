import { Outlet } from 'react-router-dom';
import { ThemeToggleButton } from '@/app-shell/theme/ThemeToggleButton';
import styles from '@/features/auth/PublicLayout.module.css';

export const PublicLayout = (): JSX.Element => {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <ThemeToggleButton />
      </header>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};
