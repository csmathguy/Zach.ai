import { render, screen } from '@testing-library/react';
import { App } from '../App';

jest.mock('@features/ideas/hooks/useThoughts', () => ({
  useThoughts: jest.fn(() => ({
    data: [],
    loading: false,
    error: null,
    refresh: jest.fn(),
  })),
}));

const renderAtRoute = (path: string): void => {
  window.history.pushState({}, 'Test', path);
  render(<App />);
};

describe('Ideas route integration', () => {
  it('renders the Ideas UI for /ideas', () => {
    renderAtRoute('/ideas');

    expect(screen.getByRole('heading', { name: /^ideas$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/enter your thought/i)).toBeInTheDocument();
  });

  it('does not render the Ideas placeholder content', () => {
    renderAtRoute('/ideas');

    expect(screen.queryByText(/ideas & inbox/i)).not.toBeInTheDocument();
  });

  it('highlights the Ideas tab in UtilityNav', () => {
    renderAtRoute('/ideas');

    expect(screen.getByRole('tab', { name: /ideas/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders a Go to Ideas CTA on the home page', () => {
    renderAtRoute('/');

    const cta = screen.getByRole('link', { name: /go to ideas/i });
    expect(cta).toHaveAttribute('href', '/ideas');
  });
});
