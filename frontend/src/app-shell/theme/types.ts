export type ThemePreference = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  resolvedFromSystem: boolean;
}

export interface ThemeTokens {
  elevation: {
    surface: string;
    panel: string;
    sunken: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
    inverted: string;
  };
  brand: {
    heart: string;
    brain: string;
    bulb: string;
  };
  feedback: {
    success: string;
    warning: string;
    danger: string;
  };
  borderRadius: string;
  spacingUnit: number;
}
