import type { ReactNode } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, textVariants, type TextVariant } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  /** Color token (defaults to ink). */
  color?: string;
  center?: boolean;
};

/**
 * Remove o caractere de substituição Unicode (U+FFFD "�") que aparece quando um
 * dado foi gravado com encoding quebrado — evita o "�" em qualquer tela.
 */
function clean(node: ReactNode): ReactNode {
  if (typeof node === 'string') return node.includes('�') ? node.replace(/�/g, '') : node;
  if (Array.isArray(node)) return node.map((n) => (typeof n === 'string' ? n.replace(/�/g, '') : n));
  return node;
}

/**
 * Typed text primitive. Maps an Empregol typography variant + a color token to
 * an RN `<Text>`. Use this instead of raw `<Text>` everywhere.
 */
export function Text({ variant = 'body', color = colors.fg, center, style, children, ...rest }: TextProps) {
  return (
    <RNText
      style={[textVariants[variant], { color }, center && { textAlign: 'center' }, style]}
      {...rest}>
      {clean(children)}
    </RNText>
  );
}
