/**
 * Empregol Design System — color tokens, ported from `colors_and_type.css`.
 * "Ink on cream" — a newsprint / match-program feel. Six named tokens + tints.
 * Proportion: 60% creme · 30% tinta · 8% osso · 2% gramado. Green is the pitch,
 * used with restraint (CTAs, positive status, one accent moment per screen).
 */

export const palette = {
  /** Tinta — primary ink, text on light, dark backgrounds. */
  tinta: '#141413',
  /** Creme — neutral canvas, the default page background. */
  creme: '#F2EFE8',
  /** Gramado — pitch green, the accent (RN has no oklch; brand hex fallback). */
  gramado: '#2F8A4F',
  /** Osso — bone, support / dividers / subtle surfaces. */
  osso: '#E8E3D5',
  /** Giz — chalk, type ON tinta (off-white) + elevated card surface. */
  giz: '#FBFAF5',
  /** Cinza — ash, auxiliary text. */
  cinza: '#6B6B66',

  // Dark surface (tinta as background)
  tintaElev: '#1C1C1A',
  tintaSunken: '#0D0D0C',
  cinzaOnDark: '#9C9C95',
  ruleOnDark: '#2A2A26',

  // Status (derived from accent + ink, deliberately limited)
  empregado: '#B33A2A', // atleta empregado / sob contrato
  warn: '#C77A1A', // alerta · fim de contrato

  // Tints / scrim helpers built from the six
  tinta12: 'rgba(20, 20, 19, 0.12)',
  tinta24: 'rgba(20, 20, 19, 0.24)',
  tinta64: 'rgba(20, 20, 19, 0.64)',
  giz12: 'rgba(251, 250, 245, 0.12)',
  giz64: 'rgba(251, 250, 245, 0.64)',
} as const;

/** Semantic aliases (light surface — creme). Prefer these in components. */
export const colors = {
  // Backgrounds
  bg: palette.creme, // page canvas
  bgElev: palette.giz, // cards / elevated surfaces
  bgSunken: palette.osso, // sunken / inset wells

  // Foreground
  fg: palette.tinta,
  fgMuted: palette.cinza,
  fgOnDark: palette.giz,

  // Rules / borders
  rule: palette.osso, // hairline dividers
  ruleStrong: palette.tinta, // editorial 1.5–2px rules

  // Accent
  accent: palette.gramado,
  accentFg: palette.giz, // text ON accent

  // Status
  statusLivre: palette.gramado, // atleta livre · disponível · ao vivo
  statusEmpregado: palette.empregado,
  statusWarn: palette.warn,
  statusNeutral: palette.cinza,
} as const;
