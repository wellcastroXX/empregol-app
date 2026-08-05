import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Tag, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { POSITIONS } from '@/constants/positions';
import { ApiError } from '@/services/api/client';
import { seasonStatsApi, type ApiSeasonStats } from '@/services/api/season-stats-api';
import { colors, fontFamily, palette, radii, spacing } from '@/theme';
import type { AthleteProfile, DominantFoot } from '@/types';
import { EstatisticaEditModal, type SeasonStat } from './EstatisticaEditModal';

const FOOT_LABEL: Record<DominantFoot, string> = {
  direito: 'DIREITO',
  esquerdo: 'ESQUERDO',
  ambidestro: 'AMBOS',
};

const FOOT_TO_API: Record<DominantFoot, 'LEFT' | 'RIGHT' | 'BOTH'> = {
  esquerdo: 'LEFT',
  direito: 'RIGHT',
  ambidestro: 'BOTH',
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 4 + i);

/** Mensagem amigável + detalhes de validação por campo (quando houver). */
function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    const fields = err.fieldErrors
      ? Object.entries(err.fieldErrors)
          .map(([k, v]) => `${k}: ${v.join(', ')}`)
          .join('\n')
      : '';
    return fields ? `${err.message}\n${fields}` : err.message;
  }
  return 'Tente novamente em instantes.';
}

function toSeasonStat(s: ApiSeasonStats): SeasonStat {
  return {
    ano: s.year,
    gols: s.goals,
    assistencias: s.assists,
    jogos: s.gamesPlayed,
    minutos: s.minutesPlayed,
    alturaCm: Math.round(s.height * 100),
    pesoKg: s.weight,
    publico: true,
    clube: s.lastClub ?? undefined,
  };
}

/** "Edite suas estatísticas Anuais" — temporadas reais do atleta + editor. */
export function EstatisticasScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const athlete = user?.role === 'athlete' ? (user as AthleteProfile) : null;

  const [seasons, setSeasons] = useState<SeasonStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SeasonStat | null>(null);

  const posShort = athlete
    ? (POSITIONS.find((p) => p.value === athlete.posicao)?.short ?? athlete.posicao.toUpperCase())
    : '';

  // Reflete no perfil (local): stats do ano mais recente + trajetória (todas as temporadas).
  // NÃO depende de `athlete.stats` — senão atualizar o perfil reentraria no useFocusEffect (loop).
  const reflectLatest = useCallback(
    (list: ApiSeasonStats[]) => {
      if (!list.length) return;
      const byYearDesc = [...list].sort((a, b) => b.year - a.year);
      const latest = byYearDesc[0];
      updateUser({
        stats: {
          ano: latest.year,
          gols: latest.goals,
          assistencias: latest.assists,
          jogosNaTemporada: latest.gamesPlayed,
          minutosNaTemporada: latest.minutesPlayed,
          ultimoClube: latest.lastClub ?? undefined,
        },
        alturaCm: Math.round(latest.height * 100),
        pesoKg: latest.weight,
        trajetoria: byYearDesc
          .filter((s) => !!s.lastClub)
          .map((s) => ({
            ano: s.year,
            clube: s.lastClub as string,
            minutos: s.minutesPlayed,
            gols: s.goals,
          })),
      });
    },
    [updateUser],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      seasonStatsApi
        .list()
        .then((list) => {
          if (!active) return;
          setSeasons(list.map(toSeasonStat));
          reflectLatest(list);
        })
        .catch(() => undefined)
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [reflectLatest]),
  );

  if (!athlete) return <SafeAreaView style={styles.safe} />;

  const footLabel = FOOT_LABEL[athlete.peDominante];

  const blankSeason = (ano: number): SeasonStat => ({
    ano,
    gols: 0,
    assistencias: 0,
    jogos: 0,
    minutos: 0,
    alturaCm: athlete.alturaCm,
    pesoKg: athlete.pesoKg,
    publico: true,
  });

  const openNew = () => {
    const used = new Set(seasons.map((s) => s.ano));
    const ano = [...YEARS].reverse().find((y) => !used.has(y)) ?? CURRENT_YEAR;
    setEditing(blankSeason(ano));
  };

  const applyEdit = async (next: SeasonStat) => {
    setEditing(null);
    try {
      await seasonStatsApi.upsert({
        year: next.ano,
        goals: next.gols,
        assists: next.assistencias,
        gamesPlayed: next.jogos,
        minutesPlayed: next.minutos,
        position: posShort,
        height: next.alturaCm / 100,
        weight: next.pesoKg,
        dominantFoot: FOOT_TO_API[athlete.peDominante],
        lastClub: next.clube?.trim() || null,
      });
      const list = await seasonStatsApi.list();
      setSeasons(list.map(toSeasonStat));
      reflectLatest(list);
    } catch (err) {
      Alert.alert('Não foi possível salvar', describeError(err));
    }
  };

  const confirmDelete = (ano: number) => {
    Alert.alert('Apagar estatística', `Remover a temporada ${ano}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            await seasonStatsApi.remove(ano);
            const list = await seasonStatsApi.list();
            setSeasons(list.map(toSeasonStat));
            if (list.length) {
              reflectLatest(list);
            } else {
              updateUser({ stats: undefined, trajetoria: [] });
            }
          } catch (err) {
            Alert.alert('Não foi possível remover', describeError(err));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.topBar}>
        <Pressable hitSlop={8} onPress={() => router.back()} accessibilityRole="button">
          <Text variant="eyebrow" color={colors.fg}>
            ‹ VOLTAR
          </Text>
        </Pressable>
        <Pressable hitSlop={8} onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.save} color={colors.fg}>
            CONCLUIR ›
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text variant="eyebrow" color={colors.fgMuted}>
            E S T A T Í S T I C A S
          </Text>
          <Text variant="displaySm" color={colors.fg}>
            Edite suas{'\n'}estatísticas <Text variant="displaySm" color={colors.accent}>Anuais.</Text>
          </Text>
          <Text variant="sm" color={colors.fgMuted}>
            Preencha cada atributo. Tua nota fica visível pros clubes — sê honesto, isso fica num registro auditável.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : (
          seasons.map((s) => (
            <View key={s.ano} style={styles.card}>
              <View style={styles.cardTop}>
                <Tag label={s.publico ? 'PÚBLICO' : 'PRIVADO'} variant={s.publico ? 'live' : 'default'} />
                <Text variant="monoLabel" color={colors.fgMuted}>
                  {(s.alturaCm / 100).toFixed(2)}M · {s.pesoKg}KG
                </Text>
              </View>

              <Text style={styles.year} color={colors.fg}>
                {s.ano}
              </Text>

              <View style={styles.grid}>
                <StatLine label="GOLS" value={String(s.gols)} />
                <StatLine label="MINUTOS" value={`${s.minutos}M`} align="right" />
                <StatLine label="POSIÇÃO" value={posShort} />
                <StatLine label="PÉ" value={footLabel} align="right" />
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => confirmDelete(s.ano)}
                  accessibilityRole="button"
                  accessibilityLabel="Apagar"
                  style={({ pressed }) => [styles.deleteBtn, pressed && styles.btnPressed]}>
                  <Feather name="trash-2" size={16} color={palette.giz} />
                  <Text style={styles.deleteLabel} color={palette.giz}>
                    APAGAR
                  </Text>
                </Pressable>
                <View style={styles.editBtn}>
                  <Button label="EDITAR" chevron fullWidth onPress={() => setEditing(s)} />
                </View>
              </View>
            </View>
          ))
        )}

        {/* Add new */}
        {!loading && (
          <Pressable
            onPress={openNew}
            accessibilityRole="button"
            style={({ pressed }) => [styles.addCard, pressed && styles.btnPressed]}>
            <Feather name="plus" size={22} color={colors.accent} />
            <Text variant="smMedium" color={colors.fg}>
              Adicionar Nova Estatística
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <EstatisticaEditModal
        visible={editing != null}
        initial={editing ?? seasons[0] ?? blankSeason(CURRENT_YEAR)}
        onApply={applyEdit}
        onClose={() => setEditing(null)}
      />
    </SafeAreaView>
  );
}

function StatLine({ label, value, align }: { label: string; value: string; align?: 'right' }) {
  return (
    <View style={[styles.statLine, align === 'right' && styles.statLineRight]}>
      <Text style={styles.statText} color={colors.fgMuted}>
        {label}:{' '}
        <Text style={styles.statText} color={colors.fg}>
          {value}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: spacing.md,
  },
  save: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 13,
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
  content: {
    paddingHorizontal: '5%',
    paddingBottom: spacing['4xl'],
    gap: spacing.xl,
  },
  intro: {
    gap: spacing.md,
  },
  loader: {
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  year: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 48,
    lineHeight: 50,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
  },
  statLine: {
    width: '50%',
  },
  statLineRight: {
    alignItems: 'flex-end',
  },
  statText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingTop: spacing.lg,
  },
  deleteBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.sm,
    backgroundColor: palette.empregado,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  deleteLabel: {
    fontFamily: fontFamily.textMedium,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  editBtn: {
    flex: 1,
  },
  btnPressed: {
    opacity: 0.7,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['2xl'],
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: palette.gramado,
  },
});
