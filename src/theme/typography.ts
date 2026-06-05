/**
 * Empregol Design System — typography. Three families, one job each:
 *  - Bricolage Grotesque (600) — every display headline + the wordmark.
 *  - Geist (400/500/600) — all body copy, UI labels, list rows.
 *  - Geist Mono (400/500) — every number (jersey, age, stats, IDs), every
 *    eyebrow / spaced-caps label, every tag.
 * Family keys map to names registered via `useFonts` in the root layout.
 */

export const fontFamily = {
  display: 'BricolageGrotesque_600SemiBold',
  displayBold: 'BricolageGrotesque_700Bold',
  text: 'Geist_400Regular',
  textMedium: 'Geist_500Medium',
  textSemibold: 'Geist_600SemiBold',
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
} as const;

export const fontSize = {
  displayLg: 44,
  displayMd: 36,
  displaySm: 28,
  h1: 40,
  h2: 28,
  h3: 20,
  body: 16,
  sm: 14,
  xs: 12,
  eyebrow: 11,
  tag: 10,
} as const;

/** Jersey numerals — the brand's iconic artifact (Geist Mono, tabular). */
export const jerseySize = {
  xl: 128,
  lg: 96,
  md: 64,
  sm: 32,
} as const;

/**
 * Named text styles consumed by the `Text` component variants.
 * Letter-spacing is in px (RN). Eyebrow/tag use spaced caps.
 */
export const textVariants = {
  displayLg: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.displayLg,
    lineHeight: Math.round(fontSize.displayLg * 0.95),
    letterSpacing: -0.9,
  },
  displayMd: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.displayMd,
    lineHeight: fontSize.displayMd,
    letterSpacing: -0.7,
  },
  displaySm: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.displaySm,
    lineHeight: Math.round(fontSize.displaySm * 1.05),
    letterSpacing: -0.4,
  },
  h1: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.h1,
    lineHeight: Math.round(fontSize.h1 * 1.1),
    letterSpacing: -0.6,
  },
  h2: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.h2,
    lineHeight: Math.round(fontSize.h2 * 1.15),
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: fontFamily.textSemibold,
    fontSize: fontSize.h3,
    lineHeight: Math.round(fontSize.h3 * 1.25),
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: fontFamily.text,
    fontSize: fontSize.body,
    lineHeight: Math.round(fontSize.body * 1.5),
  },
  bodyMedium: {
    fontFamily: fontFamily.textMedium,
    fontSize: fontSize.body,
    lineHeight: Math.round(fontSize.body * 1.5),
  },
  sm: {
    fontFamily: fontFamily.text,
    fontSize: fontSize.sm,
    lineHeight: Math.round(fontSize.sm * 1.45),
  },
  smMedium: {
    fontFamily: fontFamily.textMedium,
    fontSize: fontSize.sm,
    lineHeight: Math.round(fontSize.sm * 1.45),
  },
  xs: {
    fontFamily: fontFamily.text,
    fontSize: fontSize.xs,
    lineHeight: Math.round(fontSize.xs * 1.4),
  },
  /** Spaced-caps section marker (mono). e.g. "T R A J E T Ó R I A". */
  eyebrow: {
    fontFamily: fontFamily.monoMedium,
    fontSize: fontSize.eyebrow,
    lineHeight: Math.round(fontSize.eyebrow * 1.2),
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
  },
  /** Mono stat value inline (e.g. "14"). */
  mono: {
    fontFamily: fontFamily.monoMedium,
    fontSize: fontSize.sm,
    lineHeight: Math.round(fontSize.sm * 1.2),
  },
  /** Mono stat label, spaced caps (e.g. "GOLS"). */
  monoLabel: {
    fontFamily: fontFamily.monoMedium,
    fontSize: fontSize.tag,
    lineHeight: Math.round(fontSize.tag * 1.3),
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
} as const;

export type TextVariant = keyof typeof textVariants;
