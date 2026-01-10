interface PlaceholderHighlight {
  title: string;
  description: string;
}

interface PlaceholderCta {
  label: string;
  href: string;
}

export interface PlaceholderContent {
  heroTitle: string;
  heroBody: string;
  primaryCta: PlaceholderCta;
  secondaryCta?: PlaceholderCta;
  roadmapHighlights: PlaceholderHighlight[];
}

export type KnowledgePlaceholderContent = PlaceholderContent;
export type IdeasPlaceholderContent = PlaceholderContent;

export interface KnowledgeComingSoonProps {
  content: KnowledgePlaceholderContent;
}

export interface IdeasPlaceholderProps {
  content: IdeasPlaceholderContent;
}
