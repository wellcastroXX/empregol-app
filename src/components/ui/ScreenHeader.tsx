import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, fontFamily, fontSize, spacing } from '@/theme';
import { Text } from './Text';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Mono spaced-caps eyebrow above the title. */
  eyebrow?: string;
  /** Show a "‹ Voltar" back affordance (router.back()). */
  back?: boolean;
  /** Optional element rendered on the right. */
  right?: React.ReactNode;
};

/** Page header — optional back, spaced-caps eyebrow, display title + subtitle. */
export function ScreenHeader({ title, subtitle, eyebrow, back, right }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      {back && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={8}
          onPress={() => router.back()}
          style={styles.back}>
          <Text style={styles.backText} color={colors.fg}>
            ‹ Voltar
          </Text>
        </Pressable>
      )}
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          {!!eyebrow && (
            <Text variant="eyebrow" color={colors.fgMuted}>
              {eyebrow}
            </Text>
          )}
          <Text variant="h1" color={colors.fg}>
            {title}
          </Text>
          {!!subtitle && (
            <Text variant="sm" color={colors.fgMuted}>
              {subtitle}
            </Text>
          )}
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  back: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: fontSize.xs,
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
});
