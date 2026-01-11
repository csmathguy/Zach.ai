import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessDeniedPage } from '@/features/auth/pages/AccessDeniedPage';

describe('AccessDeniedPage', () => {
  it('renders access denied message', () => {
    render(
      <MemoryRouter>
        <AccessDeniedPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to ideas/i })).toHaveAttribute(
      'href',
      '/ideas'
    );
  });
});
