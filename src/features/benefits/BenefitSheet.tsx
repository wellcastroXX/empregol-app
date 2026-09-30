import { Feather } from "@expo/vector-icons";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import { fontFamily, palette, radii, spacing } from "@/theme";
import type { Benefit } from "./data";

export type BenefitSheetProps = {
  benefit: Benefit | null;
  onClose: () => void;
};

/**
 * Sheet de detalhe do benefício (80% da altura). Fundo escuro, ícone em tile
 * verde, descrição, checklist e CTA "ENTRAR EM CONTATO" — como a referência.
 */
export function BenefitSheet({ benefit, onClose }: BenefitSheetProps) {
  const insets = useSafeAreaInsets();

  const onContact = () => {
    Alert.alert(
      benefit?.title ?? "Benefício",
      "Em breve vamos te conectar com o profissional. Fica de olho!",
    );
  };

  return (
    <Modal
      visible={!!benefit}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} accessibilityLabel="Fechar" />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {benefit && (
            <>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.iconTile}>
                  <benefit.Icon color={palette.giz} size={26} />
                </View>

                <Text variant="displaySm" color={palette.giz}>
                  {benefit.title}
                  <Text variant="displaySm" color={palette.gramado}>
                    .
                  </Text>
                </Text>

                <Text variant="body" color={palette.cinzaOnDark} style={styles.description}>
                  {benefit.description}
                </Text>

                <View style={styles.divider} />

                <View style={styles.bullets}>
                  {benefit.bullets.map((b) => (
                    <View key={b} style={styles.bulletRow}>
                      <View style={styles.check}>
                        <Feather name="check" size={12} color={palette.giz} />
                      </View>
                      <Text variant="bodyMedium" color={palette.giz} style={styles.bulletText}>
                        {b}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
                <Pressable
                  style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
                  onPress={onContact}
                  accessibilityRole="button"
                >
                  <Text style={styles.ctaLabel} color={palette.giz}>
                    ENTRAR EM CONTATO
                  </Text>
                  <Feather name="chevron-right" size={18} color={palette.giz} />
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(20,20,19,0.5)", justifyContent: "flex-end" },
  backdropTap: { flex: 1 },
  sheet: {
    height: "80%",
    backgroundColor: palette.tinta,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.ruleOnDark,
    marginVertical: spacing.sm,
  },
  scroll: { flexShrink: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  iconTile: {
    width: 54,
    height: 54,
    borderRadius: radii.md,
    backgroundColor: palette.gramado,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  description: { lineHeight: 22 },
  divider: {
    height: 1,
    backgroundColor: palette.ruleOnDark,
    marginVertical: spacing.sm,
  },
  bullets: { gap: spacing.md },
  bulletRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.gramado,
    alignItems: "center",
    justifyContent: "center",
  },
  bulletText: { flex: 1 },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.ruleOnDark,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 54,
    borderRadius: radii.button,
    backgroundColor: palette.gramado,
  },
  ctaPressed: { opacity: 0.85 },
  ctaLabel: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 13,
    letterSpacing: 1,
  },
});
