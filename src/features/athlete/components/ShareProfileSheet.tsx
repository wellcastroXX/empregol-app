import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

import { Text } from "@/components/ui";
import { colors, fontFamily, palette, radii, spacing } from "@/theme";
import type { AthleteProfile } from "@/types";
import { AthleteShareCard } from "./AthleteShareCard";

/** Slug do link público: "Lucas Henrique" → "lucas-henrique". */
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos combinantes
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type ShareTarget = {
  key: string;
  label: string;
  badge: string;
  bg: string;
  fg: string;
};

const TARGETS: ShareTarget[] = [
  { key: "whatsapp", label: "WHATSAPP", badge: "WA", bg: "#25D366", fg: palette.giz },
  { key: "instagram", label: "INSTAGRAM", badge: "IG", bg: "#E1306C", fg: palette.giz },
  { key: "x", label: "X\n(TWITTER)", badge: "X", bg: palette.tinta, fg: palette.giz },
  { key: "linkedin", label: "LINKEDIN", badge: "in", bg: "#0A66C2", fg: palette.giz },
];

export type ShareProfileSheetProps = {
  visible: boolean;
  onClose: () => void;
  athlete: AthleteProfile;
};

/**
 * Sheet full-height de compartilhamento. Mostra o card do atleta (formato story),
 * botões por rede e o link público. SALVAR e Instagram exportam o PNG do card
 * (via view-shot); WhatsApp/X/LinkedIn abrem o app com o link.
 */
export function ShareProfileSheet({ visible, onClose, athlete }: ShareProfileSheetProps) {
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const slug = slugify(athlete.nome) || "atleta";
  const shortLink = `empregol.com/p/${slug}`;
  const fullLink = `https://${shortLink}`;
  const shareText = `Confira o perfil de ${athlete.nome} no Empregol`;

  const capture = () =>
    captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });

  const saveToGallery = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permissão necessária", "Libere o acesso à galeria para salvar o card.");
        return;
      }
      const uri = await capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Salvo!", "O card do seu perfil foi salvo na galeria.");
    } catch {
      Alert.alert("Ops", "Não foi possível salvar o card.");
    } finally {
      setBusy(false);
    }
  };

  const shareImage = async () => {
    const uri = await capture();
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Indisponível", "Compartilhamento não disponível neste aparelho.");
      return;
    }
    await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: shareText });
  };

  const openApp = async (url: string) => {
    const ok = await Linking.canOpenURL(url).catch(() => false);
    if (ok) return Linking.openURL(url);
    return shareImage(); // fallback: compartilha a imagem pelo sistema
  };

  const onTarget = async (key: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const link = encodeURIComponent(fullLink);
      const text = encodeURIComponent(`${shareText} ${fullLink}`);
      switch (key) {
        case "instagram":
          await shareImage();
          break;
        case "whatsapp":
          await openApp(`whatsapp://send?text=${text}`);
          break;
        case "x":
          await openApp(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${link}`);
          break;
        case "linkedin":
          await openApp(`https://www.linkedin.com/sharing/share-offsite/?url=${link}`);
          break;
      }
    } catch {
      Alert.alert("Ops", "Não foi possível compartilhar.");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    await Clipboard.setStringAsync(fullLink);
    Alert.alert("Copiado", "Link do perfil copiado.");
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        {/* Header */}
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar">
            <Feather name="x" size={24} color={colors.fg} />
          </Pressable>
          <Pressable style={styles.saveBtn} onPress={saveToGallery} accessibilityRole="button">
            <Text variant="monoLabel" color={colors.fg}>
              SALVAR
            </Text>
            <Feather name="download" size={15} color={colors.fg} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Card */}
          <View style={styles.cardWrap}>
            <AthleteShareCard ref={cardRef} athlete={athlete} />
          </View>

          {/* Compartilhar em */}
          <Text variant="eyebrow" color={colors.fg} style={styles.sectionLabel}>
            C O M P A R T I L H A R · E M
          </Text>
          <View style={styles.targets}>
            {TARGETS.map((t) => (
              <Pressable
                key={t.key}
                style={styles.target}
                onPress={() => onTarget(t.key)}
                accessibilityRole="button"
                accessibilityLabel={t.label.replace("\n", " ")}
              >
                <View style={[styles.badge, { backgroundColor: t.bg }]}>
                  <Text style={styles.badgeText} color={t.fg}>
                    {t.badge}
                  </Text>
                </View>
                <Text style={styles.targetLabel} color={colors.fgMuted}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Link do perfil */}
          <View style={styles.linkBox}>
            <Text variant="eyebrow" color={colors.fgMuted} style={styles.linkEyebrow}>
              L I N K · D O · P E R F I L
            </Text>
            <View style={styles.linkRow}>
              <Feather name="link" size={18} color={colors.fgMuted} />
              <Text variant="body" color={colors.fg} style={styles.linkText} numberOfLines={2}>
                {shortLink}
              </Text>
              <Pressable style={styles.copyBtn} onPress={copyLink} accessibilityRole="button">
                <Text variant="monoLabel" color={palette.giz}>
                  COPIAR
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Link público */}
          <View style={styles.publicRow}>
            <Text variant="bodyMedium" color={colors.fg}>
              Link público
            </Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ true: palette.gramado, false: colors.rule }}
              thumbColor={palette.giz}
            />
          </View>
        </ScrollView>

        {busy && (
          <View style={styles.busy} pointerEvents="none">
            <ActivityIndicator color={colors.accent} />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["3xl"],
    gap: spacing.xl,
  },
  cardWrap: {
    width: "72%",
    alignSelf: "center",
  },
  sectionLabel: { marginBottom: -spacing.sm },
  targets: { flexDirection: "row", gap: spacing.md },
  target: { flex: 1, alignItems: "center", gap: spacing.sm },
  badge: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 72,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontFamily: fontFamily.displayBold, fontSize: 22 },
  targetLabel: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 9.5,
    letterSpacing: 1,
    textAlign: "center",
  },
  linkBox: {
    backgroundColor: palette.osso,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: spacing.lg,
    gap: spacing.md,
  },
  linkEyebrow: {},
  linkRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  linkText: { flex: 1, fontFamily: fontFamily.monoMedium },
  copyBtn: {
    backgroundColor: palette.tinta,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  publicRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  busy: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(242,239,232,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
});
