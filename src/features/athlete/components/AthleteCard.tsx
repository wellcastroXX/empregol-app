import { Pressable, StyleSheet, View } from 'react-native';

import { Tag, Text } from '@/components/ui';
import { POSITIONS, labelOf } from '@/constants/positions';
import { colors, fontFamily, spacing } from '@/theme';
import type { AthleteProfile } from '@/types';
import { availabilityTag } from '../badges';

/** Editorial athlete row for the Vitrine — jersey numeral · name + meta · ›. */
export function AthleteCard({
  athlete,
  onPress,
}: {
  athlete: AthleteProfile;
  onPress?: () => void;
}) {
  const availability = availabilityTag(athlete.disponibilidade);
  const pos = labelOf(POSITIONS, athlete.posicao);
  const altura = `${(athlete.alturaCm / 100).toFixed(2).replace('.', ',')}m`;
  const lastClub = athlete.stats?.ultimoClube;
  const meta = [pos, `${athlete.idade} anos`, altura, lastClub && `Ex-${lastClub}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <Text style={styles.jersey} color={colors.fg}>
        {String(athlete.numero ?? 0).padStart(2, '0')}
      </Text>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="h3" color={colors.fg} numberOfLines={1} style={styles.name}>
            {athlete.nome}
          </Text>
          <Tag label={availability.label} variant={availability.variant} />
        </View>
        <Text variant="xs" color={colors.fgMuted} numberOfLines={1}>
          {meta}
        </Text>
        <View style={styles.stats}>
          <Stat value={athlete.stats?.gols ?? 0} label="gols / 24" />
          <Stat value={athlete.stats?.jogosNaTemporada ?? 0} label="jogos" />
        </View>
      </View>

      <Text variant="h3" color={colors.fg} style={styles.chevron}>
        ›
      </Text>
    </Pressable>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="mono" color={colors.fg}>
        {value}
      </Text>
      <Text variant="monoLabel" color={colors.fgMuted}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  jersey: {
    width: 44,
    fontFamily: fontFamily.monoMedium,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  chevron: {
    paddingLeft: spacing.xs,
  },
});
