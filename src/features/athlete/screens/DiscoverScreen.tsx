import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, Screen, Tag, Text } from '@/components/ui';
import { POSITIONS } from '@/constants/positions';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services';
import { colors, fontFamily, palette, radii, spacing } from '@/theme';
import type { AthleteProfile, Genero } from '@/types';
import {
  AthleteFilterModal,
  EMPTY_FILTERS,
  activeFilterCount,
  type AthleteFilters,
} from '../components';
import { initials as toInitials } from '@/utils';

const posShort = (a: AthleteProfile) => POSITIONS.find((p) => p.value === a.posicao)?.short ?? '';
const heightM = (a: AthleteProfile) => `${(a.alturaCm / 100).toFixed(2)}M`;

const SORTS = [
  { key: 'gols', label: 'GOLS' },
  { key: 'idade', label: 'IDADE' },
  { key: 'altura', label: 'ALTURA' },
  { key: 'nome', label: 'NOME' },
] as const;
type SortKey = (typeof SORTS)[number]['key'];

const CATEGORIES: { key: string; title: string; green: boolean; pred: (a: AthleteProfile) => boolean }[] = [
  { key: 'masc', title: 'Atletas Masculinos', green: true, pred: (a) => a.genero === 'masculino' },
  { key: 'fem', title: 'Atletas Femininas', green: false, pred: (a) => a.genero === 'feminino' },
  { key: 'regiao', title: 'Por região', green: true, pred: (a) => !!a.naturalidade },
  { key: 'livre', title: 'Atletas Livres', green: false, pred: (a) => a.disponibilidade === 'livre' },
  { key: 'amador', title: 'Atletas Amadores', green: true, pred: (a) => a.nivel === 'amador' },
  { key: 'pro', title: 'Atletas Pro', green: false, pred: (a) => a.nivel === 'profissional' },
];

function matches(a: AthleteProfile, f: AthleteFilters): boolean {
  if (f.generos.length && !f.generos.includes(a.genero)) return false;
  if (f.posicoes.length && !f.posicoes.includes(a.posicao)) return false;
  if (f.niveis.length && !f.niveis.includes(a.nivel)) return false;
  if (f.disponibilidade && a.disponibilidade !== f.disponibilidade) return false;
  if (f.idadeMin != null && a.idade < f.idadeMin) return false;
  if (f.idadeMax != null && a.idade > f.idadeMax) return false;
  if (f.alturaMinCm != null && a.alturaCm < f.alturaMinCm) return false;
  if (f.alturaMaxCm != null && a.alturaCm > f.alturaMaxCm) return false;
  if (f.pesoMin != null && a.pesoKg < f.pesoMin) return false;
  if (f.pesoMax != null && a.pesoKg > f.pesoMax) return false;
  if (f.golsMin != null && (a.stats?.gols ?? 0) < f.golsMin) return false;
  const nat = a.naturalidade.toLowerCase();
  if (f.estado?.trim() && !nat.includes(f.estado.trim().toLowerCase())) return false;
  if (f.cidade?.trim() && !nat.includes(f.cidade.trim().toLowerCase())) return false;
  return true;
}

/** Builds the active-filter chip descriptors (label + remove patch). */
function activeChips(f: AthleteFilters): { key: string; label: string; clear: Partial<AthleteFilters> }[] {
  const chips: { key: string; label: string; clear: Partial<AthleteFilters> }[] = [];
  const GEN: Record<Genero, string> = { masculino: 'MASCULINO', feminino: 'FEMININO' };
  if (f.disponibilidade) chips.push({ key: 'disp', label: f.disponibilidade === 'livre' ? 'LIVRE' : 'EMPREGADO', clear: { disponibilidade: undefined } });
  f.generos.forEach((g) => chips.push({ key: `g-${g}`, label: GEN[g], clear: { generos: f.generos.filter((x) => x !== g) } }));
  f.posicoes.forEach((p) => chips.push({ key: `p-${p}`, label: POSITIONS.find((x) => x.value === p)?.short ?? p, clear: { posicoes: f.posicoes.filter((x) => x !== p) } }));
  f.niveis.forEach((n) => chips.push({ key: `n-${n}`, label: n.toUpperCase(), clear: { niveis: f.niveis.filter((x) => x !== n) } }));
  if (f.idadeMin != null || f.idadeMax != null) chips.push({ key: 'age', label: `${f.idadeMin ?? ''}-${f.idadeMax ?? ''}`, clear: { idadeMin: undefined, idadeMax: undefined } });
  if (f.alturaMinCm != null || f.alturaMaxCm != null) chips.push({ key: 'h', label: `${f.alturaMinCm ? (f.alturaMinCm / 100).toFixed(2) + 'M+' : ''}${f.alturaMaxCm ? ' -' + (f.alturaMaxCm / 100).toFixed(2) + 'M' : ''}`.trim(), clear: { alturaMinCm: undefined, alturaMaxCm: undefined } });
  if (f.pesoMin != null || f.pesoMax != null) chips.push({ key: 'w', label: `${f.pesoMin ?? ''}-${f.pesoMax ?? ''}KG`, clear: { pesoMin: undefined, pesoMax: undefined } });
  if (f.golsMin != null) chips.push({ key: 'goals', label: `${f.golsMin}+ GOLS`, clear: { golsMin: undefined } });
  if (f.estado?.trim()) chips.push({ key: 'uf', label: f.estado.toUpperCase(), clear: { estado: undefined } });
  if (f.cidade?.trim()) chips.push({ key: 'city', label: f.cidade.toUpperCase(), clear: { cidade: undefined } });
  return chips;
}

/** Vitrine — scout view of available athletes with a rich filter modal + category browse. */
export function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isContractor = user?.role === 'contractor';

  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<AthleteFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>('gols');
  const [modal, setModal] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    profileService
      .listAthletes()
      .then((data) => active && setAthletes(data))
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = athletes.filter((a) => (!term || a.nome.toLowerCase().includes(term)) && matches(a, filters));
    const byKey: Record<SortKey, (a: AthleteProfile) => number> = {
      gols: (a) => -(a.stats?.gols ?? 0),
      idade: (a) => a.idade,
      altura: (a) => -a.alturaCm,
      nome: () => 0,
    };
    return [...list].sort((a, b) => (sort === 'nome' ? a.nome.localeCompare(b.nome) : byKey[sort](a) - byKey[sort](b)));
  }, [athletes, search, filters, sort]);

  const toggleFav = (id: string) =>
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!isContractor) {
    return (
      <Screen>
        <EmptyState
          icon="lock"
          title="Exclusivo para clubes e agentes"
          message="A vitrine de atletas é liberada para contas de clube ou agente."
        />
      </Screen>
    );
  }

  const chips = activeChips(filters);
  const sortLabel = SORTS.find((s) => s.key === sort)!.label;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Results sheet (cream) ── */}
        <View style={styles.sheet}>
          {/* Search row */}
          <View style={styles.searchRow}>
            <View style={styles.flBadge}>
              <Text style={styles.flText} color={palette.giz}>
                {toInitials(user?.nome ?? 'FL')}
              </Text>
            </View>
            <View style={styles.searchBox}>
              <Feather name="search" size={16} color={colors.fgMuted} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar atleta · posição · status..."
                placeholderTextColor={colors.fgMuted}
              />
            </View>
            <Pressable style={styles.filterBtn} onPress={() => setModal(true)} accessibilityRole="button" accessibilityLabel="Filtrar">
              <Feather name="sliders" size={18} color={palette.giz} />
              {chips.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText} color={palette.giz}>
                    {chips.length}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Active filters */}
          {chips.length > 0 && (
            <View style={styles.activeWrap}>
              <View style={styles.activeHead}>
                <Text variant="eyebrow" color={colors.fg}>
                  F I L T R O S · A T I V O S
                </Text>
                <Pressable hitSlop={8} onPress={() => setFilters(EMPTY_FILTERS)} accessibilityRole="button">
                  <Text variant="monoLabel" color={colors.fgMuted}>
                    LIMPAR
                  </Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeChips}>
                {chips.map((c) => (
                  <Pressable
                    key={c.key}
                    style={styles.activeChip}
                    onPress={() => setFilters((f) => ({ ...f, ...c.clear }))}
                    accessibilityRole="button">
                    <Feather name="x" size={11} color={palette.giz} />
                    <Text style={styles.activeChipText} color={palette.giz}>
                      {c.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Results header */}
          <View style={styles.resultsHead}>
            <View style={styles.countRow}>
              <Text style={styles.count} color={colors.fg}>
                {filtered.length}
              </Text>
              <Text variant="monoLabel" color={colors.fgMuted}>
                ATLETAS
              </Text>
            </View>
            <Pressable
              style={styles.sortBtn}
              onPress={() => setSort((s) => SORTS[(SORTS.findIndex((x) => x.key === s) + 1) % SORTS.length].key)}
              accessibilityRole="button">
              <Text variant="monoLabel" color={colors.fg}>
                ORDENAR · {sortLabel}
              </Text>
              <Feather name="chevron-down" size={14} color={colors.fg} />
            </Pressable>
          </View>

          {/* Rows */}
          {loading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : failed ? (
            <EmptyState icon="lock" title="Vitrine indisponível" message="Não foi possível carregar os atletas." />
          ) : filtered.length === 0 ? (
            <EmptyState icon="search" title="Nenhum atleta encontrado.." message="Ajuste a busca ou os filtros." />
          ) : (
            filtered.map((a) => (
              <AthleteRow
                key={a.id}
                a={a}
                fav={favs.has(a.id)}
                onToggleFav={() => toggleFav(a.id)}
                onPress={() => router.push(`/athletes/${a.id}`)}
              />
            ))
          )}
        </View>

        {/* ── Category accordions ── */}
        <View style={styles.accordions}>
          {CATEGORIES.map((cat) => {
            const list = athletes.filter(cat.pred);
            const isOpen = open === cat.key;
            return (
              <View key={cat.key}>
                <Pressable
                  style={[styles.accHead, cat.green ? styles.accGreen : styles.accDark]}
                  onPress={() => setOpen(isOpen ? null : cat.key)}
                  accessibilityRole="button">
                  <Text style={styles.accTitle} color={palette.giz}>
                    {cat.title}
                    <Text style={styles.accCount} color="rgba(251,250,245,0.6)">
                      {'  '}{list.length}
                    </Text>
                  </Text>
                  <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={palette.giz} />
                </Pressable>
                {isOpen && (
                  <View style={[styles.accBody, cat.green ? styles.accGreenBody : styles.accDarkBody]}>
                    {list.length === 0 ? (
                      <Text variant="sm" color="rgba(251,250,245,0.7)" style={styles.accEmpty}>
                        Nenhum atleta nesta categoria ainda.
                      </Text>
                    ) : (
                      list.slice(0, 12).map((a) => (
                        <Pressable
                          key={a.id}
                          style={styles.accRow}
                          onPress={() => router.push(`/athletes/${a.id}`)}
                          accessibilityRole="button">
                          <Text style={styles.accName} color={palette.giz} numberOfLines={1}>
                            {a.nome}
                          </Text>
                          <Text style={styles.accMeta} color="rgba(251,250,245,0.7)">
                            {posShort(a)} · {a.idade}
                          </Text>
                        </Pressable>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <AthleteFilterModal
        visible={modal}
        initial={filters}
        resultCount={athletes.filter((a) => matches(a, filters)).length}
        onApply={(f) => {
          setFilters(f);
          setModal(false);
        }}
        onClose={() => setModal(false)}
      />
    </SafeAreaView>
  );
}

function AthleteRow({
  a,
  fav,
  onToggleFav,
  onPress,
}: {
  a: AthleteProfile;
  fav: boolean;
  onToggleFav: () => void;
  onPress: () => void;
}) {
  const livre = a.disponibilidade === 'livre';
  const gols = a.stats?.gols ?? 0;
  const mins = a.stats?.minutosNaTemporada;
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      {a.fotoUrl ? (
        <Image source={{ uri: a.fotoUrl }} style={styles.rowPhoto} contentFit="cover" />
      ) : (
        <View style={[styles.rowPhoto, styles.rowPhotoFallback]}>
          <Text style={styles.rowPhotoInit} color={palette.tinta}>
            {toInitials(a.nome)}
          </Text>
        </View>
      )}
      <View style={styles.rowBody}>
        <View style={styles.rowNameLine}>
          <Text variant="smMedium" color={colors.fg} numberOfLines={1} style={styles.rowName}>
            {a.nome}
          </Text>
          <Tag label={livre ? 'LIVRE' : 'EMPREGADO'} variant={livre ? 'live' : 'empregado'} dot={livre} />
        </View>
        <Text style={styles.rowMeta} color={colors.fgMuted}>
          {posShort(a)} · {a.idade} · {heightM(a)}
        </Text>
        <View style={styles.rowStats}>
          <Text style={styles.statNum} color={colors.fg}>
            {gols}
            <Text style={styles.statUnit} color={colors.fgMuted}> G/24</Text>
          </Text>
          {mins != null && (
            <Text style={styles.statNum} color={colors.fg}>
              {mins.toLocaleString('pt-BR')}'
              <Text style={styles.statUnit} color={colors.fgMuted}> MIN</Text>
            </Text>
          )}
        </View>
      </View>
      <Pressable hitSlop={8} onPress={onToggleFav} accessibilityRole="button" accessibilityLabel="Favoritar">
        <Feather name="star" size={20} color={fav ? colors.accent : colors.fgMuted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: spacing['4xl'] },

  sheet: { backgroundColor: colors.bg, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  flBadge: { width: 36, height: 36, borderRadius: radii.xs, backgroundColor: palette.tinta, alignItems: 'center', justifyContent: 'center' },
  flText: { fontFamily: fontFamily.displayBold, fontSize: 13 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 40,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.giz,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.sm,
  },
  searchInput: { flex: 1, fontFamily: fontFamily.text, fontSize: 14, color: colors.fg, padding: 0 },
  filterBtn: { width: 40, height: 40, borderRadius: radii.sm, backgroundColor: palette.tinta, alignItems: 'center', justifyContent: 'center' },
  filterBadge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 3, backgroundColor: palette.gramado, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { fontFamily: fontFamily.monoMedium, fontSize: 9, fontWeight: '700' },

  activeWrap: { paddingTop: spacing.md, gap: spacing.sm },
  activeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activeChips: { gap: spacing.sm, paddingVertical: 2 },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.xs, backgroundColor: palette.tinta },
  activeChipText: { fontFamily: fontFamily.monoMedium, fontSize: 10, letterSpacing: 1 },

  resultsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.lg, paddingBottom: spacing.sm },
  countRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  count: { fontFamily: fontFamily.monoMedium, fontSize: 24, lineHeight: 26, fontVariant: ['tabular-nums'] },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  loader: { marginVertical: spacing.xl },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.rule },
  rowPhoto: { width: 58, height: 58, borderRadius: radii.sm, backgroundColor: palette.osso },
  rowPhotoFallback: { alignItems: 'center', justifyContent: 'center' },
  rowPhotoInit: { fontFamily: fontFamily.displayBold, fontSize: 20, includeFontPadding: false },
  rowBody: { flex: 1, gap: 3 },
  rowNameLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowName: { flexShrink: 1 },
  rowMeta: { fontFamily: fontFamily.monoMedium, fontSize: 10, letterSpacing: 0.6 },
  rowStats: { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
  statNum: { fontFamily: fontFamily.monoMedium, fontSize: 13, fontVariant: ['tabular-nums'] },
  statUnit: { fontFamily: fontFamily.monoMedium, fontSize: 9, letterSpacing: 0.8 },

  accordions: { backgroundColor: palette.tinta, paddingBottom: spacing['4xl'] },
  accHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  accGreen: { backgroundColor: palette.gramado },
  accDark: { backgroundColor: palette.tinta },
  accTitle: { fontFamily: fontFamily.displayBold, fontSize: 18, letterSpacing: -0.2 },
  accCount: { fontFamily: fontFamily.monoMedium, fontSize: 12 },
  accBody: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: 2 },
  accGreenBody: { backgroundColor: palette.gramado },
  accDarkBody: { backgroundColor: palette.tinta },
  accEmpty: { paddingVertical: spacing.sm },
  accRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(251,250,245,0.15)' },
  accName: { fontFamily: fontFamily.display, fontSize: 14, flex: 1 },
  accMeta: { fontFamily: fontFamily.monoMedium, fontSize: 10, letterSpacing: 0.6 },
});
