import { StyleSheet, View } from 'react-native';

import { SectionHeader, Text } from '@/components/ui';
import { colors, fontFamily, radii, spacing } from '@/theme';
import type { AthleteProfile } from '@/types';

function formatMinutos(min: number | undefined): string {
  if (min == null) return '—';
  return `${min.toLocaleString('pt-BR')}'`;
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.value} color={colors.fg}>
        {value}
      </Text>
      <Text variant="monoLabel" color={colors.fgMuted}>
        {label}
      </Text>
    </View>
  );
}

/** Stat grid + clube atual — section "ESTATÍSTICAS · {ano}". */
export function AthleteStats({ athlete }: { athlete: AthleteProfile }) {
  const year = new Date().getFullYear();
  const s = athlete.stats;

  const cells = [
    { value: s?.gols != null ? String(s.gols) : '—', label: 'GOLS' },
    { value: s?.assistencias != null ? String(s.assistencias) : '—', label: 'ASSIST.' },
    { value: s?.jogosNaTemporada != null ? String(s.jogosNaTemporada) : '—', label: 'JOGOS' },
    { value: formatMinutos(s?.minutosNaTemporada), label: 'MINUTOS' },
    { value: s?.cartoesAmarelos != null ? String(s.cartoesAmarelos) : '—', label: 'AMARELOS' },
    { value: s?.cartoesVermelhos != null ? String(s.cartoesVermelhos) : '—', label: 'VERMELHOS' },
  ];

  return (
    <View style={styles.wrapper}>
      <SectionHeader eyebrow={`E S T A T Í S T I C A S · ${year}`} />

      <View style={styles.grid}>
        {cells.map((c) => (
          <StatCell key={c.label} value={c.value} label={c.label} />
        ))}
      </View>

      {/* Clube Atual */}
      <View style={styles.clubCard}>
        <Text variant="monoLabel" color={colors.fgMuted}>
          CLUBE ATUAL
        </Text>
        <Text variant="smMedium" color={colors.fg}>
          {s?.ultimoClube ?? 'Nenhum'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1.5,
    borderTopColor: colors.ruleStrong,
    paddingTop: spacing.xl,
  },
  cell: {
    width: '33.33%',
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  value: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 26,
    lineHeight: 28,
    fontVariant: ['tabular-nums'],
  },
  clubCard: {
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
