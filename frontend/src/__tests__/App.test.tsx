import { render, screen } from '@testing-library/react';
import { App } from '../app/App';

describe('App', () => {
  it('should render the main sections', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /application dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /health check/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /environment/i })).toBeInTheDocument();
  });
});
