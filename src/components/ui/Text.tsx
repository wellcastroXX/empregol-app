import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, textVariants, type TextVariant } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  /** Color token (defaults to ink). */
  color?: string;
  center?: boolean;
};

/**
 * Typed text primitive. Maps an Empregol typography variant + a color token to
 * an RN `<Text>`. Use this instead of raw `<Text>` everywhere.
 */
export function Text({ variant = 'body', color = colors.fg, center, style, ...rest }: TextProps) {
  return (
    <RNText
      style={[textVariants[variant], { color }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
