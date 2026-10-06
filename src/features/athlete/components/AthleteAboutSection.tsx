import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui";
import { POSITIONS } from "@/constants/positions";
import { fontFamily, palette, spacing } from "@/theme";
import type { AthleteProfile } from "@/types";
import { formatCurrency } from "@/utils";

const FOOT_LABEL: Record<AthleteProfile["peDominante"], string> = {
  esquerdo: "CANHOTO",
  direito: "DESTRO",
  ambidestro: "AMBIDESTRO",
};

/** "SOBRE:" key/value summary block — mono labels, right-aligned values. */
export function AthleteAboutSection({ athlete }: { athlete: AthleteProfile }) {
  const pos = POSITIONS.find((p) => p.value === athlete.posicao);
  const altura = Number.isFinite(athlete.alturaCm)
    ? `${(athlete.alturaCm / 100).toFixed(2)} M`
    : "-";
  const secondaryPositions = athlete.posicoes
    ?.filter((position) => position !== athlete.posicao)
    .map((position) => POSITIONS.find((item) => item.value === position)?.short)
    .filter(Boolean)
    .join(" · ");
  const rows: { label: string; value: string }[] = [
    { label: "POSIÇÃO", value: (pos?.label ?? athlete.posicao).toUpperCase() },
    ...(secondaryPositions
      ? [{ label: "OUTRAS POSIÇÕES", value: secondaryPositions }]
      : []),
    {
      label: "IDADE",
      value: Number.isFinite(athlete.idade) ? `${athlete.idade} ANOS` : "-",
    },
    { label: "ALTURA", value: altura },
    {
      label: "PESO",
      value: Number.isFinite(athlete.pesoKg) ? `${athlete.pesoKg}KG` : "-",
    },
    { label: "PE DOMINANTE", value: FOOT_LABEL[athlete.peDominante] },
    {
      label: "ULTIMO CLUBE",
      value: (athlete.stats?.ultimoClube || "-").toUpperCase(),
    },
    { label: "CIDADE", value: (athlete.naturalidade || "-").toUpperCase() },
    {
      label: "STATUS",
      value: athlete.disponibilidade === "livre" ? "LIVRE" : "EMPREGADO",
    },
    {
      label: "BASE SALARIAL",
      value:
        athlete.baseSalarial > 0 ? formatCurrency(athlete.baseSalarial) : "-",
    },
    { label: "REDE SOCIAL", value: athlete.redeSocial || "-" },
  ];

  return (
    <View style={styles.wrapper}>
      <Text variant="eyebrow" color={palette.cinzaOnDark}>
        S O B R E :
      </Text>
      <View>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.label} color={palette.cinzaOnDark}>
              {row.label}:
            </Text>
            <Text style={styles.value} color={palette.giz}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
      {!!athlete.informacoesAdicionais?.trim() && (
        <View style={styles.additionalInfo}>
          <Text style={styles.label} color={palette.cinzaOnDark}>
            INFORMAÇÕES ADICIONAIS:
          </Text>
          <Text style={styles.additionalText} color={palette.giz}>
            {athlete.informacoesAdicionais.trim()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  additionalInfo: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  additionalText: {
    fontFamily: fontFamily.text,
    fontSize: 14,
    lineHeight: 21,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.ruleOnDark,
  },
  label: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  value: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 13,
    letterSpacing: 0.5,
    textAlign: "right",
    flexShrink: 1,
  },
});
