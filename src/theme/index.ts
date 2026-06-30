import { colors, defaultPalette, Palette } from './colors';
import { makeTypography, typography } from './typography';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export function makeShadow(p: Palette) {
  return {
    card: {
      shadowColor: p.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    floating: {
      shadowColor: p.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 6,
    },
  } as const;
}

export type Shadow = ReturnType<typeof makeShadow>;

/** Back-compat static shadow (beige palette). */
export const shadow = makeShadow(defaultPalette);

export { colors, typography };
export type { Palette } from './colors';
export { palettes, defaultPalette, lightPalette, darkPalette } from './colors';
export type { ThemeMode } from './colors';
export { makeTypography };
export type { Typography } from './typography';
