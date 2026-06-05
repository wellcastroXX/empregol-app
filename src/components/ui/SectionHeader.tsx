import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { Text } from './Text';

export type SectionHeaderProps = {
  /** Spaced-caps mono eyebrow (e.g. "T R A J E T Ó R I A"). */
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

/** Section marker — the brand's signature spaced-caps eyebrow over a display title. */
export function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.wrapper}>
      {!!eyebrow && (
        <Text variant="eyebrow" color={colors.fgMuted}>
          {eyebrow}
        </Text>
      )}
      {!!title && (
        <Text variant="h2" color={colors.fg}>
          {title}
        </Text>
      )}
      {!!subtitle && (
        <Text variant="sm" color={colors.fgMuted}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
});
