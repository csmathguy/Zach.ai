import type { FC } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/app-shell/AppShell';
import { knowledgePlaceholderContent } from '@/app-shell/placeholders/knowledge-placeholder-content';
import { KnowledgeComingSoon } from '@/app-shell/placeholders/KnowledgeComingSoon';
import { CodebaseAnalysisDashboard } from '@/features/codebase-analysis/CodebaseAnalysisDashboard';
import { IdeasPage } from '@/features/ideas/IdeasPage';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ThemeProvider } from '@/app-shell/theme/ThemeProvider';
import { RequireAdmin, RequireAuth } from '@/features/auth/guards';
import { PublicLayout } from '@/features/auth/PublicLayout';
import { LandingPage } from '@/features/auth/pages/LandingPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ResetRequestPage } from '@/features/auth/pages/ResetRequestPage';
import { ResetConfirmPage } from '@/features/auth/pages/ResetConfirmPage';
import { AdminAccountsPage } from '@/features/auth/pages/AdminAccountsPage';
import { AccountPage } from '@/features/auth/pages/AccountPage';

const AuthenticatedShell = (): JSX.Element => (
  <RequireAuth>
    <AppShell>
      <Outlet />
    </AppShell>
  </RequireAuth>
);

export const App: FC = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset" element={<ResetRequestPage />} />
            <Route path="/reset/confirm" element={<ResetConfirmPage />} />
          </Route>

          <Route element={<AuthenticatedShell />}>
            <Route path="/ideas" element={<IdeasPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route
              path="/knowledge"
              element={<KnowledgeComingSoon content={knowledgePlaceholderContent} />}
            />
            <Route
              path="/codebase-analysis"
              element={
                <RequireAdmin>
                  <CodebaseAnalysisDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/accounts"
              element={
                <RequireAdmin>
                  <AdminAccountsPage />
                </RequireAdmin>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
