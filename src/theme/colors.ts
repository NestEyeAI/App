/**
 * Nesteye color system — three palettes selectable at runtime.
 *
 * - default: the earthy beige brand look (matches nesteye.ai)
 * - light:   cooler, whiter neutrals (less beige)
 * - dark:    deep forest dark mode
 *
 * Brand + status hues stay recognizable across palettes; the neutrals
 * (background / surface / text / border) are what change.
 */

export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  accent: string;
  forest: string;

  success: string;
  warning: string;
  danger: string;
  info: string;

  successBg: string;
  warningBg: string;
  dangerBg: string;
  infoBg: string;

  border: string;
  borderStrong: string;

  overlay: string;
  shadow: string;
}

export const defaultPalette: Palette = {
  background: '#F5F0E8',
  surface: '#FFFFFF',
  surfaceAlt: '#FBF8F2',

  textPrimary: '#3D4A35',
  textSecondary: '#5C6B4F',
  textMuted: '#7A8A6B',
  textInverse: '#FFFFFF',

  accent: '#8B7D5C',
  forest: '#3D4A35',

  success: '#2E6B3E',
  warning: '#C99A2E',
  danger: '#8B2E2E',
  info: '#5C6B4F',

  successBg: '#E6EEE7',
  warningBg: '#F7EFD9',
  dangerBg: '#F1E2E2',
  infoBg: '#ECEEE7',

  border: '#E8E4D9',
  borderStrong: '#D8D2C3',

  overlay: 'rgba(61, 74, 53, 0.45)',
  shadow: '#3D4A35',
};

export const darkPalette: Palette = {
  background: '#161C13',
  surface: '#20271C',
  surfaceAlt: '#283021',

  textPrimary: '#EDF0E8',
  textSecondary: '#BFC9B5',
  textMuted: '#8B9680',
  textInverse: '#FFFFFF',

  accent: '#C2B083',
  forest: '#5E7E63',

  success: '#5BAA6B',
  warning: '#D8B255',
  danger: '#CE6B6B',
  info: '#9FB098',

  successBg: '#1F3324',
  warningBg: '#33301D',
  dangerBg: '#33211F',
  infoBg: '#283021',

  border: '#303A29',
  borderStrong: '#3C4733',

  overlay: 'rgba(0, 0, 0, 0.55)',
  shadow: '#000000',
};

export type ThemeMode = 'light' | 'dark';

/**
 * "Light" is the beige brand palette (the default). "Dark" is the forest dark
 * mode. defaultPalette is kept as an alias of the light palette for back-compat.
 */
export const lightPalette: Palette = defaultPalette;

export const palettes: Record<ThemeMode, Palette> = {
  light: defaultPalette,
  dark: darkPalette,
};

/** Back-compat default export (the light/beige palette). */
export const colors = defaultPalette;

export type AppColor = keyof Palette;
