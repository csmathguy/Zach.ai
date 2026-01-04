import { useEffect } from 'react';

import { trackEvent } from '@/app-shell/analytics/analytics';
import type { KnowledgeComingSoonProps } from '@/app-shell/placeholders/types';

const isExternalLink = (href: string): boolean =>
  href.startsWith('http://') || href.startsWith('https://');

const buildRel = (href: string): string | undefined =>
  isExternalLink(href) ? 'noopener' : undefined;

export const KnowledgeComingSoon = ({ content }: KnowledgeComingSoonProps): JSX.Element => {
  useEffect(() => {
    trackEvent('knowledgePlaceholder.view');
  }, []);

  return (
    <section aria-labelledby="knowledge-placeholder-title">
      <header>
        <h1 id="knowledge-placeholder-title">{content.heroTitle}</h1>
        <p>{content.heroBody}</p>
      </header>

      <div>
        <a href={content.primaryCta.href} rel={buildRel(content.primaryCta.href)}>
          {content.primaryCta.label}
        </a>
        {content.secondaryCta ? (
          <a href={content.secondaryCta.href} rel={buildRel(content.secondaryCta.href)}>
            {content.secondaryCta.label}
          </a>
        ) : null}
      </div>

      <div aria-label="Roadmap highlights">
        {content.roadmapHighlights.map((item) => (
          <article key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
