import type { KnowledgePlaceholderContent } from '@/app-shell/placeholders/types';

export const knowledgePlaceholderContent: KnowledgePlaceholderContent = {
  heroTitle: 'Knowledge Base',
  heroBody: 'A curated knowledge hub is coming soon. For now, explore the docs and architecture notes.',
  primaryCta: {
    label: 'Open Knowledge Base Docs',
    href: 'https://example.com/knowledge-base',
  },
  secondaryCta: {
    label: 'View Architecture Guide',
    href: 'https://example.com/architecture',
  },
  roadmapHighlights: [
    {
      title: 'Searchable knowledge',
      description: 'Find guides and decisions quickly with keyword search.',
    },
    {
      title: 'Team curation',
      description: 'Submit docs and share best practices across squads.',
    },
  ],
};
