/**
 * Empregol Design System — raios arredondados e coesos.
 * Botões usam `button` (30). Cards vão de `md` (20) a `lg` (28), conforme o tamanho.
 * Chips/tags usam `xs` (10) e inputs/controles pequenos usam `sm` (16).
 * 999 (`pill`) é reservado para status ao vivo ("AO VIVO", "NOVO · HÁ 12 MIN")
 * e para elementos perfeitamente circulares (dots, avatares, knobs).
 */
export const radii = {
  none: 0,
  xs: 10, // tags, chips
  sm: 16, // inputs, controles pequenos
  md: 20, // cards
  lg: 28, // cards grandes
  button: 30, // botões / CTAs
  pill: 999, // status ao vivo e círculos perfeitos
} as const;

export type Radius = keyof typeof radii;
