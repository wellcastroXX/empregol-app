import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { SectionHeader, Text } from "@/components/ui";
import { colors, fontFamily, palette, radii, spacing } from "@/theme";
import type { AthleteProfile } from "@/types";

function formatMinutos(min: number | undefined): string {
  if (min == null) return "—";
  return `${min.toLocaleString("pt-BR")}'`;
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
  const s = athlete.stats;
  const year = s?.ano;

  const fg = dark ? palette.giz : colors.fg;
  const muted = dark ? palette.cinzaOnDark : colors.fgMuted;

  const cells = [
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
    // {
    //   value: s?.cartoesAmarelos != null ? String(s.cartoesAmarelos) : "—",
    //   label: "AMARELOS",
    // },
    // {
    //   value: s?.cartoesVermelhos != null ? String(s.cartoesVermelhos) : "—",
    //   label: "VERMELHOS",
    // },
  ];

  return (
    <View style={styles.wrapper}>
      <SectionHeader
        eyebrow={
          year ? `E S T A T Í S T I C A S · ${year}` : "E S T A T Í S T I C A S"
        }
        dark={dark}
      />

      <View style={[styles.grid, dark && styles.gridDark]}>
        {cells.map((c) => (
          <StatCell
            key={c.label}
            value={c.value}
            label={c.label}
            fg={fg}
            muted={muted}
          />
        ))}
      </View>

      {/* Clube Atual — botão p/ Estatísticas quando onPressClube é passado */}
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
            CLUBE ATUAL
          </Text>
          <View style={styles.clubRight}>
            <Text variant="smMedium" color={fg}>
              {s?.ultimoClube || "-"}
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
});
