import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThoughtList } from '../components/ThoughtList';
import type { Thought } from '../types';

describe('ThoughtList', () => {
  it('renders loading state', () => {
    render(<ThoughtList thoughts={[]} loading={true} error={null} onRetry={jest.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent(/loading ideas/i);
  });

  it('renders error state and retry action', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    render(<ThoughtList thoughts={[]} loading={false} error="Failed" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load thoughts/i);
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when no thoughts exist', () => {
    render(<ThoughtList thoughts={[]} loading={false} error={null} onRetry={jest.fn()} />);

    expect(screen.getByText(/no thoughts yet/i)).toBeInTheDocument();
  });

  it('renders list items for thoughts', () => {
    const thoughts: Thought[] = [
      {
        id: '1',
        text: 'Idea one',
        source: 'text',
        timestamp: '2026-01-01T12:00:00Z',
        processedState: 'UNPROCESSED',
      },
    ];

    render(<ThoughtList thoughts={thoughts} loading={false} error={null} onRetry={jest.fn()} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Idea one')).toBeInTheDocument();
  });
});
