import type { IdeasPlaceholderContent } from '@/app-shell/placeholders/types';

export const ideasPlaceholderContent: IdeasPlaceholderContent = {
  heroTitle: 'Ideas & Inbox',
  heroBody:
    'Inbox v1 is almost here. Use this hub to capture sparks, triage issues, and promote the next wave of automation work.',
  primaryCta: {
    label: 'Review Inbox work item',
    href: 'https://github.com/Zach-ai/Zach.ai/tree/main/work-items/O3-inbox-ui',
  },
  secondaryCta: {
    label: 'Share product feedback',
    href: 'https://github.com/Zach-ai/Zach.ai/issues/new?template=ideas.md',
  },
  roadmapHighlights: [
    {
      title: 'Unified capture',
      description: 'Route Copilot notes, alerts, and manual todos into a single prioritized queue.',
    },
    {
      title: 'Action promotion',
      description: 'Promote vetted ideas into implementation tickets with one click.',
    },
    {
      title: 'Knowledge sync',
      description: 'Push completed ideas back into the knowledge base for downstream teams.',
    },
  ],
};
