import { Image } from "expo-image";
import { forwardRef } from "react";
import { StyleSheet, View } from "react-native";

import { Logo, Text } from "@/components/ui";
import { POSITIONS } from "@/constants/positions";
import { fontFamily, palette, radii } from "@/theme";
import type { AthleteProfile } from "@/types";
import { initials as toInitials } from "@/utils";

const STATUS_LABEL: Record<string, string> = {
  livre: "LIVRE",
  empregado: "EMPREGADO",
};

/** Linha meta "LIVRE · ST · 27 · EX-VITÓRIA" a partir do perfil. */
function metaLine(a: AthleteProfile): string {
  const status = STATUS_LABEL[a.disponibilidade] ?? "";
  const pos = POSITIONS.find((p) => p.value === a.posicao)?.short ?? "";
  const clube = a.stats?.ultimoClube?.trim();
  return [status, pos, a.idade ? String(a.idade) : "", clube ? `EX-${clube.toUpperCase()}` : ""]
    .filter(Boolean)
    .join("  ·  ");
}

/**
 * Cartão de compartilhamento do atleta — formato story do Instagram (9:16).
 * Reutilizável: foto full-bleed, wordmark empregol no topo-esquerda,
 * EMPREGOL.COM à direita, e overlay com número, nome e meta. Renderiza como uma
 * "imagem definida" pronta para virar PNG (via react-native-view-shot).
 */
export const AthleteShareCard = forwardRef<View, { athlete: AthleteProfile }>(
  function AthleteShareCard({ athlete }, ref) {
    const meta = metaLine(athlete);
    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        {athlete.fotoUrl ? (
          <Image source={{ uri: athlete.fotoUrl }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={[styles.photo, styles.fallback]}>
            <Text style={styles.fallbackInitials} color={palette.giz64}>
              {toInitials(athlete.nome)}
            </Text>
          </View>
        )}

        {/* Scrim inferior p/ legibilidade do texto */}
        <View style={styles.scrim} pointerEvents="none" />

        {/* Topo */}
        <View style={styles.top}>
          <Logo size={14} tone="creme" />
          <Text style={styles.dotcom} color={palette.giz} numberOfLines={1}>
            EMPREGOL.CO
          </Text>
        </View>

        {/* Rodapé */}
        <View style={styles.bottom}>
          {athlete.numero != null && (
            <Text style={styles.number} color={palette.giz}>
              {String(athlete.numero).padStart(2, "0")}
            </Text>
          )}
          <Text
            style={styles.name}
            color={palette.giz}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.4}
          >
            {athlete.nome}
          </Text>
          {!!meta && (
            <Text
              style={styles.meta}
              color={palette.giz}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {meta}
            </Text>
          )}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    width: "100%",
    aspectRatio: 9 / 16, // formato story
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: palette.tinta,
  },
  photo: { width: "100%", height: "100%" },
  fallback: { alignItems: "center", justifyContent: "center" },
  fallbackInitials: { fontFamily: fontFamily.displayBold, fontSize: 96 },
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    backgroundColor: "rgba(20,20,19,0.42)",
  },
  top: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dotcom: {
    flexShrink: 1,
    fontFamily: fontFamily.monoMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    textAlign: "right",
  },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 20,
    gap: 2,
  },
  number: {
    fontFamily: fontFamily.displayBold,
    fontSize: 52,
    lineHeight: 56,
    letterSpacing: -1,
  },
  name: {
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    lineHeight: 30,
  },
  meta: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 1.6,
    marginTop: 4,
  },
});
