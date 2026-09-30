import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import { colors, fontFamily, palette, radii, spacing } from "@/theme";
import { BenefitSheet } from "./BenefitSheet";
import { BENEFITS, type Benefit } from "./data";

/** Página de Benefícios — lista de cards; tocar abre um sheet de detalhe. */
export function BenefitsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Benefit | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => router.back()} accessibilityRole="button">
          <Feather name="chevron-left" size={24} color={colors.fg} />
        </Pressable>
        <Text variant="eyebrow" color={colors.fgMuted}>
          B E N E F Í C I O S
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Intro */}
        <View style={styles.intro}>
          <Text variant="eyebrow" color={colors.fgMuted}>
            B E N E F Í C I O S · E X C L U S I V O S
          </Text>
          <Text style={styles.title} color={palette.gramado}>
            Benefícios{"\n"}Empregol
          </Text>
          <Text variant="sm" color={colors.fgMuted}>
            Confira as nossas vantagens de quem está na vitrine da Empregol.
          </Text>
        </View>

        {/* Cards */}
        {BENEFITS.map((b) => (
          <Pressable
            key={b.key}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => setSelected(b)}
            accessibilityRole="button"
          >
            <View style={styles.cardTop}>
              <View style={styles.iconTile}>
                <b.Icon color={colors.fg} size={20} />
              </View>
              <Feather name="chevron-down" size={20} color={colors.fgMuted} />
            </View>
            <Text style={styles.cardTitle} color={colors.fg} numberOfLines={1}>
              {b.title}
            </Text>
            <Text variant="sm" color={colors.fgMuted} numberOfLines={2}>
              {b.subtitle}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <BenefitSheet benefit={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

const CARD_HEIGHT = 142;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["4xl"],
    gap: spacing.md,
  },
  intro: { gap: spacing.sm, marginBottom: spacing.sm },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  card: {
    height: CARD_HEIGHT,
    backgroundColor: colors.bgElev,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  cardPressed: { opacity: 0.75 },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: palette.osso,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    marginTop: "auto",
  },
});
