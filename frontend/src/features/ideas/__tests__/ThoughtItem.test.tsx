import { render, screen } from '@testing-library/react';

import { ThoughtItem } from '../components/ThoughtItem';
import type { Thought } from '../types';

describe('ThoughtItem', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-01-01T12:05:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders thought text, source icon, and relative time', () => {
    const thought: Thought = {
      id: '1',
      text: 'Voice idea',
      source: 'voice',
      timestamp: '2026-01-01T12:03:00Z',
      processedState: 'UNPROCESSED',
    };

    render(<ThoughtItem thought={thought} />);

    expect(screen.getByText('Voice idea')).toBeInTheDocument();
    expect(screen.getByLabelText('voice')).toBeInTheDocument();
    expect(screen.getByText(/2 minutes ago/i)).toBeInTheDocument();
    expect(screen.getByText(/2 minutes ago/i).closest('time')).toHaveAttribute(
      'datetime',
      thought.timestamp
    );
  });
});
