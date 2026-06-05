/**
 * Empregol Design System — restrained radii. Tags + cards are crisp.
 * 2px tags/chips/inputs · 4px buttons/inputs · 8px cards · 12px large cards.
 * 999 pills are reserved for live status only ("AO VIVO", "NOVO · HÁ 12 MIN").
 */
export const radii = {
  none: 0,
  xs: 2, // tags, chips
  sm: 4, // buttons, inputs
  md: 8, // cards
  lg: 12, // large cards
  pill: 999, // live status only
} as const;

export type Radius = keyof typeof radii;
