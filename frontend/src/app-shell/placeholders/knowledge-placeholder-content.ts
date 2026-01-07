import type { KnowledgePlaceholderContent } from '@/app-shell/placeholders/types';

export const knowledgePlaceholderContent: KnowledgePlaceholderContent = {
  heroTitle: 'Knowledge Base',
  heroBody:
    'A curated knowledge hub is coming soon. For now, explore the repository docs and decision logs.',
  primaryCta: {
    label: 'Open Knowledge Base Docs',
    href: 'https://github.com/Zach-ai/Zach.ai/tree/main/knowledge-base',
  },
  secondaryCta: {
    label: 'View Architecture Guide',
    href: 'https://github.com/Zach-ai/Zach.ai/tree/main/work-items/O8-app-shell-modernization/architecture',
  },
  roadmapHighlights: [
    {
      title: 'Searchable knowledge',
      description: 'Find guides and decisions quickly with tag filters and keyword search.',
    },
    {
      title: 'Team curation',
      description: 'Submit docs and share best practices directly from the dashboard.',
    },
  ],
};
