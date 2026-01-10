import type { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AppShell } from '@/app-shell/AppShell';
import { IdeasPlaceholder } from '@/app-shell/placeholders/IdeasPlaceholder';
import { ideasPlaceholderContent } from '@/app-shell/placeholders/ideas-placeholder-content';
import { knowledgePlaceholderContent } from '@/app-shell/placeholders/knowledge-placeholder-content';
import { KnowledgeComingSoon } from '@/app-shell/placeholders/KnowledgeComingSoon';
import { CodebaseAnalysisDashboard } from '../features/codebase-analysis/CodebaseAnalysisDashboard';
import { Home } from '../features/home/Home';

export const App: FC = () => (
  <BrowserRouter>
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/codebase-analysis" element={<CodebaseAnalysisDashboard />} />
        <Route
          path="/knowledge"
          element={<KnowledgeComingSoon content={knowledgePlaceholderContent} />}
        />
        <Route path="/ideas" element={<IdeasPlaceholder content={ideasPlaceholderContent} />} />
      </Routes>
    </AppShell>
  </BrowserRouter>
);
