import type { PropsWithChildren } from 'react';

import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { ThemeToggleButton } from '@/app-shell/theme/ThemeToggleButton';
import { UtilityNav } from '@/app-shell/navigation/UtilityNav';
import styles from '@/app-shell/AppShell.module.css';

export const AppShell = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <ThemeProvider>
      <div className={styles.shell} data-testid="app-shell">
        <header className={styles.header} data-testid="app-shell-header" role="banner">
          <UtilityNav />
          <ThemeToggleButton />
        </header>
        <main className={styles.main} role="main">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
};
