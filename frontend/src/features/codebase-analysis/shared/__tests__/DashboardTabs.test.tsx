import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest } from '@jest/globals';
import { DashboardTabs } from '../DashboardTabs';

describe('DashboardTabs', () => {
  it('renders coverage and health tabs', () => {
    const mockOnTabChange = jest.fn();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    expect(screen.getByRole('tab', { name: /coverage/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /health/i })).toBeInTheDocument();
  });

  it('marks coverage tab as selected when active', () => {
    const mockOnTabChange = jest.fn();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const coverageTab = screen.getByRole('tab', { name: /coverage/i });
    const healthTab = screen.getByRole('tab', { name: /health/i });

    expect(coverageTab).toHaveAttribute('aria-selected', 'true');
    expect(healthTab).toHaveAttribute('aria-selected', 'false');
  });

  it('marks health tab as selected when active', () => {
    const mockOnTabChange = jest.fn();
    render(<DashboardTabs activeTab="health" onTabChange={mockOnTabChange} />);

    const coverageTab = screen.getByRole('tab', { name: /coverage/i });
    const healthTab = screen.getByRole('tab', { name: /health/i });

    expect(coverageTab).toHaveAttribute('aria-selected', 'false');
    expect(healthTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onTabChange with "coverage" when coverage tab is clicked', async () => {
    const mockOnTabChange = jest.fn();
    const user = userEvent.setup();
    render(<DashboardTabs activeTab="health" onTabChange={mockOnTabChange} />);

    const coverageTab = screen.getByRole('tab', { name: /coverage/i });
    await user.click(coverageTab);

    expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    expect(mockOnTabChange).toHaveBeenCalledWith('coverage');
  });

  it('calls onTabChange with "health" when health tab is clicked', async () => {
    const mockOnTabChange = jest.fn();
    const user = userEvent.setup();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const healthTab = screen.getByRole('tab', { name: /health/i });
    await user.click(healthTab);

    expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    expect(mockOnTabChange).toHaveBeenCalledWith('health');
  });

  it('still calls onTabChange when clicking the active tab', async () => {
    const mockOnTabChange = jest.fn();
    const user = userEvent.setup();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const coverageTab = screen.getByRole('tab', { name: /coverage/i });
    await user.click(coverageTab);

    expect(mockOnTabChange).toHaveBeenCalledWith('coverage');
  });

  it('renders emoji icons inside each tab', () => {
    const mockOnTabChange = jest.fn();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('handles rapid tab switches', async () => {
    const mockOnTabChange = jest.fn();
    const user = userEvent.setup();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const healthTab = screen.getByRole('tab', { name: /health/i });
    const coverageTab = screen.getByRole('tab', { name: /coverage/i });

    await user.click(healthTab);
    await user.click(coverageTab);
    await user.click(healthTab);

    expect(mockOnTabChange).toHaveBeenCalledTimes(3);
    expect(mockOnTabChange).toHaveBeenNthCalledWith(1, 'health');
    expect(mockOnTabChange).toHaveBeenNthCalledWith(2, 'coverage');
    expect(mockOnTabChange).toHaveBeenNthCalledWith(3, 'health');
  });

  it('supports keyboard activation', async () => {
    const mockOnTabChange = jest.fn();
    const user = userEvent.setup();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const healthTab = screen.getByRole('tab', { name: /health/i });
    healthTab.focus();
    await user.keyboard('{Enter}');

    expect(mockOnTabChange).toHaveBeenCalledWith('health');
  });

  it('preserves button elements while exposing tab role', () => {
    const mockOnTabChange = jest.fn();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);

    tabs.forEach((tab) => {
      expect(tab.tagName).toBe('BUTTON');
      expect(tab).toHaveAttribute('role', 'tab');
    });
  });
});
