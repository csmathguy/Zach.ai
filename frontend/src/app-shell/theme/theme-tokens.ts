import type { ThemeTokens } from './types';

export const lightThemeTokens: ThemeTokens = {
  elevation: {
    surface: '#f8f9fb',
    panel: '#ffffff',
    sunken: '#eef1f5',
  },
  text: {
    primary: '#0d1117',
    secondary: '#3b424d',
    accent: '#1f6feb',
    inverted: '#ffffff',
  },
  brand: {
    heart: '#ff4d6d',
    brain: '#8e44ad',
    bulb: '#f4d03f',
  },
  feedback: {
    success: '#2ecc71',
    warning: '#f39c12',
    danger: '#e74c3c',
  },
  borderRadius: '12px',
  spacingUnit: 8,
};

export const darkThemeTokens: ThemeTokens = {
  elevation: {
    surface: '#0f1115',
    panel: '#141821',
    sunken: '#0b0e12',
  },
  text: {
    primary: '#f4f6fb',
    secondary: '#c7cedb',
    accent: '#6ea8ff',
    inverted: '#0f1115',
  },
  brand: {
    heart: '#ff6b88',
    brain: '#b07ad9',
    bulb: '#f5e08a',
  },
  feedback: {
    success: '#44d07a',
    warning: '#f5b041',
    danger: '#ff6b6b',
  },
  borderRadius: '12px',
  spacingUnit: 8,
};
