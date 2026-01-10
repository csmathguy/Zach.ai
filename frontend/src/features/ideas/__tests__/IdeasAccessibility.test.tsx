import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IdeasPage } from '../IdeasPage';
import { CaptureInput } from '../components/CaptureInput';
import { ThoughtItem } from '../components/ThoughtItem';
import { ThoughtList } from '../components/ThoughtList';
import type { Thought } from '../types';

jest.mock('../hooks/useThoughts', () => ({
  useThoughts: jest.fn(() => ({
    data: [],
    loading: false,
    error: null,
    refresh: jest.fn(),
  })),
}));

describe('Ideas accessibility', () => {
  it('associates the capture input with its label', () => {
    render(<IdeasPage />);

    expect(screen.getByLabelText(/enter your thought/i)).toBeInTheDocument();
  });

  it('announces success messages with a live region', async () => {
    const user = userEvent.setup();
    render(<CaptureInput onSubmit={jest.fn().mockResolvedValue(undefined)} />);

    await user.type(screen.getByLabelText(/enter your thought/i), 'New idea');
    await user.click(screen.getByRole('button', { name: /capture/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('Thought captured!');
  });

  it('uses list semantics for ideas list', () => {
    const thoughts: Thought[] = [
      {
        id: '1',
        text: 'Idea',
        source: 'text',
        timestamp: '2026-01-01T12:00:00Z',
        processedState: 'UNPROCESSED',
      },
    ];

    render(<ThoughtList thoughts={thoughts} loading={false} error={null} onRetry={jest.fn()} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('adds aria-labels to source icons', () => {
    const thought: Thought = {
      id: '1',
      text: 'Voice idea',
      source: 'voice',
      timestamp: '2026-01-01T12:00:00Z',
      processedState: 'UNPROCESSED',
    };

    render(<ThoughtItem thought={thought} />);

    expect(screen.getByLabelText('voice')).toBeInTheDocument();
  });

  it('renders timestamps as time elements with datetime', () => {
    const thought: Thought = {
      id: '1',
      text: 'Idea',
      source: 'text',
      timestamp: '2026-01-01T12:00:00Z',
      processedState: 'UNPROCESSED',
    };

    const { container } = render(<ThoughtItem thought={thought} />);
    const timeElement = container.querySelector('time');

    expect(timeElement).toBeTruthy();
    expect(timeElement).toHaveAttribute('datetime', '2026-01-01T12:00:00Z');
  });
});
