import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fontFamily, palette, radii, spacing } from "@/theme";
import { Text } from "./Text";

export type ToastTone = "success" | "danger" | "warning";

export type ToastProps = {
  /** Mensagem a exibir; `null` esconde. Trocar o texto reanima. */
  message: string | null;
  tone?: ToastTone;
  onHide: () => void;
  durationMs?: number;
};

/** Toast simples no topo — some sozinho. Reutilizável (feedback de ações). */
export function Toast({
  message,
  tone = "success",
  onHide,
  durationMs = 2600,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(160)).current;

  useEffect(() => {
    if (!message) return;
    y.setValue(160);
    Animated.spring(y, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
    const timer = setTimeout(() => {
      Animated.timing(y, {
        toValue: 180,
        duration: 220,
        useNativeDriver: true,
      }).start(onHide);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onHide, y]);

  if (!message) return null;
  const bg =
    tone === "danger"
      ? colors.statusEmpregado
      : tone === "warning"
        ? palette.warn
        : palette.gramado;
  const fg = palette.giz;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={() => undefined}
    >
      <View style={styles.modalRoot} pointerEvents="box-none">
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            {
              bottom: insets.bottom + spacing.xs,
              transform: [{ translateY: y }],
            },
          ]}
        >
          <View style={[styles.toast, { backgroundColor: bg }]}>
            {tone === "warning" && (
              <Feather name="alert-triangle" size={18} color={fg} />
            )}
            <Text style={styles.text} color={fg}>
              {message}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  toast: {
    width: "94%",
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.sm,
  },
  text: {
    fontFamily: fontFamily.textMedium,
    marginLeft: 4,
    color: palette.creme,
    fontSize: 14,
    textAlign: "left",
  },
});
