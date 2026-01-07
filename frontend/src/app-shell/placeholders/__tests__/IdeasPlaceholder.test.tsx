import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { IdeasPlaceholder } from '@/app-shell/placeholders/IdeasPlaceholder';
import { ideasPlaceholderContent } from '@/app-shell/placeholders/ideas-placeholder-content';

jest.mock('@/app-shell/analytics/analytics', () => ({
  trackEvent: jest.fn(),
}));

describe('IdeasPlaceholder', () => {
  it('renders hero copy and CTA links', () => {
    render(<IdeasPlaceholder content={ideasPlaceholderContent} />);

    expect(
      screen.getByRole('heading', { name: ideasPlaceholderContent.heroTitle })
    ).toBeInTheDocument();
    expect(screen.getByText(ideasPlaceholderContent.heroBody)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: ideasPlaceholderContent.primaryCta.label })
    ).toHaveAttribute('href', ideasPlaceholderContent.primaryCta.href);
  });

  it('sets rel attributes for external links', () => {
    render(<IdeasPlaceholder content={ideasPlaceholderContent} />);

    const feedbackLink = screen.getByRole('link', {
      name: ideasPlaceholderContent.secondaryCta?.label ?? '',
    });
    expect(feedbackLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('fires analytics event once on mount', () => {
    const { trackEvent } = jest.requireMock('@/app-shell/analytics/analytics') as {
      trackEvent: jest.Mock;
    };

    render(<IdeasPlaceholder content={ideasPlaceholderContent} />);
    expect(trackEvent).toHaveBeenCalledWith('ideasPlaceholder.view');
  });
});
