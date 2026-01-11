import type { UtilityNavItem } from '@/app-shell/navigation/types';

const PlaceholderIcon = () => null;

export const utilityNavConfig: UtilityNavItem[] = [
  {
    id: 'health',
    label: 'Health',
    description: 'System health and metrics',
    icon: PlaceholderIcon,
    route: '/codebase-analysis?panel=health',
    requiresRole: 'ADMIN',
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
  },
  {
    id: 'account',
    label: 'My Account',
    description: 'Update your profile details',
    icon: PlaceholderIcon,
    route: '/account',
  },
  {
    id: 'account-management',
    label: 'Account Management',
    description: 'User access and roles',
    icon: PlaceholderIcon,
    route: '/admin/accounts',
    requiresRole: 'ADMIN',
  },
];
