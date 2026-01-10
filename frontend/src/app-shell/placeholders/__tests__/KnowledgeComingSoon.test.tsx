import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { KnowledgeComingSoon } from '@/app-shell/placeholders/KnowledgeComingSoon';
import { knowledgePlaceholderContent } from '@/app-shell/placeholders/knowledge-placeholder-content';

jest.mock('@/app-shell/analytics/analytics', () => ({
  trackEvent: jest.fn(),
}));

describe('KnowledgeComingSoon', () => {
  it('renders hero content and CTAs from the content contract', () => {
    render(<KnowledgeComingSoon content={knowledgePlaceholderContent} />);

    expect(
      screen.getByRole('heading', { name: knowledgePlaceholderContent.heroTitle })
    ).toBeInTheDocument();
    expect(screen.getByText(knowledgePlaceholderContent.heroBody)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: knowledgePlaceholderContent.primaryCta.label })
    ).toHaveAttribute('href', knowledgePlaceholderContent.primaryCta.href);
  });

  it('adds rel noopener for external CTA links', () => {
    render(<KnowledgeComingSoon content={knowledgePlaceholderContent} />);

    const primary = screen.getByRole('link', {
      name: knowledgePlaceholderContent.primaryCta.label,
    });
    expect(primary).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('fires analytics event on mount', () => {
    const { trackEvent } = jest.requireMock('@/app-shell/analytics/analytics') as {
      trackEvent: jest.Mock;
    };

    render(<KnowledgeComingSoon content={knowledgePlaceholderContent} />);
    expect(trackEvent).toHaveBeenCalledWith('knowledgePlaceholder.view');
  });
});
