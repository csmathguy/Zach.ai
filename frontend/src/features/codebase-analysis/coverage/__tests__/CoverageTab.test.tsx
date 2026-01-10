import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CoverageTab } from '../CoverageTab';
import * as useCoverageDataModule from '../hooks/useCoverageData';
import type { ParsedCoverageData } from '../utils/coverageTypes';

jest.mock('../components/CoverageGauges', () => ({
  CoverageGauges: () => <div data-testid="coverage-gauges">Coverage Gauges</div>,
}));

jest.mock('../components/CoverageFileTable', () => ({
  CoverageFileTable: () => <div data-testid="coverage-file-table">File Table</div>,
}));

jest.mock('../components/CoverageCharts', () => ({
  CoverageCharts: () => <div data-testid="coverage-charts">Coverage Charts</div>,
}));

describe('CoverageTab', () => {
  const mockData: ParsedCoverageData = {
    total: {
      lines: 85,
      statements: 83.33,
      functions: 93.33,
      branches: 87.5,
    },
    files: [
      {
        path: 'src/utils/helpers.ts',
        statements: 91.67,
        branches: 90,
        functions: 93.33,
        lines: 90,
      },
    ],
  };

  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders frontend and backend tabs', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    expect(screen.getByRole('tab', { name: /frontend/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /backend/i })).toBeInTheDocument();
  });

  it('renders the refresh control with the new icon', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    const refreshButton = screen.getByTitle('Refresh coverage data');
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toHaveTextContent('🔄');
  });

  it('shows the loading message and icon', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    expect(screen.getByText(/loading coverage data/i)).toBeInTheDocument();
    expect(screen.getByText(/⏳/)).toBeInTheDocument();
  });

  it('shows the error panel when the hook errors', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: null,
      loading: false,
      error: 'Coverage data not found',
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    expect(screen.getByText(/no coverage data found/i)).toBeInTheDocument();
    expect(screen.getByText('Coverage data not found')).toBeInTheDocument();
    expect(screen.getByText(/generate coverage data/i)).toBeInTheDocument();
    expect(screen.getByText('npm run test:coverage --prefix frontend')).toBeInTheDocument();
  });

  it('renders coverage sections when data is present', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    expect(screen.getByTestId('coverage-gauges')).toBeInTheDocument();
    expect(screen.getByTestId('coverage-charts')).toBeInTheDocument();
    expect(screen.getByTestId('coverage-file-table')).toBeInTheDocument();
    expect(screen.getByText('File Coverage')).toBeInTheDocument();
  });

  it('switches the hook to backend when the backend tab is clicked', async () => {
    const mockUseCoverageData = jest.spyOn(useCoverageDataModule, 'useCoverageData');
    mockUseCoverageData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    const user = userEvent.setup();
    render(<CoverageTab />);

    const backendTab = screen.getByRole('tab', { name: /backend/i });
    await user.click(backendTab);

    await waitFor(() => {
      const calls = mockUseCoverageData.mock.calls;
      expect(calls[calls.length - 1][0]).toBe('backend');
    });
  });

  it('marks the frontend tab as selected by default', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    const frontendTab = screen.getByRole('tab', { name: /frontend/i });
    const backendTab = screen.getByRole('tab', { name: /backend/i });

    expect(frontendTab).toHaveAttribute('aria-selected', 'true');
    expect(backendTab).toHaveAttribute('aria-selected', 'false');
  });

  it('updates aria state when switching tabs', async () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    const user = userEvent.setup();
    render(<CoverageTab />);

    const backendTab = screen.getByRole('tab', { name: /backend/i });
    await user.click(backendTab);

    await waitFor(() => {
      expect(backendTab).toHaveAttribute('aria-selected', 'true');
    });

    const frontendTab = screen.getByRole('tab', { name: /frontend/i });
    expect(frontendTab).toHaveAttribute('aria-selected', 'false');
  });

  it('calls refresh when the refresh button is pressed', async () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    const user = userEvent.setup();
    render(<CoverageTab />);

    const refreshButton = screen.getByTitle('Refresh coverage data');
    await user.click(refreshButton);

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('updates the instructions when the selected project changes', async () => {
    const mockUseCoverageData = jest.spyOn(useCoverageDataModule, 'useCoverageData');

    mockUseCoverageData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Coverage data not found',
      refresh: mockRefresh,
    });

    const user = userEvent.setup();
    const { rerender } = render(<CoverageTab />);

    expect(screen.getByText('npm run test:coverage --prefix frontend')).toBeInTheDocument();

    const backendTab = screen.getByRole('tab', { name: /backend/i });
    await user.click(backendTab);

    mockUseCoverageData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Coverage data not found',
      refresh: mockRefresh,
    });

    rerender(<CoverageTab />);

    await waitFor(() => {
      const codeElements = screen.getAllByText(/npm run test:coverage --prefix/);
      const hasBackend = codeElements.some((el) => el.textContent?.includes('backend'));
      expect(hasBackend).toBe(true);
    });
  });

  it('hides coverage components while loading', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    expect(screen.queryByTestId('coverage-gauges')).not.toBeInTheDocument();
    expect(screen.queryByTestId('coverage-charts')).not.toBeInTheDocument();
    expect(screen.queryByTestId('coverage-file-table')).not.toBeInTheDocument();
  });

  it('hides coverage components when there is an error', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load',
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    expect(screen.queryByTestId('coverage-gauges')).not.toBeInTheDocument();
    expect(screen.queryByTestId('coverage-charts')).not.toBeInTheDocument();
    expect(screen.queryByTestId('coverage-file-table')).not.toBeInTheDocument();
  });

  it('allows multiple refresh requests', async () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    const user = userEvent.setup();
    render(<CoverageTab />);

    const refreshButton = screen.getByTitle('Refresh coverage data');
    await user.click(refreshButton);
    await user.click(refreshButton);
    await user.click(refreshButton);

    expect(mockRefresh).toHaveBeenCalledTimes(3);
  });

  it('renders the copy instructions in the error state', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: null,
      loading: false,
      error: 'Not found',
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    expect(
      screen.getByText('frontend/coverage/coverage-summary.json', { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText('frontend/public/coverage/frontend-coverage-summary.json', { exact: false })
    ).toBeInTheDocument();
  });
});
