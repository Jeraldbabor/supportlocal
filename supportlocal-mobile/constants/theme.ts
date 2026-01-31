/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// SupportLocal brand colors - matching website orange/amber theme
const primaryColor = '#f97316'; // Orange-500 (main brand color)
const primaryColorDark = '#fb923c'; // Orange-400 (for dark mode)
const primaryColorHover = '#ea580c'; // Orange-600 (for pressed states)

export const Colors = {
  light: {
    text: '#1f2937', // Gray-800
    textSecondary: '#6b7280', // Gray-500
    background: '#ffffff',
    backgroundSecondary: '#fffbeb', // Amber-50 (warm background)
    tint: primaryColor,
    primary: primaryColor,
    primaryHover: primaryColorHover,
    icon: '#6b7280',
    tabIconDefault: '#9ca3af', // Gray-400
    tabIconSelected: primaryColor,
    border: '#e5e7eb', // Gray-200
    error: '#dc2626', // Red-600
    success: '#059669', // Emerald-600
    warning: '#d97706', // Amber-600
    card: '#ffffff',
    cardHover: '#fffbeb', // Amber-50
    inputBackground: '#f9fafb', // Gray-50
    accent: '#fcd34d', // Amber-300
    accentLight: '#fef3c7', // Amber-100
  },
  dark: {
    text: '#f9fafb', // Gray-50
    textSecondary: '#9ca3af', // Gray-400
    background: '#111827', // Gray-900
    backgroundSecondary: '#1f2937', // Gray-800
    tint: primaryColorDark,
    primary: primaryColorDark,
    primaryHover: primaryColor,
    icon: '#9ca3af',
    tabIconDefault: '#6b7280',
    tabIconSelected: primaryColorDark,
    border: '#374151', // Gray-700
    error: '#ef4444', // Red-500
    success: '#10b981', // Emerald-500
    warning: '#f59e0b', // Amber-500
    card: '#1f2937', // Gray-800
    cardHover: '#374151', // Gray-700
    inputBackground: '#374151', // Gray-700
    accent: '#fbbf24', // Amber-400
    accentLight: '#78350f', // Amber-900
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
