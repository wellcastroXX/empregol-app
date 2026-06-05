import { StyleSheet, View } from 'react-native';

import { EmptyState, SectionHeader, Text } from '@/components/ui';
import { colors, fontFamily, palette, spacing } from '@/theme';
import type { CareerEntry } from '@/types';

/** Career timeline — year + club + stats with dot-and-line left indicator. */
export function TrajetoriaSection({ entries = [] }: { entries?: CareerEntry[] }) {
  return (
    <View style={styles.wrapper}>
      <SectionHeader eyebrow="T R A J E T Ó R I A" />
      {entries.length === 0 ? (
        <EmptyState
          icon="compass"
          title="Trajetória não preenchida."
          message="Adicione seus clubes anteriores para fortalecer seu perfil."
        />
      ) : (
        <View>
          {entries.map((entry, index) => {
            const isFirst = index === 0;
            const isLast = index === entries.length - 1;
            const dotColor = isFirst ? palette.gramado : palette.cinza;
            return (
              <View key={`${entry.ano}-${entry.clube}`} style={styles.entry}>
                {/* Timeline indicator column */}
                <View style={styles.timeline}>
                  {!isFirst && <View style={styles.lineTop} />}
                  <View style={[styles.dot, { backgroundColor: dotColor }]} />
                  {!isLast && <View style={styles.lineBottom} />}
                </View>

                {/* Content */}
                <View style={styles.content}>
                  <View style={styles.row}>
                    <View style={styles.clubInfo}>
                      <Text style={styles.year} color={colors.fgMuted}>
                        {String(entry.ano)}
                      </Text>
                      <Text variant="smMedium" color={colors.fg}>
                        {entry.clube}
                      </Text>
                    </View>
                    <View style={styles.meta}>
                      {entry.minutos != null && (
                        <Text style={styles.statValue} color={colors.fgMuted}>
                          {entry.minutos.toLocaleString('pt-BR')}&apos;
                        </Text>
                      )}
                      {entry.gols != null && (
                        <Text style={styles.statLabel} color={colors.fgMuted}>
                          {entry.gols} GOLS
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const DOT_SIZE = 8;

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  entry: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeline: {
    width: DOT_SIZE + 4,
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: 1,
    zIndex: 1,
  },
  lineTop: {
    width: 2,
    flex: 0,
    height: spacing.sm,
    backgroundColor: colors.rule,
    marginBottom: 2,
  },
  lineBottom: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: colors.rule,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clubInfo: {
    gap: 2,
  },
  year: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  statValue: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
