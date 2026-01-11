import type { FeatureFlagKey } from '@/app-shell/feature-flags/featureFlags';

export interface UtilityNavItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ active: boolean }>;
  route: string;
  featureFlag?: FeatureFlagKey;
  requiresRole?: 'USER' | 'ADMIN';
  onSelect?: () => void;
  target?: '_self' | '_blank';
}

export interface UtilityNavProps {
  items?: UtilityNavItem[];
}
