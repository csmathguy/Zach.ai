import type { UtilityNavItem } from '@/app-shell/navigation/types';

const PlaceholderIcon = () => null;

export const utilityNavConfig: UtilityNavItem[] = [
  {
    id: 'health',
    label: 'Health',
    description: 'System health and metrics',
    icon: PlaceholderIcon,
    route: '/codebase-analysis?panel=health',
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    description: 'Knowledge base and docs',
    icon: PlaceholderIcon,
    route: '/knowledge',
    featureFlag: 'knowledge.placeholder',
  },
  {
    id: 'ideas',
    label: 'Ideas',
    description: 'Inbox and ideas',
    icon: PlaceholderIcon,
    route: '/ideas',
    featureFlag: 'ideas.placeholder',
  },
];
