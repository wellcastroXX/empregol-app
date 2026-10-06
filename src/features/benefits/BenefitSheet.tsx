import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import { fontFamily, palette, radii, spacing } from "@/theme";
import type { Benefit } from "./data";

export type BenefitSheetProps = {
  benefit: Benefit | null;
  onClose: () => void;
};

/**
 * Sheet de detalhe do benefício (80% da altura). Quando o benefício tem imagem
 * do profissional, ela cobre o topo do sheet e empurra ícone, título, textos e
 * itens para baixo. Fundo escuro, checklist e CTA "ENTRAR EM CONTATO".
 */
export function BenefitSheet({ benefit, onClose }: BenefitSheetProps) {
  const insets = useSafeAreaInsets();

  const onContact = async () => {
    if (!benefit?.whatsappNumber) {
      Alert.alert(
        benefit?.title ?? "Benefício",
        "O contato deste serviço ainda não está disponível.",
      );
      return;
    }

    const message = `Olá! Vim através da Empregol e gostaria de saber mais sobre o seu atendimento de ${benefit.title}. Sou atleta cadastrado na plataforma. Pode me passar as informações e a condição especial para usuários Empregol.`;
    const url = `https://wa.me/${benefit.whatsappNumber}?text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Não foi possível abrir o WhatsApp",
        "Verifique se o WhatsApp está disponível neste aparelho.",
      );
    }
  };

  const hasImage = !!benefit?.image;

  return (
    <Modal
      visible={!!benefit}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropTap}
          onPress={onClose}
          accessibilityLabel="Fechar"
        />
        <View style={styles.sheet}>
          {benefit && (
            <>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {hasImage && (
                  <Image
                    source={benefit.image}
                    style={[
                      styles.hero,
                      benefit.key === "financeiro" && styles.financeHero,
                      benefit.key === "nutricionista" && styles.nutritionHero,
                      benefit.key === "juridico" && styles.juridicoHero,
                      benefit.key === "psicologo" && styles.psicologoHero,
                    ]}
                    contentFit="cover"
                    contentPosition={
                      benefit.key === "financeiro" ||
                      benefit.key === "nutricionista" ||
                      benefit.key === "juridico" ||
                      benefit.key === "psicologo"
                        ? "top"
                        : undefined
                    }
                  />
                )}

                <View style={[styles.body, hasImage && styles.bodyOverlap]}>
                  <View style={styles.iconTile}>
                    <benefit.Icon color={palette.giz} size={26} />
                  </View>

                  <Text variant="displaySm" color={palette.giz}>
                    {benefit.title}
                    <Text variant="displaySm" color={palette.gramado}>
                      .
                    </Text>
                  </Text>

                  <Text
                    variant="body"
                    color={palette.cinzaOnDark}
                    style={styles.description}
                  >
                    {benefit.description}
                  </Text>

                  {benefit.professional && (
                    <View style={styles.professional}>
                      <Text variant="bodyMedium" color={palette.giz}>
                        {benefit.professional.name}
                      </Text>
                      {!!benefit.professional.credential && (
                        <Text style={styles.credential} color={palette.gramado}>
                          {benefit.professional.credential}
                        </Text>
                      )}
                      {!!benefit.professional.bio && (
                        <Text
                          variant="sm"
                          color={palette.cinzaOnDark}
                          style={styles.bio}
                        >
                          {benefit.professional.bio}
                        </Text>
                      )}
                    </View>
                  )}

                  {!!benefit.bullets?.length && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.bullets}>
                        {benefit.bullets.map((b) => (
                          <View key={b} style={styles.bulletRow}>
                            <View style={styles.check}>
                              <Feather
                                name="check"
                                size={12}
                                color={palette.giz}
                              />
                            </View>
                            <Text
                              variant="bodyMedium"
                              color={palette.giz}
                              style={styles.bulletText}
                            >
                              {b}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              </ScrollView>

              {/* Handle por cima (fica visível na imagem e no fundo escuro) */}
              <View style={styles.handleWrap} pointerEvents="none">
                <View style={styles.handle} />
              </View>

              <View
                style={[
                  styles.footer,
                  { paddingBottom: insets.bottom + spacing.md },
                ]}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.cta,
                    pressed && styles.ctaPressed,
                  ]}
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
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(20,20,19,0.5)",
    justifyContent: "flex-end",
  },
  backdropTap: { flex: 1 },
  sheet: {
    height: "80%",
    backgroundColor: palette.tinta,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    overflow: "hidden",
  },
  scroll: { flexShrink: 1 },
  scrollContent: { paddingBottom: spacing.xl },
  hero: {
    width: "100%",
    height: 260,
    backgroundColor: palette.tintaElev,
  },
  financeHero: { height: 340 },
  nutritionHero: { height: 340 },
  juridicoHero: { height: 340 },
  psicologoHero: { height: 340 },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  // Sobe o conteúdo por cima da base da imagem, criando a borda arredondada.
  bodyOverlap: {
    marginTop: -22,
    backgroundColor: palette.tinta,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  handleWrap: {
    position: "absolute",
    top: spacing.sm,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(251,250,245,0.7)",
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
  professional: {
    gap: 2,
    marginTop: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.ruleOnDark,
  },
  credential: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 1,
  },
  bio: { lineHeight: 20, marginTop: spacing.xs },
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
