import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProgressDots, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

export type RegisterHeaderProps = {
  /** 1-based current step. */
  step: number;
  total: number;
  eyebrow: string;
  title: string;
  /** Trailing accent mark (the brand's gramado "." or ".."). */
  accentTail?: string;
  subtitle?: string;
  /** Override the back action (defaults to router.back()). */
  onBack?: () => void;
};

/** Cadastro header — "‹ VOLTAR · PASSO n/T", progress bars, eyebrow + display title. */
export function RegisterHeader({ step, total, eyebrow, title, accentTail, subtitle, onBack }: RegisterHeaderProps) {
  const router = useRouter();
  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <Pressable hitSlop={8} onPress={onBack ?? (() => router.back())} accessibilityRole="button">
          <Text variant="monoLabel" color={colors.fg}>
            ‹ VOLTAR
          </Text>
        </Pressable>
        <Text variant="monoLabel" color={colors.fgMuted}>
          PASSO · {step}/{total}
        </Text>
      </View>

      <ProgressDots total={total} current={step - 1} />

      <View style={styles.titleBlock}>
        <Text variant="eyebrow" color={colors.fgMuted}>
          {eyebrow}
        </Text>
        <Text variant="displaySm" color={colors.fg}>
          {title}
          {!!accentTail && (
            <Text variant="displaySm" color={colors.accent}>
              {accentTail}
            </Text>
          )}
        </Text>
        {!!subtitle && (
          <Text variant="sm" color={colors.fgMuted}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBlock: {
    gap: spacing.sm,
  },
});
