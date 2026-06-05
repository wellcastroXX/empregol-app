/**
 * Empregol Design System — single theme object + `useTheme()` hook.
 * Light-mode first (canvas = creme, ink = tinta), per the brand book.
 */
import { colors, palette } from './colors';
import { radii } from './radii';
import { shadows } from './shadows';
import { spacing } from './spacing';
import { fontFamily, fontSize, jerseySize, textVariants } from './typography';

export const theme = {
  colors,
  palette,
  spacing,
  radii,
  shadows,
  fontFamily,
  fontSize,
  jerseySize,
  textVariants,
} as const;

export type Theme = typeof theme;

/** Returns the active theme. Light-only today; kept as a hook for future surfaces. */
export function useTheme(): Theme {
  return theme;
}

export { colors, palette } from './colors';
export { radii } from './radii';
export { shadows } from './shadows';
export { spacing } from './spacing';
export { fontFamily, fontSize, jerseySize, textVariants } from './typography';
export type { Radius } from './radii';
export type { Shadow } from './shadows';
export type { Spacing } from './spacing';
export type { TextVariant } from './typography';
