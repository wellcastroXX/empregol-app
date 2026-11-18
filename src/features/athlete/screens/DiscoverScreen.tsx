import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState, FavoriteButton, Tag, Text } from "@/components/ui";
import { POSITIONS } from "@/constants/positions";
import { useAuth } from "@/context/AuthContext";
import { useGlobalLoading } from "@/context/GlobalLoadingContext";
import { profileService } from "@/services";
import { favoritesApi } from "@/services/api/favorites-api";
import { fontFamily, palette, radii, spacing } from "@/theme";
import type { AthleteProfile, Genero } from "@/types";
import { initials as toInitials } from "@/utils";
import {
  AthleteFilterModal,
  EMPTY_FILTERS,
  type AthleteFilters,
} from "../components";
import { MercadoScreen } from "./MercadoScreen";

/** Dark canvas tokens (contractor environment). */
const D = {
  bg: palette.tinta,
  elev: palette.tintaElev,
  fg: palette.giz,
  muted: palette.cinzaOnDark,
  rule: palette.ruleOnDark,
  accent: palette.gramado,
};

const posShort = (a: AthleteProfile) =>
  POSITIONS.find((p) => p.value === a.posicao)?.short ?? "";
const heightM = (a: AthleteProfile) => `${(a.alturaCm / 100).toFixed(2)}M`;

const SORTS = [
  { key: "gols", label: "GOLS" },
  { key: "idade", label: "IDADE" },
  { key: "altura", label: "ALTURA" },
  { key: "nome", label: "NOME" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

/** Atletas por página na lista de resultados. */
const PAGE_SIZE = 20;

/**
 * Categorias como filtro rápido.
 *
 * Antes eram acordeões no rodapé, cada um com a sua própria lista — o mesmo
 * atleta aparecia em vários, e nenhum deles conversava com a busca ou com os
 * filtros do modal. Agora são chips que recortam a lista principal, então a
 * contagem, a ordenação e a paginação valem para o que está na tela.
 *
 * "Por região" saiu: o predicado era `!!naturalidade`, que casa com quase
 * todo mundo. Recorte por local já existe em estado/cidade no modal.
 */
const CATEGORIES: {
  key: string;
  label: string;
  pred: (a: AthleteProfile) => boolean;
}[] = [
  { key: "livre", label: "LIVRES", pred: (a) => a.disponibilidade === "livre" },
  {
    key: "pro",
    label: "PRO",
    pred: (a) => a.nivel === "profissional",
  },
  { key: "amador", label: "AMADORES", pred: (a) => a.nivel === "amador" },
  { key: "base", label: "BASE", pred: (a) => a.nivel === "base" },
  { key: "masc", label: "MASCULINO", pred: (a) => a.genero === "masculino" },
  { key: "fem", label: "FEMININO", pred: (a) => a.genero === "feminino" },
];

function matches(a: AthleteProfile, f: AthleteFilters): boolean {
  if (f.generos.length && !f.generos.includes(a.genero)) return false;
  if (f.posicoes.length && !f.posicoes.includes(a.posicao)) return false;
  if (f.niveis.length && !f.niveis.includes(a.nivel)) return false;
  if (f.disponibilidade && a.disponibilidade !== f.disponibilidade)
    return false;
  if (f.idadeMin != null && a.idade < f.idadeMin) return false;
  if (f.idadeMax != null && a.idade > f.idadeMax) return false;
  if (f.alturaMinCm != null && a.alturaCm < f.alturaMinCm) return false;
  if (f.alturaMaxCm != null && a.alturaCm > f.alturaMaxCm) return false;
  if (f.pesoMin != null && a.pesoKg < f.pesoMin) return false;
  if (f.pesoMax != null && a.pesoKg > f.pesoMax) return false;
  if (f.golsMin != null && (a.stats?.gols ?? 0) < f.golsMin) return false;
  const nat = a.naturalidade.toLowerCase();
  if (f.estado?.trim() && !nat.includes(f.estado.trim().toLowerCase()))
    return false;
  if (f.cidade?.trim() && !nat.includes(f.cidade.trim().toLowerCase()))
    return false;
  return true;
}

function activeChips(
  f: AthleteFilters,
): { key: string; label: string; clear: Partial<AthleteFilters> }[] {
  const chips: {
    key: string;
    label: string;
    clear: Partial<AthleteFilters>;
  }[] = [];
  const GEN: Record<Genero, string> = {
    masculino: "MASCULINO",
    feminino: "FEMININO",
  };
  if (f.disponibilidade)
    chips.push({
      key: "disp",
      label: f.disponibilidade === "livre" ? "LIVRE" : "EMPREGADO",
      clear: { disponibilidade: undefined },
    });
  f.generos.forEach((g) =>
    chips.push({
      key: `g-${g}`,
      label: GEN[g],
      clear: { generos: f.generos.filter((x) => x !== g) },
    }),
  );
  f.posicoes.forEach((p) =>
    chips.push({
      key: `p-${p}`,
      label: POSITIONS.find((x) => x.value === p)?.short ?? p,
      clear: { posicoes: f.posicoes.filter((x) => x !== p) },
    }),
  );
  f.niveis.forEach((n) =>
    chips.push({
      key: `n-${n}`,
      label: n.toUpperCase(),
      clear: { niveis: f.niveis.filter((x) => x !== n) },
    }),
  );
  if (f.idadeMin != null || f.idadeMax != null)
    chips.push({
      key: "age",
      label: `${f.idadeMin ?? ""}-${f.idadeMax ?? ""}`,
      clear: { idadeMin: undefined, idadeMax: undefined },
    });
  if (f.golsMin != null)
    chips.push({
      key: "goals",
      label: `${f.golsMin}+ GOLS`,
      clear: { golsMin: undefined },
    });
  if (f.estado?.trim())
    chips.push({
      key: "uf",
      label: f.estado.toUpperCase(),
      clear: { estado: undefined },
    });
  if (f.cidade?.trim())
    chips.push({
      key: "city",
      label: f.cidade.toUpperCase(),
      clear: { cidade: undefined },
    });
  return chips;
}

/** Vitrine — scout view (dark) of available athletes; categorias fixas no rodapé. */
export function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { runWithGlobalLoading } = useGlobalLoading();
  const isContractor = user?.role === "contractor";

  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AthleteFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("gols");
  const [modal, setModal] = useState(false);
  const [pendingFavorites, setPendingFavorites] = useState<Set<string>>(
    new Set(),
  );
  /** Categoria rápida ativa; `null` = todas. */
  const [cat, setCat] = useState<string | null>(null);
  /** Página atual da lista de resultados, base 0. */
  const [page, setPage] = useState(0);
  /** Total real no servidor — pode ser maior que `athletes` se o teto cortou. */
  const [serverTotal, setServerTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      // Varre as páginas: as contagens das categorias são calculadas no
      // cliente, então carregar só a primeira página fazia cada aba contar
      // sobre uma amostra em vez do conjunto todo.
      profileService
        .listAllAthletes()
        .then((page) => {
          if (!active) return;
          setAthletes(page.athletes);
          setServerTotal(page.total);
        })
        .catch(() => active && setFailed(true))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, []),
  );

  const catPred = CATEGORIES.find((c) => c.key === cat)?.pred;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = athletes.filter(
      (a) =>
        (!term || a.nome.toLowerCase().includes(term)) &&
        matches(a, filters) &&
        (!catPred || catPred(a)),
    );
    const byKey: Record<SortKey, (a: AthleteProfile) => number> = {
      gols: (a) => -(a.stats?.gols ?? 0),
      idade: (a) => a.idade,
      altura: (a) => -a.alturaCm,
      nome: () => 0,
    };
    return [...list].sort((a, b) =>
      sort === "nome"
        ? a.nome.localeCompare(b.nome)
        : byKey[sort](a) - byKey[sort](b),
    );
  }, [athletes, search, filters, sort, catPred]);

  // Contagem por categoria sobre a busca e os filtros já aplicados: o número
  // no chip tem de ser o que aquele chip devolve se for tocado.
  const base = useMemo(() => {
    const term = search.trim().toLowerCase();
    return athletes.filter(
      (a) =>
        (!term || a.nome.toLowerCase().includes(term)) && matches(a, filters),
    );
  }, [athletes, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp em vez de resetar: mudar de filtro com a página 3 aberta cairia num
  // vazio, e um `setPage` dentro de efeito faria render duplo.
  const current = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(
    current * PAGE_SIZE,
    current * PAGE_SIZE + PAGE_SIZE,
  );

  const toggleFav = async (id: string) => {
    if (pendingFavorites.has(id)) return;
    setPendingFavorites((current) => new Set(current).add(id));
    try {
      const isFavorited = await runWithGlobalLoading(() =>
        favoritesApi.toggle(id),
      );
      setAthletes((current) =>
        current.map((athlete) =>
          athlete.id === id ? { ...athlete, isFavorited } : athlete,
        ),
      );
    } catch {
      Alert.alert("Não foi possível atualizar", "Tente novamente.");
    } finally {
      setPendingFavorites((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  // Atleta: a aba "explorar" é o Mercado (clubes/agências), não a vitrine de atletas.
  if (!isContractor) {
    return <MercadoScreen />;
  }

  const chips = activeChips(filters);
  const sortLabel = SORTS.find((s) => s.key === sort)!.label;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* Search row */}
        <View style={styles.searchRow}>
          <View style={styles.flBadge}>
            <Text style={styles.flText} color={palette.tinta}>
              {toInitials(user?.nome ?? "FL")}
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
          <Pressable
            style={styles.filterBtn}
            onPress={() => setModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Filtrar"
          >
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

        {/* Filtros rápidos — contagem visível em cada recorte. */}
        {!loading && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            <Pressable
              style={[styles.cat, !cat && styles.catOn]}
              onPress={() => {
                setCat(null);
                setPage(0);
              }}
              accessibilityRole="button"
            >
              <Text
                style={styles.catText}
                color={!cat ? palette.tinta : D.fg}
              >
                TODOS
              </Text>
              <Text
                style={styles.catCount}
                color={!cat ? palette.tinta : D.muted}
              >
                {base.length}
              </Text>
            </Pressable>

            {CATEGORIES.map((c) => {
              const on = cat === c.key;
              const n = base.filter(c.pred).length;
              return (
                <Pressable
                  key={c.key}
                  style={[styles.cat, on && styles.catOn]}
                  onPress={() => {
                    setCat(on ? null : c.key);
                    setPage(0);
                  }}
                  accessibilityRole="button"
                >
                  <Text
                    style={styles.catText}
                    color={on ? palette.tinta : D.fg}
                  >
                    {c.label}
                  </Text>
                  <Text
                    style={styles.catCount}
                    color={on ? palette.tinta : D.muted}
                  >
                    {n}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {chips.length > 0 && (
          <View style={styles.activeWrap}>
            <View style={styles.activeHead}>
              <Text variant="eyebrow" color={D.fg}>
                F I L T R O S · A T I V O S
              </Text>
              <Pressable
                hitSlop={8}
                onPress={() => setFilters(EMPTY_FILTERS)}
                accessibilityRole="button"
              >
                <Text variant="monoLabel" color={D.muted}>
                  LIMPAR
                </Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeChips}
            >
              {chips.map((c) => (
                <Pressable
                  key={c.key}
                  style={styles.activeChip}
                  onPress={() => setFilters((f) => ({ ...f, ...c.clear }))}
                  accessibilityRole="button"
                >
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
              {/* "de N" só quando há recorte: sem filtro e com tudo carregado,
                  repetir o mesmo número duas vezes só confunde. */}
              {filtered.length < serverTotal
                ? `DE ${serverTotal} ATLETAS`
                : "ATLETAS"}
            </Text>
          </View>
          <Pressable
            style={styles.sortBtn}
            onPress={() =>
              setSort(
                (s) =>
                  SORTS[
                    (SORTS.findIndex((x) => x.key === s) + 1) % SORTS.length
                  ].key,
              )
            }
            accessibilityRole="button"
          >
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
          <EmptyState
            icon="lock"
            title="Vitrine indisponível"
            message="Não foi possível carregar os atletas."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title="Nenhum atleta encontrado.."
            message="Ajuste a busca ou os filtros."
          />
        ) : (
          pageItems.map((a) => (
            <AthleteRow
              key={a.id}
              a={a}
              fav={a.isFavorited ?? false}
              favoritePending={pendingFavorites.has(a.id)}
              onToggleFav={() => toggleFav(a.id)}
              onPress={() => router.push(`/athletes/${a.id}`)}
            />
          ))
        )}

        {/* Paginação no rodapé da lista: é onde o leitor termina a página. Só
            aparece com mais de uma página — controle inerte confunde. */}
        {!loading && totalPages > 1 && (
          <View style={styles.pagerFoot}>
            <Pressable
              style={[styles.pagerBtn, current === 0 && styles.pagerBtnOff]}
              disabled={current === 0}
              onPress={() => setPage(current - 1)}
              accessibilityRole="button"
              accessibilityLabel="Página anterior"
            >
              <Feather
                name="chevron-left"
                size={16}
                color={current === 0 ? D.muted : D.fg}
              />
              <Text
                style={styles.pagerBtnText}
                color={current === 0 ? D.muted : D.fg}
              >
                ANTERIOR
              </Text>
            </Pressable>

            <Text style={styles.pagerLabel} color={D.muted}>
              {current + 1} / {totalPages}
            </Text>

            <Pressable
              style={[
                styles.pagerBtn,
                current >= totalPages - 1 && styles.pagerBtnOff,
              ]}
              disabled={current >= totalPages - 1}
              onPress={() => setPage(current + 1)}
              accessibilityRole="button"
              accessibilityLabel="Próxima página"
            >
              <Text
                style={styles.pagerBtnText}
                color={current >= totalPages - 1 ? D.muted : D.fg}
              >
                PRÓXIMA
              </Text>
              <Feather
                name="chevron-right"
                size={16}
                color={current >= totalPages - 1 ? D.muted : D.fg}
              />
            </Pressable>
          </View>
        )}

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
  favoritePending,
  onToggleFav,
  onPress,
}: {
  a: AthleteProfile;
  fav: boolean;
  favoritePending: boolean;
  onToggleFav: () => void;
  onPress: () => void;
}) {
  const livre = a.disponibilidade === "livre";
  const gols = a.stats?.gols ?? 0;
  const mins = a.stats?.minutosNaTemporada;
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      {a.fotoUrl ? (
        <Image
          source={{ uri: a.fotoUrl }}
          style={styles.rowPhoto}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.rowPhoto, styles.rowPhotoFallback]}>
          <Text style={styles.rowPhotoInit} color={palette.giz}>
            {toInitials(a.nome)}
          </Text>
        </View>
      )}
      <View style={styles.rowBody}>
        <View style={styles.rowNameLine}>
          <Text
            variant="smMedium"
            color={D.fg}
            numberOfLines={1}
            style={styles.rowName}
          >
            {a.nome}
          </Text>
          <Tag
            label={livre ? "LIVRE" : "EMPREGADO"}
            variant={livre ? "live" : "empregado"}
            dot={livre}
          />
        </View>
        <Text style={styles.rowMeta} color={D.muted}>
          {posShort(a)} · {a.idade} · {heightM(a)}
        </Text>
        <View style={styles.rowStats}>
          <Text style={styles.statNum} color={D.fg}>
            {gols}
            <Text style={styles.statUnit} color={D.muted}>
              {" "}
              G/24
            </Text>
          </Text>
          {mins != null && (
            <Text style={styles.statNum} color={D.fg}>
              {mins.toLocaleString("pt-BR")}'
              <Text style={styles.statUnit} color={D.muted}>
                {" "}
                MIN
              </Text>
            </Text>
          )}
        </View>
      </View>
      <FavoriteButton
        favorited={fav}
        disabled={favoritePending}
        inactiveColor={D.muted}
        onPress={onToggleFav}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: D.bg },
  scroll: { flex: 1 },
  scrollBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  flBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.xs,
    backgroundColor: palette.giz,
    alignItems: "center",
    justifyContent: "center",
  },
  flText: { fontFamily: fontFamily.displayBold, fontSize: 13 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 40,
    paddingHorizontal: spacing.md,
    backgroundColor: D.elev,
    borderWidth: 1,
    borderColor: D.rule,
    borderRadius: radii.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.text,
    fontSize: 14,
    color: D.fg,
    padding: 0,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: palette.giz,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: palette.gramado,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 9,
    fontWeight: "700",
  },

  activeWrap: { paddingTop: spacing.md, gap: spacing.sm },
  activeHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeChips: { gap: spacing.sm, paddingVertical: 2 },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.xs,
    backgroundColor: D.elev,
    borderWidth: 1,
    borderColor: D.rule,
  },
  activeChipText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1,
  },

  resultsHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  countRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
  count: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 24,
    lineHeight: 26,
    fontVariant: ["tabular-nums"],
  },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4 },

  loader: { marginVertical: spacing.xl },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: D.rule,
  },
  rowPhoto: {
    width: 58,
    height: 58,
    borderRadius: radii.sm,
    backgroundColor: D.elev,
  },
  rowPhotoFallback: { alignItems: "center", justifyContent: "center" },
  rowPhotoInit: { fontFamily: fontFamily.displayBold, fontSize: 20 },
  rowBody: { flex: 1, gap: 3 },
  rowNameLine: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowName: { flexShrink: 1 },
  rowMeta: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  rowStats: { flexDirection: "row", gap: spacing.md, marginTop: 2 },
  statNum: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  statUnit: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 9,
    letterSpacing: 0.8,
  },

  /* Paginação ─────────────────────────────────────────────────────────────── */
  // Sem borda própria: a última linha da lista já desenha a régua logo acima.
  // Com `borderTopWidth` aqui saíam duas, separadas pelo respiro.
  pagerFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.lg,
  },
  pagerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  pagerBtnOff: { opacity: 0.45 },
  pagerBtnText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1,
  },
  pagerLabel: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 11,
    letterSpacing: 1,
    fontVariant: ["tabular-nums"],
  },

  /* Filtros rápidos ───────────────────────────────────────────────────────── */
  catRow: { flexDirection: "row", gap: spacing.xs, paddingRight: spacing.lg },
  cat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: D.rule,
    backgroundColor: D.elev,
  },
  catOn: {
    backgroundColor: D.accent,
    borderColor: D.accent,
  },
  catText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1,
  },
  catCount: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
  },
});
