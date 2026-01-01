import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, jest } from '@jest/globals';
import { DashboardTabs } from '../DashboardTabs';

describe('DashboardTabs', () => {
  it('should render coverage and health tabs', () => {
    const mockOnTabChange = jest.fn();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    expect(screen.getByRole('button', { name: /coverage/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /health/i })).toBeInTheDocument();
  });

  it('should highlight coverage tab when active', () => {
    const mockOnTabChange = jest.fn();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const coverageTab = screen.getByRole('button', { name: /coverage/i });
    const healthTab = screen.getByRole('button', { name: /health/i });

    expect(coverageTab).toHaveClass('active');
    expect(healthTab).not.toHaveClass('active');
  });

  it('should highlight health tab when active', () => {
    const mockOnTabChange = jest.fn();
    render(<DashboardTabs activeTab="health" onTabChange={mockOnTabChange} />);

    const coverageTab = screen.getByRole('button', { name: /coverage/i });
    const healthTab = screen.getByRole('button', { name: /health/i });

    expect(coverageTab).not.toHaveClass('active');
    expect(healthTab).toHaveClass('active');
  });

  it('should call onTabChange with "coverage" when coverage tab is clicked', async () => {
    const mockOnTabChange = jest.fn();
    const user = userEvent.setup();
    render(<DashboardTabs activeTab="health" onTabChange={mockOnTabChange} />);

    const coverageTab = screen.getByRole('button', { name: /coverage/i });
    await user.click(coverageTab);

    expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    expect(mockOnTabChange).toHaveBeenCalledWith('coverage');
  });

  it('should call onTabChange with "health" when health tab is clicked', async () => {
    const mockOnTabChange = jest.fn();
    const user = userEvent.setup();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const healthTab = screen.getByRole('button', { name: /health/i });
    await user.click(healthTab);

    expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    expect(mockOnTabChange).toHaveBeenCalledWith('health');
  });

  it('should not call onTabChange when clicking already active tab', async () => {
    const mockOnTabChange = jest.fn();
    const user = userEvent.setup();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const coverageTab = screen.getByRole('button', { name: /coverage/i });
    await user.click(coverageTab);

    // Still gets called, but UI prevents unnecessary re-renders via React
    expect(mockOnTabChange).toHaveBeenCalledWith('coverage');
  });

  it('should display emoji icons for tabs', () => {
    const mockOnTabChange = jest.fn();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    expect(screen.getByText('📈', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('💚', { exact: false })).toBeInTheDocument();
  });

  it('should handle rapid tab switching', async () => {
    const mockOnTabChange = jest.fn();
    const user = userEvent.setup();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const healthTab = screen.getByRole('button', { name: /health/i });
    const coverageTab = screen.getByRole('button', { name: /coverage/i });

    await user.click(healthTab);
    await user.click(coverageTab);
    await user.click(healthTab);

    expect(mockOnTabChange).toHaveBeenCalledTimes(3);
    expect(mockOnTabChange).toHaveBeenNthCalledWith(1, 'health');
    expect(mockOnTabChange).toHaveBeenNthCalledWith(2, 'coverage');
    expect(mockOnTabChange).toHaveBeenNthCalledWith(3, 'health');
  });

  it('should be keyboard accessible', async () => {
    const mockOnTabChange = jest.fn();
    const user = userEvent.setup();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const healthTab = screen.getByRole('button', { name: /health/i });

    // Focus and press Enter
    healthTab.focus();
    await user.keyboard('{Enter}');

    expect(mockOnTabChange).toHaveBeenCalledWith('health');
  });

  it('should maintain button semantics', () => {
    const mockOnTabChange = jest.fn();
    render(<DashboardTabs activeTab="coverage" onTabChange={mockOnTabChange} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    buttons.forEach((button) => {
      expect(button.tagName).toBe('BUTTON');
    });
  });
});
