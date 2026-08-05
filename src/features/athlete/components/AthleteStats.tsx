import { StyleSheet, View } from 'react-native';

import { SectionHeader, Text } from '@/components/ui';
import { colors, fontFamily, palette, radii, spacing } from '@/theme';
import type { AthleteProfile } from '@/types';

function formatMinutos(min: number | undefined): string {
  if (min == null) return '—';
  return `${min.toLocaleString('pt-BR')}'`;
}

function StatCell({ value, label, fg, muted }: { value: string; label: string; fg: string; muted: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.value} color={fg}>
        {value}
      </Text>
      <Text variant="monoLabel" color={muted}>
        {label}
      </Text>
    </View>
  );
}

/** Stat grid + clube atual — section "ESTATÍSTICAS · {ano}". */
export function AthleteStats({ athlete, showClub = true, dark = false }: { athlete: AthleteProfile; showClub?: boolean; dark?: boolean }) {
  const s = athlete.stats;
  const has = !!s;
  const year = s?.ano ?? new Date().getFullYear();

  const fg = dark ? palette.giz : colors.fg;
  const muted = dark ? palette.cinzaOnDark : colors.fgMuted;

  const cells = [
    { value: has ? String(s?.gols ?? 0) : '—', label: 'GOLS' },
    { value: has ? String(s?.assistencias ?? 0) : '—', label: 'ASSIST.' },
    { value: has ? String(s?.jogosNaTemporada ?? 0) : '—', label: 'JOGOS' },
    { value: has ? formatMinutos(s?.minutosNaTemporada ?? 0) : '—', label: 'MINUTOS' },
    { value: has ? String(s?.cartoesAmarelos ?? 0) : '—', label: 'AMARELOS' },
    { value: has ? String(s?.cartoesVermelhos ?? 0) : '—', label: 'VERMELHOS' },
  ];

  return (
    <View style={styles.wrapper}>
      <SectionHeader eyebrow={`E S T A T Í S T I C A S · ${year}`} dark={dark} />

      <View style={[styles.grid, dark && styles.gridDark]}>
        {cells.map((c) => (
          <StatCell key={c.label} value={c.value} label={c.label} fg={fg} muted={muted} />
        ))}
      </View>

      {/* Clube Atual */}
      {showClub && (
        <View style={[styles.clubCard, dark && styles.clubCardDark]}>
          <Text variant="monoLabel" color={muted}>
            CLUBE ATUAL
          </Text>
          <Text variant="smMedium" color={fg}>
            {s?.ultimoClube ?? 'Nenhum'}
          </Text>
        </View>
      )}
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
  gridDark: {
    borderTopColor: palette.cinzaOnDark,
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
  clubCardDark: {
    backgroundColor: palette.tintaElev,
    borderColor: palette.ruleOnDark,
  },
});
