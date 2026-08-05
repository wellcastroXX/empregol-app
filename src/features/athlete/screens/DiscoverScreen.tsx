import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, Tag, Text } from '@/components/ui';
import { POSITIONS } from '@/constants/positions';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services';
import { fontFamily, palette, radii, spacing } from '@/theme';
import type { AthleteProfile, Genero } from '@/types';
import { AthleteFilterModal, EMPTY_FILTERS, type AthleteFilters } from '../components';
import { MercadoScreen } from './MercadoScreen';
import { initials as toInitials } from '@/utils';

/** Dark canvas tokens (contractor environment). */
const D = {
  bg: palette.tinta,
  elev: palette.tintaElev,
  fg: palette.giz,
  muted: palette.cinzaOnDark,
  rule: palette.ruleOnDark,
  accent: palette.gramado,
};

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

function activeChips(f: AthleteFilters): { key: string; label: string; clear: Partial<AthleteFilters> }[] {
  const chips: { key: string; label: string; clear: Partial<AthleteFilters> }[] = [];
  const GEN: Record<Genero, string> = { masculino: 'MASCULINO', feminino: 'FEMININO' };
  if (f.disponibilidade) chips.push({ key: 'disp', label: f.disponibilidade === 'livre' ? 'LIVRE' : 'EMPREGADO', clear: { disponibilidade: undefined } });
  f.generos.forEach((g) => chips.push({ key: `g-${g}`, label: GEN[g], clear: { generos: f.generos.filter((x) => x !== g) } }));
  f.posicoes.forEach((p) => chips.push({ key: `p-${p}`, label: POSITIONS.find((x) => x.value === p)?.short ?? p, clear: { posicoes: f.posicoes.filter((x) => x !== p) } }));
  f.niveis.forEach((n) => chips.push({ key: `n-${n}`, label: n.toUpperCase(), clear: { niveis: f.niveis.filter((x) => x !== n) } }));
  if (f.idadeMin != null || f.idadeMax != null) chips.push({ key: 'age', label: `${f.idadeMin ?? ''}-${f.idadeMax ?? ''}`, clear: { idadeMin: undefined, idadeMax: undefined } });
  if (f.golsMin != null) chips.push({ key: 'goals', label: `${f.golsMin}+ GOLS`, clear: { golsMin: undefined } });
  if (f.estado?.trim()) chips.push({ key: 'uf', label: f.estado.toUpperCase(), clear: { estado: undefined } });
  if (f.cidade?.trim()) chips.push({ key: 'city', label: f.cidade.toUpperCase(), clear: { cidade: undefined } });
  return chips;
}

/** Vitrine — scout view (dark) of available athletes; categorias fixas no rodapé. */
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
  const [openCat, setOpenCat] = useState<string | null>(null);

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

  // Atleta: a aba "explorar" é o Mercado (clubes/agentes), não a vitrine de atletas.
  if (!isContractor) {
    return <MercadoScreen />;
  }

  const chips = activeChips(filters);
  const sortLabel = SORTS.find((s) => s.key === sort)!.label;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Search row */}
        <View style={styles.searchRow}>
          <View style={styles.flBadge}>
            <Text style={styles.flText} color={palette.tinta}>
              {toInitials(user?.nome ?? 'FL')}
            </Text>
          </View>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color={D.muted} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar atleta · posição · status..."
              placeholderTextColor={D.muted}
            />
          </View>
          <Pressable style={styles.filterBtn} onPress={() => setModal(true)} accessibilityRole="button" accessibilityLabel="Filtrar">
            <Feather name="sliders" size={18} color={palette.tinta} />
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
              <Text variant="eyebrow" color={D.fg}>
                F I L T R O S · A T I V O S
              </Text>
              <Pressable hitSlop={8} onPress={() => setFilters(EMPTY_FILTERS)} accessibilityRole="button">
                <Text variant="monoLabel" color={D.muted}>
                  LIMPAR
                </Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeChips}>
              {chips.map((c) => (
                <Pressable key={c.key} style={styles.activeChip} onPress={() => setFilters((f) => ({ ...f, ...c.clear }))} accessibilityRole="button">
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
            <Text style={styles.count} color={D.fg}>
              {filtered.length}
            </Text>
            <Text variant="monoLabel" color={D.muted}>
              ATLETAS
            </Text>
          </View>
          <Pressable
            style={styles.sortBtn}
            onPress={() => setSort((s) => SORTS[(SORTS.findIndex((x) => x.key === s) + 1) % SORTS.length].key)}
            accessibilityRole="button">
            <Text variant="monoLabel" color={D.fg}>
              ORDENAR · {sortLabel}
            </Text>
            <Feather name="chevron-down" size={14} color={D.fg} />
          </Pressable>
        </View>

        {/* Rows */}
        {loading ? (
          <ActivityIndicator color={D.accent} style={styles.loader} />
        ) : failed ? (
          <EmptyState icon="lock" title="Vitrine indisponível" message="Não foi possível carregar os atletas." />
        ) : filtered.length === 0 ? (
          <EmptyState icon="search" title="Nenhum atleta encontrado.." message="Ajuste a busca ou os filtros." />
        ) : (
          filtered.map((a) => (
            <AthleteRow key={a.id} a={a} fav={favs.has(a.id)} onToggleFav={() => toggleFav(a.id)} onPress={() => router.push(`/athletes/${a.id}`)} />
          ))
        )}
      </ScrollView>

      {/* ── Acordeões de categoria — fixos no rodapé (design original) ── */}
      <ScrollView style={styles.dock} showsVerticalScrollIndicator={false}>
        <View style={styles.accordions}>
          {CATEGORIES.map((cat) => {
            const list = athletes.filter(cat.pred);
            const isOpen = openCat === cat.key;
            // Verde → texto creme · Creme → texto tinta.
            const fg = cat.green ? palette.giz : palette.tinta;
            const sub = cat.green ? 'rgba(251,250,245,0.65)' : 'rgba(20,20,19,0.55)';
            const divider = cat.green ? 'rgba(251,250,245,0.15)' : 'rgba(20,20,19,0.1)';
            return (
              <View key={cat.key}>
                <Pressable
                  style={[styles.accHead, cat.green ? styles.accGreen : styles.accCreme]}
                  onPress={() => setOpenCat(isOpen ? null : cat.key)}
                  accessibilityRole="button">
                  <Text style={styles.accTitle} color={fg}>
                    {cat.title}
                    <Text style={styles.accCount} color={sub}>
                      {'  '}
                      {list.length}
                    </Text>
                  </Text>
                  <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={fg} />
                </Pressable>
                {isOpen && (
                  <View style={[styles.accBody, cat.green ? styles.accGreenBody : styles.accCremeBody]}>
                    {list.length === 0 ? (
                      <Text variant="sm" color={sub} style={styles.accEmpty}>
                        Nenhum atleta nesta categoria ainda.
                      </Text>
                    ) : (
                      list.slice(0, 12).map((a) => (
                        <Pressable
                          key={a.id}
                          style={[styles.accRow, { borderTopColor: divider }]}
                          onPress={() => router.push(`/athletes/${a.id}`)}
                          accessibilityRole="button">
                          <Text style={styles.accName} color={fg} numberOfLines={1}>
                            {a.nome}
                          </Text>
                          <Text style={styles.accMeta} color={sub}>
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

function AthleteRow({ a, fav, onToggleFav, onPress }: { a: AthleteProfile; fav: boolean; onToggleFav: () => void; onPress: () => void }) {
  const livre = a.disponibilidade === 'livre';
  const gols = a.stats?.gols ?? 0;
  const mins = a.stats?.minutosNaTemporada;
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      {a.fotoUrl ? (
        <Image source={{ uri: a.fotoUrl }} style={styles.rowPhoto} contentFit="cover" />
      ) : (
        <View style={[styles.rowPhoto, styles.rowPhotoFallback]}>
          <Text style={styles.rowPhotoInit} color={palette.giz}>
            {toInitials(a.nome)}
          </Text>
        </View>
      )}
      <View style={styles.rowBody}>
        <View style={styles.rowNameLine}>
          <Text variant="smMedium" color={D.fg} numberOfLines={1} style={styles.rowName}>
            {a.nome}
          </Text>
          <Tag label={livre ? 'LIVRE' : 'EMPREGADO'} variant={livre ? 'live' : 'empregado'} dot={livre} />
        </View>
        <Text style={styles.rowMeta} color={D.muted}>
          {posShort(a)} · {a.idade} · {heightM(a)}
        </Text>
        <View style={styles.rowStats}>
          <Text style={styles.statNum} color={D.fg}>
            {gols}
            <Text style={styles.statUnit} color={D.muted}> G/24</Text>
          </Text>
          {mins != null && (
            <Text style={styles.statNum} color={D.fg}>
              {mins.toLocaleString('pt-BR')}'
              <Text style={styles.statUnit} color={D.muted}> MIN</Text>
            </Text>
          )}
        </View>
      </View>
      <Pressable hitSlop={8} onPress={onToggleFav} accessibilityRole="button" accessibilityLabel="Favoritar">
        <Feather name="star" size={20} color={fav ? D.accent : D.muted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: D.bg },
  scroll: { flex: 1 },
  scrollBody: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  flBadge: { width: 36, height: 36, borderRadius: radii.xs, backgroundColor: palette.giz, alignItems: 'center', justifyContent: 'center' },
  flText: { fontFamily: fontFamily.displayBold, fontSize: 13 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 40,
    paddingHorizontal: spacing.md,
    backgroundColor: D.elev,
    borderWidth: 1,
    borderColor: D.rule,
    borderRadius: radii.sm,
  },
  searchInput: { flex: 1, fontFamily: fontFamily.text, fontSize: 14, color: D.fg, padding: 0 },
  filterBtn: { width: 40, height: 40, borderRadius: radii.sm, backgroundColor: palette.giz, alignItems: 'center', justifyContent: 'center' },
  filterBadge: { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 3, backgroundColor: palette.gramado, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { fontFamily: fontFamily.monoMedium, fontSize: 9, fontWeight: '700' },

  activeWrap: { paddingTop: spacing.md, gap: spacing.sm },
  activeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activeChips: { gap: spacing.sm, paddingVertical: 2 },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.xs, backgroundColor: D.elev, borderWidth: 1, borderColor: D.rule },
  activeChipText: { fontFamily: fontFamily.monoMedium, fontSize: 10, letterSpacing: 1 },

  resultsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.lg, paddingBottom: spacing.sm },
  countRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  count: { fontFamily: fontFamily.monoMedium, fontSize: 24, lineHeight: 26, fontVariant: ['tabular-nums'] },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  loader: { marginVertical: spacing.xl },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: D.rule },
  rowPhoto: { width: 58, height: 58, borderRadius: radii.sm, backgroundColor: D.elev },
  rowPhotoFallback: { alignItems: 'center', justifyContent: 'center' },
  rowPhotoInit: { fontFamily: fontFamily.displayBold, fontSize: 20 },
  rowBody: { flex: 1, gap: 3 },
  rowNameLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowName: { flexShrink: 1 },
  rowMeta: { fontFamily: fontFamily.monoMedium, fontSize: 10, letterSpacing: 0.6 },
  rowStats: { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
  statNum: { fontFamily: fontFamily.monoMedium, fontSize: 13, fontVariant: ['tabular-nums'] },
  statUnit: { fontFamily: fontFamily.monoMedium, fontSize: 9, letterSpacing: 0.8 },

  // Acordeões fixos no rodapé (rolam internamente quando expandem muito)
  dock: { flexGrow: 0, maxHeight: '55%', borderTopWidth: 1, borderTopColor: D.rule },

  accordions: { backgroundColor: palette.tinta },
  accHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  accGreen: { backgroundColor: palette.gramado },
  accCreme: { backgroundColor: palette.creme },
  accTitle: { fontFamily: fontFamily.displayBold, fontSize: 18, letterSpacing: -0.2 },
  accCount: { fontFamily: fontFamily.monoMedium, fontSize: 12 },
  accBody: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: 2 },
  accGreenBody: { backgroundColor: palette.gramado },
  accCremeBody: { backgroundColor: palette.creme },
  accEmpty: { paddingVertical: spacing.sm },
  accRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(251,250,245,0.15)' },
  accName: { fontFamily: fontFamily.display, fontSize: 14, flex: 1 },
  accMeta: { fontFamily: fontFamily.monoMedium, fontSize: 10, letterSpacing: 0.6 },
});
