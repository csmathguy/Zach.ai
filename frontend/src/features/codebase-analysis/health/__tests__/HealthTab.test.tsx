import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { HealthTab } from '../HealthTab';
import * as useHealthDataModule from '../hooks/useHealthData';

// Mock the useHealthData hook
jest.mock('../hooks/useHealthData');

describe('HealthTab', () => {
  const mockUseHealthData = useHealthDataModule.useHealthData as jest.MockedFunction<
    typeof useHealthDataModule.useHealthData
  >;

  const mockHealthData = {
    health: {
      status: 'ok',
      timestamp: '2026-01-01T12:00:00.000Z',
      env: 'development',
      port: 3000,
    },
    metrics: {
      uptime: {
        formatted: '1d 2h 30m 45s',
        days: 1,
        hours: 2,
        minutes: 30,
        seconds: 45,
      },
      responseTime: {
        average: 25,
        samples: 100,
        recent: [20, 25, 30],
      },
      memory: {
        rss: 100,
        heapTotal: 80,
        heapUsed: 50,
        external: 10,
      },
      requests: {
        total: 1234,
      },
      timestamp: '2026-01-01T12:00:00.000Z',
    },
    loading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseHealthData.mockReturnValue({
      health: null,
      metrics: null,
      loading: true,
      error: null,
    });

    render(<HealthTab />);

    expect(screen.getByText(/loading health data/i)).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseHealthData.mockReturnValue({
      health: null,
      metrics: null,
      loading: false,
      error: 'Failed to fetch',
    });

    render(<HealthTab />);

    expect(screen.getByText(/error loading health data/i)).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('should render system status card', () => {
    mockUseHealthData.mockReturnValue(mockHealthData);

    render(<HealthTab />);

    expect(screen.getByText(/system status/i)).toBeInTheDocument();
    expect(screen.getByText('🟡 Development')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('should render uptime card', () => {
    mockUseHealthData.mockReturnValue(mockHealthData);

    render(<HealthTab />);

    expect(screen.getByText(/uptime/i)).toBeInTheDocument();
    expect(screen.getByText('1d 2h 30m 45s')).toBeInTheDocument();
  });

  it('should render memory usage card', () => {
    mockUseHealthData.mockReturnValue(mockHealthData);

    render(<HealthTab />);

    expect(screen.getByText(/memory usage/i)).toBeInTheDocument();
    expect(screen.getByText('50 MB')).toBeInTheDocument();
  });

  it('should render response time card', () => {
    mockUseHealthData.mockReturnValue(mockHealthData);

    render(<HealthTab />);

    expect(screen.getByText(/response time/i)).toBeInTheDocument();
    expect(screen.getByText('25.00ms')).toBeInTheDocument();
  });

  it('should render requests card', () => {
    mockUseHealthData.mockReturnValue(mockHealthData);

    render(<HealthTab />);

    expect(screen.getByText('📊 Requests')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('should render environment card', () => {
    mockUseHealthData.mockReturnValue(mockHealthData);

    render(<HealthTab />);

    expect(screen.getByText(/environment/i)).toBeInTheDocument();
  });

  it('should show production badge for production environment', () => {
    const healthData = mockHealthData.health;
    if (!healthData) throw new Error('Health data required');

    mockUseHealthData.mockReturnValue({
      ...mockHealthData,
      health: {
        ...healthData,
        env: 'production',
      },
    });

    render(<HealthTab />);

    expect(screen.getByText('🟢 Production')).toBeInTheDocument();
  });

  it('should calculate memory percentage correctly', () => {
    mockUseHealthData.mockReturnValue(mockHealthData);

    render(<HealthTab />);

    // heapUsed / heapTotal * 100 = 50 / 80 * 100 = 62.5% ≈ 63%
    expect(screen.getByText(/63% of 80 MB/i)).toBeInTheDocument();
  });

  it('should handle null metrics gracefully', () => {
    mockUseHealthData.mockReturnValue({
      health: mockHealthData.health,
      metrics: null,
      loading: false,
      error: null,
    });

    render(<HealthTab />);

    // Should render without crashing
    expect(screen.getByText(/system status/i)).toBeInTheDocument();
  });

  it('should handle null health gracefully', () => {
    mockUseHealthData.mockReturnValue({
      health: null,
      metrics: mockHealthData.metrics,
      loading: false,
      error: null,
    });

    render(<HealthTab />);

    // Should render without crashing
    expect(screen.getByText(/uptime/i)).toBeInTheDocument();
  });
});
