import React, { createContext, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Palette, palettes, ThemeMode } from './colors';
import { makeTypography, Typography } from './typography';
import { makeShadow, radius, Shadow, spacing } from './index';

/** The full themed design system handed to style factories. */
export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: Palette;
  typography: Typography;
  shadow: Shadow;
  spacing: typeof spacing;
  radius: typeof radius;
}

export function buildTheme(mode: ThemeMode): Theme {
  const colors = palettes[mode];
  return {
    mode,
    isDark: mode === 'dark',
    colors,
    typography: makeTypography(colors),
    shadow: makeShadow(colors),
    spacing,
    radius,
  };
}

const ThemeContext = createContext<Theme>(buildTheme('light'));

export function ThemeProvider({
  mode,
  children,
}: {
  mode: ThemeMode;
  children: React.ReactNode;
}) {
  const theme = useMemo(() => buildTheme(mode), [mode]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Access the active theme (colors, typography, etc.) inside a component. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

/**
 * Build a StyleSheet from the active theme, memoized per palette.
 * Usage:
 *   const makeStyles = (t: Theme) => StyleSheet.create({ ... t.colors.x ... });
 *   const styles = useThemedStyles(makeStyles);
 */
export function useThemedStyles<T extends NamedStyles<T>>(factory: (t: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
