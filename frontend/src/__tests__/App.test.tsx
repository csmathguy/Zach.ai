import { render, screen } from '@testing-library/react';
import { App } from '../app/App';

describe('App', () => {
  it('renders the modern app shell header and utility navigation', () => {
    render(<App />);

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(
      screen.getByRole('tablist', {
        name: /utility navigation/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /health/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /knowledge/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ideas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('should render the home page by default', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /welcome to your application/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/modern typescript \+ react \+ express/i)).toBeInTheDocument();
  });

  it('should render feature cards', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /codebase analysis/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ready to build/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /fast development/i })).toBeInTheDocument();
  });

  it('should render quick start guide', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /getting started/i })).toBeInTheDocument();
    expect(screen.getByText(/npm run dev/i)).toBeInTheDocument();
    expect(screen.getByText(/npm run build/i)).toBeInTheDocument();
    expect(screen.getByText(/npm run deploy/i)).toBeInTheDocument();
  });
});
