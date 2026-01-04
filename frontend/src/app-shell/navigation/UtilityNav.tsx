import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { isFeatureEnabled } from '@/app-shell/feature-flags/featureFlags';
import { utilityNavConfig } from '@/app-shell/navigation/utilityNavConfig';
import type { UtilityNavItem, UtilityNavProps } from '@/app-shell/navigation/types';

const filterItems = (items: UtilityNavItem[]): UtilityNavItem[] =>
  items.filter((item) => !item.featureFlag || isFeatureEnabled(item.featureFlag));

const resolveActiveIndex = (items: UtilityNavItem[], path: string): number =>
  Math.max(
    items.findIndex((item) => item.route === path),
    0
  );

const clampIndex = (items: UtilityNavItem[], index: number): number => {
  if (items.length === 0) {
    return 0;
  }
  return (index + items.length) % items.length;
};

export const UtilityNav = ({ items }: UtilityNavProps): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navItems = useMemo(() => filterItems(items ?? utilityNavConfig), [items]);
  const currentPath = `${location.pathname}${location.search}`;
  const [activeIndex, setActiveIndex] = useState(() => resolveActiveIndex(navItems, currentPath));

  useEffect(() => {
    if (navItems.length === 0) {
      return;
    }
    setActiveIndex(resolveActiveIndex(navItems, currentPath));
  }, [currentPath, navItems]);

  const focusIndex = useCallback(
    (index: number) => {
      const clamped = clampIndex(navItems, index);
      setActiveIndex(clamped);
      buttonRefs.current[clamped]?.focus();
    },
    [navItems]
  );

  const handleSelect = useCallback(
    (item: UtilityNavItem) => {
      item.onSelect?.();
      if (item.route === currentPath) {
        return;
      }
      navigate(item.route);
    },
    [currentPath, navigate]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        focusIndex(index + 1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        focusIndex(index - 1);
      }
    },
    [focusIndex]
  );

  return (
    <div aria-label="Utility navigation" data-testid="utility-nav" role="tablist">
      {navItems.map((item, index) => {
        const isActive = index === activeIndex;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            aria-pressed={isActive}
            data-nav-id={item.id}
            onClick={() => handleSelect(item)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            <Icon active={isActive} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
