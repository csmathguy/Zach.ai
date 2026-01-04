export interface KnowledgePlaceholderContent {
  heroTitle: string;
  heroBody: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  roadmapHighlights: Array<{
    title: string;
    description: string;
  }>;
}

export interface KnowledgeComingSoonProps {
  content: KnowledgePlaceholderContent;
}
