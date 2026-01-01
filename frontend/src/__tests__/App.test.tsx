import { render, screen } from '@testing-library/react';
import { App } from '../app/App';

describe('App', () => {
  it('should render the header with navigation', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /application dashboard/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /codebase analysis/i })).toBeInTheDocument();
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
