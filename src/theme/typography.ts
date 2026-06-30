import { TextStyle } from 'react-native';
import { defaultPalette, Palette } from './colors';

/**
 * Two-weight type scale, themed. Text color comes from the active palette so
 * dark mode flips text automatically. Build with makeTypography(palette).
 */
export function makeTypography(p: Palette) {
  return {
    // Large bold numbers for key stats
    statLg: {
      fontSize: 34,
      fontWeight: '700',
      color: p.textPrimary,
      letterSpacing: -0.5,
    } as TextStyle,
    statMd: {
      fontSize: 26,
      fontWeight: '700',
      color: p.textPrimary,
      letterSpacing: -0.3,
    } as TextStyle,

    // Headings
    h1: {
      fontSize: 28,
      fontWeight: '700',
      color: p.textPrimary,
      letterSpacing: -0.3,
    } as TextStyle,
    h2: {
      fontSize: 22,
      fontWeight: '700',
      color: p.textPrimary,
    } as TextStyle,
    h3: {
      fontSize: 17,
      fontWeight: '700',
      color: p.textPrimary,
    } as TextStyle,

    // Body
    body: {
      fontSize: 15,
      fontWeight: '400',
      color: p.textPrimary,
      lineHeight: 21,
    } as TextStyle,
    bodySecondary: {
      fontSize: 15,
      fontWeight: '400',
      color: p.textSecondary,
      lineHeight: 21,
    } as TextStyle,

    // Small
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: p.textSecondary,
    } as TextStyle,
    caption: {
      fontSize: 12,
      fontWeight: '400',
      color: p.textMuted,
    } as TextStyle,
    overline: {
      fontSize: 11,
      fontWeight: '700',
      color: p.textMuted,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    } as TextStyle,
  } as const;
}

export type Typography = ReturnType<typeof makeTypography>;
export type TypographyVariant = keyof Typography;

/** Back-compat default (beige palette). */
export const typography = makeTypography(defaultPalette);
