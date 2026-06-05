import { StyleSheet, View } from 'react-native';

import { colors, palette, radii, spacing } from '@/theme';
import { Text } from './Text';

export type BannerTone = 'info' | 'success' | 'warn' | 'danger';

export type BannerProps = {
  tone?: BannerTone;
  /** Mono spaced-caps title (optional). */
  title?: string;
  message: string;
};

const TONE_COLOR: Record<BannerTone, string> = {
  info: colors.statusNeutral,
  success: colors.statusLivre,
  warn: colors.statusWarn,
  danger: colors.statusEmpregado,
};

/** Inline alert — giz surface, an editorial rule in the status color on the left. */
export function Banner({ tone = 'info', title, message }: BannerProps) {
  const accent = TONE_COLOR[tone];
  return (
    <View style={[styles.banner, { borderLeftColor: accent }]}>
      {!!title && (
        <Text variant="eyebrow" color={accent}>
          {title}
        </Text>
      )}
      <Text variant="sm" color={colors.fg}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: spacing.xs,
    padding: spacing.md,
    paddingLeft: spacing.lg,
    backgroundColor: palette.giz,
    borderWidth: 1,
    borderColor: colors.rule,
    borderLeftWidth: 2,
    borderRadius: radii.sm,
  },
});
