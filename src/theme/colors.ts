/**
 * Nesteye color system — matches nesteye.ai.
 * Earthy, agricultural-tech, calm and premium.
 */
export const colors = {
  // Surfaces
  background: '#F5F0E8',
  surface: '#FFFFFF',
  surfaceAlt: '#FBF8F2',

  // Text
  textPrimary: '#3D4A35',
  textSecondary: '#5C6B4F',
  textMuted: '#7A8A6B',
  textInverse: '#FFFFFF',

  // Brand
  accent: '#8B7D5C', // gold
  forest: '#3D4A35',

  // Status
  success: '#2E6B3E',
  warning: '#C99A2E',
  danger: '#8B2E2E',
  info: '#5C6B4F',

  // Status backgrounds (soft tints for pills/badges)
  successBg: '#E6EEE7',
  warningBg: '#F7EFD9',
  dangerBg: '#F1E2E2',
  infoBg: '#ECEEE7',

  // Lines
  border: '#E8E4D9',
  borderStrong: '#D8D2C3',

  // Misc
  overlay: 'rgba(61, 74, 53, 0.45)',
  shadow: '#3D4A35',
} as const;

export type AppColor = keyof typeof colors;
