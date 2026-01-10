import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CaptureInput } from '../components/CaptureInput';

describe('CaptureInput', () => {
  it('disables submit when the input is empty', () => {
    render(<CaptureInput onSubmit={jest.fn()} />);

    expect(screen.getByRole('button', { name: /capture/i })).toBeDisabled();
  });

  it('shows validation error for whitespace-only input', async () => {
    const user = userEvent.setup();
    render(<CaptureInput onSubmit={jest.fn()} />);

    await user.type(screen.getByLabelText(/enter your thought/i), '   ');
    await user.click(screen.getByRole('button', { name: /capture/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Thought cannot be empty.');
  });

  it('submits on Enter and inserts newline on Shift+Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<CaptureInput onSubmit={onSubmit} />);

    const input = screen.getByLabelText(/enter your thought/i);
    await user.type(input, 'New idea{shift>}{enter}{/shift}');

    expect((input as HTMLTextAreaElement).value).toContain('\n');
    expect(onSubmit).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, 'New idea{enter}');

    expect(onSubmit).toHaveBeenCalledWith('New idea');
  });

  it('clears input and keeps focus on success', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<CaptureInput onSubmit={jest.fn().mockResolvedValue(undefined)} />);

    const input = screen.getByLabelText(/enter your thought/i);
    await user.type(input, 'New idea');
    await user.click(screen.getByRole('button', { name: /capture/i }));

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    jest.useRealTimers();
  });

  it('shows error message on API failure and preserves input', async () => {
    const user = userEvent.setup();
    render(<CaptureInput onSubmit={jest.fn().mockRejectedValue(new Error('fail'))} />);

    const input = screen.getByLabelText(/enter your thought/i);
    await user.type(input, 'New idea');
    await user.click(screen.getByRole('button', { name: /capture/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Failed to capture thought. Please try again.'
      )
    );
    expect(input).toHaveValue('New idea');
  });
});
