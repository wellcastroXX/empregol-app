import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, EmptyState, Text } from "@/components/ui";
import {
  contractorsApi,
  type ContractorType,
  type MarketContractor,
} from "@/services/api/contractors-api";
import { colors, fontFamily, palette, radii, spacing } from "@/theme";
import { timeAgoShort } from "@/utils";

const TYPE_LABEL: Record<ContractorType, string> = {
  CLUB: "CLUBE",
  AGENT: "AGENTE",
};

const TABS: { key: "all" | ContractorType; label: string }[] = [
  { key: "all", label: "TODOS" },
  { key: "CLUB", label: "CLUBES" },
  { key: "AGENT", label: "AGENTES" },
];

/**
 * "Mercado" — explorar do atleta. Não é feed social: é o diretório profissional
 * de clubes e agentes na plataforma (o lado da demanda) — quem está aqui e quem
 * acabou de entrar. Dá ao atleta noção de exposição e oportunidade.
 */
export function MercadoScreen() {
  const [tab, setTab] = useState<"all" | ContractorType>("all");
  const [all, setAll] = useState<MarketContractor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    contractorsApi
      .explore({ type: tab === "all" ? undefined : tab })
      .then((res) => {
        if (!active) return;
        setAll(res.contractors);
        setTotal(res.total);
      })
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tab]);

  // Busca filtra localmente o que já foi carregado (sem disparar requests por tecla).
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return all;
    return all.filter((c) =>
      `${c.companyName ?? ""} ${c.name}`.toLowerCase().includes(term),
    );
  }, [all, q]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Intro */}
        <View style={styles.intro}>
          <Text variant="eyebrow" color={colors.fgMuted}>
            E X P L O R A R
          </Text>
          <Text variant="displaySm" color={colors.fg}>
            Quem está na{" "}
            <Text variant="displaySm" color={colors.accent}>
              empregol.
            </Text>
          </Text>
          <Text variant="sm" color={colors.fgMuted}>
            Clubes e agentes ativos na plataforma — o público que pode te
            encontrar.
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={colors.fgMuted} />
          <TextInput
            style={styles.searchInput}
            value={q}
            onChangeText={setQ}
            placeholder="Buscar clube ou agente..."
            placeholderTextColor={colors.fgMuted}
            autoCapitalize="none"
          />
        </View>

        {/* Type tabs */}
        <View style={styles.tabs}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text
                  style={styles.tabLabel}
                  color={active ? palette.giz : colors.fgMuted}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Count */}
        <View style={styles.countRow}>
          <Text style={styles.count} color={colors.fg}>
            {loading ? "—" : filtered.length}
          </Text>
          <Text variant="monoLabel" color={colors.fgMuted}>
            {tab === "AGENT"
              ? "AGENTES"
              : tab === "CLUB"
                ? "CLUBES"
                : "NA PLATAFORMA"}
            {!loading && total > all.length ? ` · ${total} no total` : ""}
          </Text>
        </View>

        {/* List */}
        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : failed ? (
          <EmptyState
            icon="wifi-off"
            title="Mercado indisponível"
            message="Não foi possível carregar agora."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="search"
            title="Nada por aqui ainda.."
            message={
              q
                ? "Nenhum resultado para a busca."
                : "Ainda não há clubes/agentes nesta categoria."
            }
          />
        ) : (
          <View>
            {filtered.map((c) => (
              <View key={c.id} style={styles.row}>
                <Avatar
                  name={c.companyName ?? c.name}
                  uri={c.avatarUrl ?? undefined}
                  tone="bone"
                  size={48}
                />
                <View style={styles.rowBody}>
                  <Text
                    variant="bodyMedium"
                    color={colors.fg}
                    numberOfLines={1}
                  >
                    {c.companyName ?? c.name}
                  </Text>
                  <Text variant="monoLabel" color={colors.fgMuted}>
                    {TYPE_LABEL[c.type]} · ENTROU HÁ{" "}
                    {timeAgoShort(c.createdAt).toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: "5%",
    paddingTop: spacing.sm,
    paddingBottom: spacing["4xl"],
    gap: spacing.lg,
  },
  intro: { gap: spacing.sm },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 44,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.giz,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.text,
    fontSize: 14,
    color: colors.fg,
    padding: 0,
  },
  tabs: { flexDirection: "row", gap: spacing.sm },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: palette.osso,
  },
  tabActive: { backgroundColor: palette.tinta },
  tabLabel: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 1,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.ruleStrong,
    paddingBottom: spacing.sm,
  },
  count: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 24,
    lineHeight: 26,
    fontVariant: ["tabular-nums"],
  },
  loader: { marginTop: spacing.xl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  rowBody: { flex: 1, gap: 3 },
});
