import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";

import { palette } from "@/theme";

export function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={() => undefined}
    >
      <View
        style={styles.overlay}
        accessibilityViewIsModal
        accessibilityLabel="Carregando"
      >
        <ActivityIndicator size="large" color={palette.gramado} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(20,20,19,0.48)",
    alignItems: "center",
    justifyContent: "center",
  },
});