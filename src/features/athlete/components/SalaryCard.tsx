import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, fontFamily, spacing } from '@/theme';
import { formatCurrency } from '@/utils';

/** Base salarial pretendida — money as typography (big mono numeral). */
export function SalaryCard({ value }: { value: number }) {
  return (
    <View style={styles.block}>
      <Text variant="eyebrow" color={colors.fgMuted}>
        B A S E · S A L A R I A L
      </Text>
      <Text style={styles.value} color={colors.fg}>
        {formatCurrency(value)}
      </Text>
      <Text variant="xs" color={colors.fgMuted}>
        Pretendida em caso de vínculo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  value: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 34,
    lineHeight: 38,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
});
