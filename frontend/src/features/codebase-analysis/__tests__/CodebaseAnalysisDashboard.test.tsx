import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest } from '@jest/globals';
import { CodebaseAnalysisDashboard } from '../CodebaseAnalysisDashboard';

// Mock child components
jest.mock('../shared/DashboardTabs', () => ({
  DashboardTabs: ({
    activeTab,
    onTabChange,
  }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
  }) => (
    <div data-testid="dashboard-tabs">
      <button onClick={() => onTabChange('coverage')}>Coverage</button>
      <button onClick={() => onTabChange('health')}>Health</button>
      <span data-testid="active-tab">{activeTab}</span>
    </div>
  ),
  dashboardTabMetadata: {
    coverage: {
      icon: '📊',
      label: 'Coverage',
      labelId: 'codebase-analysis-tab-coverage',
      panelId: 'codebase-analysis-panel-coverage',
    },
    health: {
      icon: '❤️',
      label: 'Health',
      labelId: 'codebase-analysis-tab-health',
      panelId: 'codebase-analysis-panel-health',
    },
  },
}));

jest.mock('../coverage/CoverageTab', () => ({
  CoverageTab: () => <div data-testid="coverage-tab">Coverage Tab Content</div>,
}));

jest.mock('../health/HealthTab', () => ({
  HealthTab: () => <div data-testid="health-tab">Health Tab Content</div>,
}));

describe('CodebaseAnalysisDashboard', () => {
  it('should render the dashboard header', () => {
    render(<CodebaseAnalysisDashboard />);

    expect(screen.getByRole('heading', { name: /codebase analysis/i })).toBeInTheDocument();
    expect(screen.getByText('Test Coverage • API Health')).toBeInTheDocument();
  });

  it('should render the header with emoji icon', () => {
    render(<CodebaseAnalysisDashboard />);

    expect(screen.getByText('📊', { exact: false })).toBeInTheDocument();
  });

  it('should render DashboardTabs component', () => {
    render(<CodebaseAnalysisDashboard />);

    expect(screen.getByTestId('dashboard-tabs')).toBeInTheDocument();
  });

  it('should default to coverage tab', () => {
    render(<CodebaseAnalysisDashboard />);

    expect(screen.getByTestId('active-tab')).toHaveTextContent('coverage');
    expect(screen.getByTestId('coverage-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('health-tab')).not.toBeInTheDocument();
  });

  it('should switch to health tab when health is clicked', async () => {
    const user = userEvent.setup();
    render(<CodebaseAnalysisDashboard />);

    const healthButton = screen.getByRole('button', { name: /health/i });
    await user.click(healthButton);

    expect(screen.getByTestId('active-tab')).toHaveTextContent('health');
    expect(screen.getByTestId('health-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('coverage-tab')).not.toBeInTheDocument();
  });

  it('should switch back to coverage tab when coverage is clicked', async () => {
    const user = userEvent.setup();
    render(<CodebaseAnalysisDashboard />);

    // First switch to health
    const healthButton = screen.getByRole('button', { name: /health/i });
    await user.click(healthButton);
    expect(screen.getByTestId('health-tab')).toBeInTheDocument();

    // Then switch back to coverage
    const coverageButton = screen.getByRole('button', { name: /coverage/i });
    await user.click(coverageButton);

    expect(screen.getByTestId('active-tab')).toHaveTextContent('coverage');
    expect(screen.getByTestId('coverage-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('health-tab')).not.toBeInTheDocument();
  });

  it('should render only one tab content at a time', () => {
    render(<CodebaseAnalysisDashboard />);

    // Initially coverage is shown
    expect(screen.getByTestId('coverage-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('health-tab')).not.toBeInTheDocument();
  });

  it('should have proper semantic HTML structure', () => {
    render(<CodebaseAnalysisDashboard />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should pass correct props to DashboardTabs', async () => {
    const user = userEvent.setup();
    render(<CodebaseAnalysisDashboard />);

    // Verify initial state
    expect(screen.getByTestId('active-tab')).toHaveTextContent('coverage');

    // Click health and verify state changes
    await user.click(screen.getByRole('button', { name: /health/i }));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('health');
  });

  it('should handle rapid tab switching', async () => {
    const user = userEvent.setup();
    render(<CodebaseAnalysisDashboard />);

    const coverageButton = screen.getByRole('button', { name: /coverage/i });
    const healthButton = screen.getByRole('button', { name: /health/i });

    await user.click(healthButton);
    expect(screen.getByTestId('health-tab')).toBeInTheDocument();

    await user.click(coverageButton);
    expect(screen.getByTestId('coverage-tab')).toBeInTheDocument();

    await user.click(healthButton);
    expect(screen.getByTestId('health-tab')).toBeInTheDocument();

    await user.click(coverageButton);
    expect(screen.getByTestId('coverage-tab')).toBeInTheDocument();
  });

  it('should maintain tab state across re-renders', () => {
    const { rerender } = render(<CodebaseAnalysisDashboard />);

    // Verify initial state
    expect(screen.getByTestId('coverage-tab')).toBeInTheDocument();

    // Re-render
    rerender(<CodebaseAnalysisDashboard />);

    // State should persist
    expect(screen.getByTestId('coverage-tab')).toBeInTheDocument();
  });

  it('should render subtitle with bullet separator', () => {
    render(<CodebaseAnalysisDashboard />);

    const subtitle = screen.getByText('Test Coverage • API Health');
    expect(subtitle).toBeInTheDocument();
    expect(subtitle.textContent).toContain('•');
  });

  it('should have accessible heading hierarchy', () => {
    render(<CodebaseAnalysisDashboard />);

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Codebase Analysis');
  });

  it('should not render lifecycle tab (removed feature)', () => {
    render(<CodebaseAnalysisDashboard />);

    // Should only have coverage and health buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Coverage');
    expect(buttons[1]).toHaveTextContent('Health');
  });

  it('should apply correct CSS classes to container', () => {
    const { container } = render(<CodebaseAnalysisDashboard />);

    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('container');
  });

  it('should render header with correct classes', () => {
    const { container } = render(<CodebaseAnalysisDashboard />);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('header');
  });

  it('should render content area with correct classes', () => {
    const { container } = render(<CodebaseAnalysisDashboard />);

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('content');
  });
});
