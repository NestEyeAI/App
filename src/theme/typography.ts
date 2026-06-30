import { TextStyle } from 'react-native';
import { colors } from './colors';

/**
 * Two-weight type scale. System sans-serif by default; swap to Inter via
 * expo-font without touching call sites (keys stay the same).
 */
export const typography = {
  // Large bold numbers for key stats
  statLg: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  } as TextStyle,
  statMd: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  } as TextStyle,

  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  } as TextStyle,
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  } as TextStyle,
  h3: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  } as TextStyle,

  // Body
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 21,
  } as TextStyle,
  bodySecondary: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 21,
  } as TextStyle,

  // Small
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  } as TextStyle,
  overline: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;
