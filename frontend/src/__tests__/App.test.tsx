import { render, screen } from '@testing-library/react';
import { App } from '../app/App';

jest.mock('@/features/ideas/hooks/useThoughts', () => ({
  useThoughts: jest.fn(() => ({
    data: [],
    loading: false,
    error: null,
    refresh: jest.fn(),
  })),
}));

const setAuthUser = (role: 'USER' | 'ADMIN' = 'USER') => {
  window.sessionStorage.setItem(
    'zachai.auth.user',
    JSON.stringify({ id: 'user-1', username: 'tester', role })
  );
};

describe('App', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.pushState({}, 'Test', '/');
  });

  it('renders the landing page by default', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /zach.ai/i })).toBeInTheDocument();
    expect(screen.getByText(/organize thoughts into action/i)).toBeInTheDocument();
  });

  it('does not render the app shell on public routes', () => {
    render(<App />);

    expect(screen.queryByTestId('app-shell')).not.toBeInTheDocument();
  });

  it('renders the app shell for authenticated routes', () => {
    setAuthUser();
    window.history.pushState({}, 'Test', '/ideas');
    render(<App />);

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: /utility navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ideas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });
});
