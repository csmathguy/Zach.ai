import type { ThemeTokens } from './types';

export const lightThemeTokens: ThemeTokens = {
  elevation: {
    surface: '#f4f2ee',
    panel: '#ffffff',
    sunken: '#ebe7e1',
  },
  text: {
    primary: '#1c1f24',
    secondary: '#5a6472',
    accent: '#2b6b7f',
    inverted: '#ffffff',
  },
  brand: {
    heart: '#d1495b',
    brain: '#5b4e8c',
    bulb: '#f4b860',
  },
  feedback: {
    success: '#2f9f6b',
    warning: '#d7893a',
    danger: '#d84a4a',
  },
  borderRadius: '12px',
  spacingUnit: 8,
};

export const darkThemeTokens: ThemeTokens = {
  elevation: {
    surface: '#0d1116',
    panel: '#151b23',
    sunken: '#0a0d12',
  },
  text: {
    primary: '#e7ecf2',
    secondary: '#9aa6b2',
    accent: '#7cc4d8',
    inverted: '#0d1116',
  },
  brand: {
    heart: '#ff7a92',
    brain: '#9b86d6',
    bulb: '#f3c97b',
  },
  feedback: {
    success: '#3fbf7f',
    warning: '#e0a359',
    danger: '#ff6b6b',
  },
  borderRadius: '12px',
  spacingUnit: 8,
};
