import { View, StyleSheet, type ViewProps } from 'react-native';

import { colors, radii, spacing } from '@/theme';

export type CardProps = ViewProps & {
  /** Internal padding; defaults to 16. Pass `false` for an unpadded container. */
  padded?: boolean;
};

/** Empregol card: giz (chalk) surface, 1px osso hairline border, 8px radius, flat. */
export function Card({ padded = true, style, ...rest }: CardProps) {
  return <View style={[styles.card, padded && styles.padded, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
  },
  padded: {
    padding: spacing.lg,
  },
});
