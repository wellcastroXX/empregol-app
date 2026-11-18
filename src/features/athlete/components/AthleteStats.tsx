import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { SectionHeader, Text } from "@/components/ui";
import { colors, fontFamily, palette, radii, spacing } from "@/theme";
import type { AthleteProfile, AthleteStats as Temporada } from "@/types";

function formatMinutos(min: number | undefined): string {
  if (min == null) return "—";
  return `${min.toLocaleString("pt-BR")}'`;
}

function cellsFor(s: Temporada | undefined) {
  return [
    { value: s?.gols != null ? String(s.gols) : "—", label: "GOLS" },
    {
      value: s?.assistencias != null ? String(s.assistencias) : "—",
      label: "ASSIST.",
    },
    {
      value: s?.jogosNaTemporada != null ? String(s.jogosNaTemporada) : "—",
      label: "JOGOS",
    },
    {
      value:
        s?.minutosNaTemporada != null
          ? formatMinutos(s.minutosNaTemporada)
          : "—",
      label: "MINUTOS",
    },
    // Cartões temporariamente ocultos (amarelos/vermelhos) — manter p/ uso futuro.
  ];
}

function StatCell({
  value,
  label,
  fg,
  muted,
}: {
  value: string;
  label: string;
  fg: string;
  muted: string;
}) {
  return (
    <View style={styles.cell}>
      <Text
        style={styles.value}
        color={fg}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {value}
      </Text>
      <Text variant="monoLabel" color={muted} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Stat grid + clube atual — section "ESTATÍSTICAS · {ano}". */
export function AthleteStats({
  athlete,
  showClub = true,
  dark = false,
  onPressClube,
}: {
  athlete: AthleteProfile;
  showClub?: boolean;
  dark?: boolean;
  /** Quando presente, o card "Clube atual" vira botão (ex.: ir p/ Estatísticas). */
  onPressClube?: () => void;
}) {
  const fg = dark ? palette.giz : colors.fg;
  const muted = dark ? palette.cinzaOnDark : colors.fgMuted;

  // `temporadas` chega da mais recente para a mais antiga. Sem ela, cai no
  // `stats` de sempre — é o caso do perfil que ainda não carregou as
  // temporadas, e aí a seção se comporta exatamente como antes.
  let temporadas: Temporada[] = [];
  if (athlete.temporadas?.length) temporadas = athlete.temporadas;
  else if (athlete.stats) temporadas = [athlete.stats];

  const [page, setPage] = useState(0);
  const [width, setWidth] = useState(0);

  const ativa = temporadas[Math.min(page, temporadas.length - 1)];
  const multi = temporadas.length > 1;

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const grid = (s: Temporada | undefined, key: string | number) => (
    <View key={key} style={[styles.grid, dark && styles.gridDark, !!width && { width }]}>
      {cellsFor(s).map((c) => (
        <StatCell
          key={c.label}
          value={c.value}
          label={c.label}
          fg={fg}
          muted={muted}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <SectionHeader
        eyebrow={
          ativa?.ano
            ? `E S T A T Í S T I C A S · ${ativa.ano}`
            : "E S T A T Í S T I C A S"
        }
        dark={dark}
      />

      {multi ? (
        <View onLayout={onLayout}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            // Só rola depois de medir a largura: sem ela as páginas não têm
            // como ocupar exatamente um "snap".
            scrollEnabled={width > 0}
          >
            {temporadas.map((t, i) => grid(t, t.ano ?? i))}
          </ScrollView>

          {/* Anos como indicador: diz quantas temporadas existem e qual está
              à frente, o que uma fileira de pontos não comunicaria. */}
          <View style={styles.years}>
            {temporadas.map((t, i) => (
              <Text
                key={t.ano ?? i}
                style={styles.yearTick}
                color={i === page ? fg : muted}
              >
                {t.ano ?? "—"}
              </Text>
            ))}
          </View>
        </View>
      ) : (
        grid(temporadas[0], "single")
      )}

      {/* Clube da temporada à frente. No ano mais recente é o clube atual. */}
      {showClub && (
        <Pressable
          disabled={!onPressClube}
          onPress={onPressClube}
          accessibilityRole={onPressClube ? "button" : undefined}
          style={({ pressed }) => [
            styles.clubCard,
            dark && styles.clubCardDark,
            pressed && !!onPressClube && styles.clubPressed,
          ]}
        >
          <Text variant="monoLabel" color={muted}>
            {page === 0 ? "CLUBE ATUAL" : `CLUBE · ${ativa?.ano ?? ""}`}
          </Text>
          <View style={styles.clubRight}>
            <Text variant="smMedium" color={fg}>
              {ativa?.ultimoClube || "-"}
            </Text>
            {!!onPressClube && (
              <Feather name="chevron-right" size={18} color={muted} />
            )}
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1.5,
    borderTopColor: colors.ruleStrong,
    paddingTop: spacing.xl,
  },
  gridDark: {
    borderTopColor: palette.cinzaOnDark,
  },
  cell: {
    width: "25%",
    paddingBottom: spacing.xl,
    paddingRight: spacing.xs,
    gap: spacing.xs,
  },
  value: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 26,
    lineHeight: 28,
    fontVariant: ["tabular-nums"],
  },
  clubCard: {
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clubCardDark: {
    backgroundColor: palette.tintaElev,
    borderColor: palette.ruleOnDark,
  },
  clubPressed: {
    opacity: 0.6,
  },
  clubRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  years: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: -spacing.md,
  },
  yearTick: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1,
    fontVariant: ["tabular-nums"],
  },
});
