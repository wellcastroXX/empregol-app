import { StyleSheet, View } from 'react-native';

import { colors, palette, spacing } from '@/theme';
import { Text } from './Text';

export type SectionHeaderProps = {
  /** Spaced-caps mono eyebrow (e.g. "T R A J E T Ó R I A"). */
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** Dark canvas (contractor environment). */
  dark?: boolean;
};

/** Section marker — the brand's signature spaced-caps eyebrow over a display title. */
export function SectionHeader({ eyebrow, title, subtitle, dark }: SectionHeaderProps) {
  const fg = dark ? palette.giz : colors.fg;
  const muted = dark ? palette.cinzaOnDark : colors.fgMuted;
  return (
    <View style={styles.wrapper}>
      {!!eyebrow && (
        <Text variant="eyebrow" color={muted}>
          {eyebrow}
        </Text>
      )}
      {!!title && (
        <Text variant="h2" color={fg}>
          {title}
        </Text>
      )}
      {!!subtitle && (
        <Text variant="sm" color={muted}>
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
