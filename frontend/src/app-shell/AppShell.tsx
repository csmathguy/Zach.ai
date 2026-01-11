import type { PropsWithChildren } from 'react';

import { ThemeToggleButton } from '@/app-shell/theme/ThemeToggleButton';
import { UtilityNav } from '@/app-shell/navigation/UtilityNav';
import { LogoutButton } from '@/features/auth/LogoutButton';
import styles from '@/app-shell/AppShell.module.css';

export const AppShell = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <div className={styles.shell} data-testid="app-shell">
      <header className={styles.header} data-testid="app-shell-header" role="banner">
        <UtilityNav />
        <div className={styles.headerActions}>
          <ThemeToggleButton />
          <LogoutButton className={styles.logoutButton} />
        </div>
      </header>
      <main className={styles.main} role="main">
        {children}
      </main>
    </div>
  );
};
