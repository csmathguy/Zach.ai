import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { UtilityNav } from '@/app-shell/navigation/UtilityNav';
import type { UtilityNavItem } from '@/app-shell/navigation/types';

const navigateMock = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom') as typeof import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

jest.mock('@/app-shell/feature-flags/featureFlags', () => ({
  isFeatureEnabled: jest.fn(() => true),
}));

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location-probe">{`${location.pathname}${location.search}`}</div>;
};

const Icon = ({ active }: { active: boolean }) => <span data-active={active ? 'yes' : 'no'} />;

const createItems = (overrides?: Partial<UtilityNavItem>[]): UtilityNavItem[] => {
  const base: UtilityNavItem[] = [
    {
      id: 'health',
      label: 'Health',
      description: 'Health panel',
      icon: Icon,
      route: '/codebase-analysis?panel=health',
    },
    {
      id: 'knowledge',
      label: 'Knowledge',
      description: 'Knowledge placeholder',
      icon: Icon,
      route: '/knowledge',
      featureFlag: 'knowledge.placeholder',
    },
    {
      id: 'ideas',
      label: 'Ideas',
      description: 'Ideas placeholder',
      icon: Icon,
      route: '/ideas',
      featureFlag: 'ideas.placeholder',
    },
  ];

  if (!overrides) {
    return base;
  }

  return base.map((item, index) => ({ ...item, ...overrides[index] }));
};

const renderNav = (items: UtilityNavItem[], initialEntries: string[] = ['/']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <UtilityNav items={items} />
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );

describe('UtilityNav', () => {
  beforeEach(() => {
    const { isFeatureEnabled } = jest.requireMock('@/app-shell/feature-flags/featureFlags') as {
      isFeatureEnabled: jest.Mock;
    };
    isFeatureEnabled.mockReturnValue(true);
    navigateMock.mockReset();
  });

  it('renders buttons with data-nav-id and labels', () => {
    renderNav(createItems());

    const health = screen.getByRole('tab', { name: 'Health' });
    expect(health).toHaveAttribute('data-nav-id', 'health');
  });

  it('routes to target when activated', async () => {
    const user = userEvent.setup();
    renderNav(createItems());

    await user.click(screen.getByRole('tab', { name: 'Knowledge' }));
    expect(navigateMock).toHaveBeenCalledWith('/knowledge');
  });

  it('omits feature-flagged items when disabled', () => {
    const { isFeatureEnabled } = jest.requireMock('@/app-shell/feature-flags/featureFlags') as {
      isFeatureEnabled: jest.Mock;
    };
    isFeatureEnabled.mockReturnValue(false);

    renderNav(createItems());
    expect(screen.queryByRole('tab', { name: 'Ideas' })).not.toBeInTheDocument();
  });

  it('fires analytics hook on activation', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const items = createItems([{ onSelect }]);

    renderNav(items);
    await user.click(screen.getByRole('tab', { name: 'Health' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('supports roving focus with arrow keys', async () => {
    const user = userEvent.setup();
    renderNav(createItems());

    const health = screen.getByRole('tab', { name: 'Health' });
    const knowledge = screen.getByRole('tab', { name: 'Knowledge' });
    health.focus();

    await user.keyboard('{ArrowRight}');
    expect(knowledge).toHaveFocus();
  });

  it('reflects active route via aria-pressed', () => {
    renderNav(createItems(), ['/knowledge']);

    const knowledge = screen.getByRole('tab', { name: 'Knowledge' });
    expect(knowledge).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not navigate when activating the already-active route', async () => {
    const user = userEvent.setup();
    renderNav(createItems(), ['/knowledge']);

    await user.click(screen.getByRole('tab', { name: 'Knowledge' }));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('renders an empty tablist when no items are provided', () => {
    renderNav([]);
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });
});
