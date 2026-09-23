import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fontFamily, palette, radii, spacing } from "@/theme";
import { Text } from "./Text";

export type ToastTone = "success" | "danger";

export type ToastProps = {
  /** Mensagem a exibir; `null` esconde. Trocar o texto reanima. */
  message: string | null;
  tone?: ToastTone;
  onHide: () => void;
  durationMs?: number;
};

/** Toast simples no topo — some sozinho. Reutilizável (feedback de ações). */
export function Toast({ message, tone = "success", onHide, durationMs = 2600 }: ToastProps) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(160)).current;

  useEffect(() => {
    if (!message) return;
    y.setValue(160);
    Animated.spring(y, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
    const timer = setTimeout(() => {
      Animated.timing(y, { toValue: 180, duration: 220, useNativeDriver: true }).start(onHide);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onHide, y]);

  if (!message) return null;
  const bg = tone === "danger" ? colors.statusEmpregado : palette.gramado;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { bottom: insets.bottom + spacing.lg, transform: [{ translateY: y }] }]}
    >
      <View style={[styles.toast, { backgroundColor: bg }]}>
        <Text style={styles.text} color={palette.giz}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  toast: {
    width: "88%",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  text: {
    fontFamily: fontFamily.textMedium,
    fontSize: 14,
    textAlign: "center",
  },
});
