import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Text } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { mediaApi } from "@/services/api/media-api";
import { colors, fontFamily, palette, radii, spacing } from "@/theme";

export type AvatarSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Mostra a opção "Remover foto atual" só quando já existe foto. */
  hasPhoto?: boolean;
  /** Sucesso: nova foto (ou undefined ao remover) — o pai reflete no header + toast. */
  onSuccess?: (fotoUrl?: string) => void;
  /** Falha no upload/remoção — o pai mostra o toast de erro. */
  onError?: (message: string) => void;
};

type Source = "camera" | "library" | "selfie";

/**
 * Bottom-sheet de foto do perfil. Câmera / galeria / selfie sobem a imagem para
 * a pasta de avatares no servidor (mesma pipeline das mídias) e refletem na
 * sessão via `updateUser`. "Remover" volta pro número da camisa (avatar nulo).
 */
export function AvatarSheet({ visible, onClose, hasPhoto, onSuccess, onError }: AvatarSheetProps) {
  const { updateUser } = useAuth();
  const [busy, setBusy] = useState(false);

  const pick = async (source: Source) => {
    if (busy) return;
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };

    let result: ImagePicker.ImagePickerResult;
    if (source === "library") {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permissão necessária", "Libere o acesso à galeria.");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync(options);
    } else {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permissão necessária", "Libere o acesso à câmera.");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        ...options,
        cameraType:
          source === "selfie"
            ? ImagePicker.CameraType.front
            : ImagePicker.CameraType.back,
      });
    }

    if (result.canceled) return;
    const a = result.assets[0];
    setBusy(true);
    try {
      const { avatarUrl } = await mediaApi.updateAvatar({
        uri: a.uri,
        fileName: a.fileName ?? a.uri.split("/").pop() ?? "avatar.jpg",
        mimeType: a.mimeType ?? "image/jpeg",
      });
      await updateUser({ fotoUrl: avatarUrl });
      onSuccess?.(avatarUrl);
      onClose();
    } catch {
      onError?.("Não foi possível atualizar a foto. Tente de novo.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await mediaApi.removeAvatar();
      await updateUser({ fotoUrl: undefined });
      onSuccess?.(undefined);
      onClose();
    } catch {
      onError?.("Não foi possível remover a foto.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} accessibilityLabel="Fechar" />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="displaySm" color={colors.fg}>
              Foto do perfil
              <Text variant="displaySm" color={colors.accent}>
                .
              </Text>
            </Text>
            <Pressable hitSlop={10} onPress={onClose} accessibilityRole="button">
              <Text variant="monoLabel" color={colors.fgMuted}>
                FECHAR ›
              </Text>
            </Pressable>
          </View>

          <Row
            icon="camera"
            title="Tirar nova foto"
            subtitle="Câmera · em uniforme"
            onPress={() => pick("camera")}
          />
          <Row
            icon="image"
            title="Escolher da galeria"
            subtitle="Foto recente em alta resolução"
            onPress={() => pick("library")}
          />
          <Row
            icon="user"
            title="Tirar selfie"
            subtitle="Boa pra avatar redondo"
            onPress={() => pick("selfie")}
          />
          {hasPhoto && (
            <Row
              icon="trash-2"
              title="Remover foto atual"
              subtitle="Volta pro número da camisa"
              onPress={remove}
              danger
            />
          )}

          {/* Dica */}
          <View style={styles.tip}>
            <Text style={styles.tipText} color={colors.fg}>
              <Text style={styles.tipEyebrow} color={colors.fgMuted}>
                D I C A ·{" "}
              </Text>
              Foto em campo, treino ou uniforme passa{" "}
              <Text style={styles.tipStrong} color={colors.fg}>
                2× mais credibilidade
              </Text>{" "}
              pros scouts.
            </Text>
          </View>

          {busy && (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.accent} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const fg = danger ? colors.statusEmpregado : colors.fg;
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.iconTile, danger && styles.iconTileDanger]}>
        <Feather name={icon} size={20} color={fg} />
      </View>
      <View style={styles.rowText}>
        <Text variant="bodyMedium" color={fg}>
          {title}
        </Text>
        <Text variant="sm" color={colors.fgMuted}>
          {subtitle}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={danger ? colors.statusEmpregado : colors.fgMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(20,20,19,0.45)", justifyContent: "flex-end" },
  backdropTap: { flex: 1 },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing["3xl"],
    gap: spacing.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  rowPressed: { opacity: 0.6 },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: palette.osso,
    alignItems: "center",
    justifyContent: "center",
  },
  iconTileDanger: { borderColor: colors.statusEmpregado, backgroundColor: "transparent" },
  rowText: { flex: 1, gap: 2 },
  tip: {
    marginTop: spacing.md,
    backgroundColor: palette.osso,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  tipText: { lineHeight: 22 },
  tipEyebrow: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  tipStrong: { fontFamily: fontFamily.textMedium },
  busy: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(242,239,232,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
});
