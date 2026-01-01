import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CoverageTab } from '../CoverageTab';
import * as useCoverageDataModule from '../hooks/useCoverageData';
import type { ParsedCoverageData } from '../utils/coverageTypes';

// Mock the child components
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

  it('should render frontend and backend sub-tabs', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    expect(screen.getByRole('button', { name: /frontend/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /backend/i })).toBeInTheDocument();
  });

  it('should render refresh button', () => {
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

  it('should show loading state', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    expect(screen.getByText(/loading coverage data/i)).toBeInTheDocument();
    expect(screen.getByText('⏳', { exact: false })).toBeInTheDocument();
  });

  it('should show error state with instructions', () => {
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

  it('should display coverage data when loaded', () => {
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

  it('should switch to backend when backend tab is clicked', async () => {
    const mockUseCoverageData = jest.spyOn(useCoverageDataModule, 'useCoverageData');
    mockUseCoverageData.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    const user = userEvent.setup();
    render(<CoverageTab />);

    const backendTab = screen.getByRole('button', { name: /backend/i });
    await user.click(backendTab);

    // Check that the hook was called with 'backend' on the second render
    await waitFor(() => {
      const calls = mockUseCoverageData.mock.calls;
      expect(calls[calls.length - 1][0]).toBe('backend');
    });
  });

  it('should highlight active frontend tab by default', () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: mockRefresh,
    });

    render(<CoverageTab />);

    const frontendTab = screen.getByRole('button', { name: /frontend/i });
    const backendTab = screen.getByRole('button', { name: /backend/i });

    expect(frontendTab).toHaveClass('active');
    expect(backendTab).not.toHaveClass('active');
  });

  it('should highlight active backend tab after switching', async () => {
    jest.spyOn(useCoverageDataModule, 'useCoverageData').mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    const user = userEvent.setup();
    render(<CoverageTab />);

    const backendTab = screen.getByRole('button', { name: /backend/i });
    await user.click(backendTab);

    await waitFor(() => {
      expect(backendTab).toHaveClass('active');
    });

    const frontendTab = screen.getByRole('button', { name: /frontend/i });
    expect(frontendTab).not.toHaveClass('active');
  });

  it('should call refresh when refresh button is clicked', async () => {
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

  it('should update error message when switching projects', async () => {
    const mockUseCoverageData = jest.spyOn(useCoverageDataModule, 'useCoverageData');
    
    // Frontend with error
    mockUseCoverageData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Coverage data not found',
      refresh: mockRefresh,
    });

    const user = userEvent.setup();
    const { rerender } = render(<CoverageTab />);

    expect(screen.getByText('npm run test:coverage --prefix frontend')).toBeInTheDocument();

    // Switch to backend
    const backendTab = screen.getByRole('button', { name: /backend/i });
    await user.click(backendTab);

    // Re-render with backend error
    mockUseCoverageData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Coverage data not found',
      refresh: mockRefresh,
    });

    rerender(<CoverageTab />);

    // The component updates activeProject state, which changes the instructions
    await waitFor(() => {
      const codeElements = screen.getAllByText(/npm run test:coverage --prefix/);
      const hasBackend = codeElements.some((el) => el.textContent?.includes('backend'));
      expect(hasBackend).toBe(true);
    });
  });

  it('should not render coverage components when loading', () => {
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

  it('should not render coverage components when error', () => {
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

  it('should handle multiple refreshes', async () => {
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

  it('should display copy instructions in error state', () => {
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
