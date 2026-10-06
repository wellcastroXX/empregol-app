import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RNShare, { Social } from "react-native-share";
import Svg, { Path } from "react-native-svg";
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

type ShareTargetKey = "whatsapp" | "instagram" | "x" | "linkedin";

type ShareTarget = {
  key: ShareTargetKey;
  label: string;
  bg: string;
  fg: string;
};

const TARGETS: ShareTarget[] = [
  { key: "whatsapp", label: "WHATSAPP", bg: "#25D366", fg: palette.creme },
  { key: "instagram", label: "INSTAGRAM", bg: "#E1306C", fg: palette.creme },
  { key: "x", label: "X\n(TWITTER)", bg: palette.tinta, fg: palette.giz },
  { key: "linkedin", label: "LINKEDIN", bg: "#0A66C2", fg: palette.creme },
];

const SOCIAL_ICON_PATHS: Record<ShareTargetKey, string> = {
  whatsapp:
    "M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1H319.9C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1ZM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7ZM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5Z",
  instagram:
    "M320.3 205C256.8 204.8 205.2 256.2 205 319.7C204.8 383.2 256.2 434.8 319.7 435C383.2 435.2 434.8 383.8 435 320.3C435.2 256.8 383.8 205.2 320.3 205ZM319.7 245.4C360.9 245.2 394.4 278.5 394.6 319.7C394.8 360.9 361.5 394.4 320.3 394.6C279.1 394.8 245.6 361.5 245.4 320.3C245.2 279.1 278.5 245.6 319.7 245.4ZM413.1 200.3C413.1 185.5 425.1 173.5 439.9 173.5C454.7 173.5 466.7 185.5 466.7 200.3C466.7 215.1 454.7 227.1 439.9 227.1C425.1 227.1 413.1 215.1 413.1 200.3ZM542.8 227.5C541.1 191.6 532.9 159.8 506.6 133.6C480.4 107.4 448.6 99.2002 412.7 97.4002C375.7 95.3002 264.8 95.3002 227.8 97.4002C192 99.1002 160.2 107.3 133.9 133.5C107.6 159.7 99.5 191.5 97.7 227.4C95.6 264.4 95.6 375.3 97.7 412.3C99.4 448.2 107.6 480 133.9 506.2C160.2 532.4 191.9 540.6 227.8 542.4C264.8 544.5 375.7 544.5 412.7 542.4C448.6 540.7 480.4 532.5 506.6 506.2C532.8 480 541 448.2 542.8 412.3C544.9 375.3 544.9 264.5 542.8 227.5ZM495 452C487.2 471.6 472.1 486.7 452.4 494.6C422.9 506.3 352.9 503.6 320.3 503.6C287.7 503.6 217.6 506.2 188.2 494.6C168.6 486.8 153.5 471.7 145.6 452C133.9 422.5 136.6 352.5 136.6 319.9C136.6 287.3 134 217.2 145.6 187.8C153.4 168.2 168.5 153.1 188.2 145.2C217.7 133.5 287.7 136.2 320.3 136.2C352.9 136.2 423 133.6 452.4 145.2C472 153 487.1 168.1 495 187.8C506.7 217.3 504 287.3 504 319.9C504 352.5 506.7 422.6 495 452Z",
  x: "M453.2 112H523.8L369.6 288.2L551 528H409L297.7 382.6L170.5 528H99.7998L264.7 339.5L90.7998 112H236.4L336.9 244.9L453.2 112ZM428.4 485.8H467.5L215.1 152H173.1L428.4 485.8Z",
  linkedin:
    "M512 96H127.9C110.3 96 96 110.5 96 128.3V511.7C96 529.5 110.3 544 127.9 544H512C529.6 544 544 529.5 544 511.7V128.3C544 110.5 529.6 96 512 96ZM231.4 480H165V266.2H231.5V480H231.4ZM198.2 160C219.5 160 236.7 177.2 236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160ZM480.3 480H413.9V376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2V480H273.1V266.2H336.8V295.4H337.7C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8V480Z",
};

function SocialIcon({
  target,
  color,
}: {
  target: ShareTargetKey;
  color: string;
}) {
  return (
    <Svg width={38} height={38} viewBox="0 0 640 640" fill="none">
      <Path d={SOCIAL_ICON_PATHS[target]} fill={color} />
    </Svg>
  );
}

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
export function ShareProfileSheet({
  visible,
  onClose,
  athlete,
}: ShareProfileSheetProps) {
  const insets = useSafeAreaInsets();
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const slug = slugify(athlete.nome) || "atleta";
  const shortLink = `empregol.co/p/${slug}`;
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
        Alert.alert(
          "Permissão necessária",
          "Libere o acesso à galeria para salvar o card.",
        );
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

  const shareMessage = `${shareText}\n${fullLink}`;

  /** Fallback universal: share sheet do sistema com imagem + link no texto. */
  const shareViaSheet = async (uri?: string) => {
    const fileUri = uri ?? (await capture());
    try {
      await RNShare.open({
        url: fileUri,
        type: "image/png",
        filename: "empregol-atleta.png",
        message: shareMessage,
        failOnCancel: false,
      });
    } catch {
      // último recurso: expo Sharing (imagem apenas)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "image/png",
          dialogTitle: shareText,
        });
      }
    }
  };

  /** Compartilha o card (imagem) + link do atleta numa rede específica. */
  const shareToSocial = async (
    social: Exclude<Social, Social.FacebookStories | Social.InstagramStories>,
  ) => {
    const uri = await capture();
    try {
      await RNShare.shareSingle({
        social,
        url: uri,
        type: "image/png",
        filename: "empregol-atleta.png",
        message: shareMessage,
      });
    } catch {
      await shareViaSheet(uri);
    }
  };

  /**
   * Story do Instagram: card como fundo (com.instagram.sharedSticker.backgroundImage)
   * + sticker de link p/ o perfil (linkUrl → com.instagram.sharedSticker.linkStickerUrl).
   * Se o IG recusar o link, o fundo continua indo normalmente; se falhar de vez,
   * cai no share sheet do sistema (imagem + link no texto).
   */
  const shareToInstagramStory = async () => {
    try {
      const base64 = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: "base64",
      });
      await RNShare.shareSingle({
        social: Social.InstagramStories,
        appId: "com.empregol",
        backgroundImage: `data:image/png;base64,${base64}`,
        linkUrl: fullLink,
        linkText: "Ver perfil",
      });
      return;
    } catch {
      // cai no fallback abaixo (share sheet do sistema)
    }
    await shareViaSheet();
  };

  const onTarget = async (key: string) => {
    if (busy) return;
    setBusy(true);
    try {
      switch (key) {
        case "instagram":
          await shareToInstagramStory();
          break;
        case "whatsapp":
          await shareToSocial(Social.Whatsapp);
          break;
        case "x":
          await shareToSocial(Social.Twitter);
          break;
        case "linkedin":
          await shareToSocial(Social.Linkedin);
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropTap}
          onPress={onClose}
          accessibilityLabel="Fechar"
        />
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
        >
          <View style={styles.handle} />
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              hitSlop={10}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Feather name="x" size={24} color={colors.fg} />
            </Pressable>
            <Pressable
              style={styles.saveBtn}
              onPress={saveToGallery}
              accessibilityRole="button"
            >
              <Text variant="monoLabel" color={colors.fg}>
                SALVAR
              </Text>
              <Feather name="download" size={15} color={colors.fg} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Card */}
            <View style={styles.cardWrap}>
              <AthleteShareCard ref={cardRef} athlete={athlete} />
            </View>

            {/* Compartilhar em */}
            <Text
              variant="eyebrow"
              color={colors.fg}
              style={styles.sectionLabel}
            >
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
                    <SocialIcon target={t.key} color={t.fg} />
                  </View>
                  <Text style={styles.targetLabel} color={colors.fgMuted}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Link do perfil */}
            <View style={styles.linkBox}>
              <Text
                variant="eyebrow"
                color={colors.fgMuted}
                style={styles.linkEyebrow}
              >
                L I N K · D O · P E R F I L
              </Text>
              <View style={styles.linkRow}>
                <Feather name="link" size={18} color={colors.fgMuted} />
                <Text
                  variant="body"
                  color={colors.fg}
                  style={styles.linkText}
                  numberOfLines={2}
                >
                  {shortLink}
                </Text>
                <Pressable
                  style={styles.copyBtn}
                  onPress={copyLink}
                  accessibilityRole="button"
                >
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
    maxHeight: "92%",
    backgroundColor: colors.bg,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.rule,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  scroll: { flexShrink: 1 },
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
    width: "62%",
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
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
});
