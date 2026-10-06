import { Feather } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui";
import { env } from "@/config/env";
import { colors, palette, radii, spacing } from "@/theme";

// PDF empacotado (nome ASCII-safe p/ o Metro). Original: "Termos de Uso – Empregol.pdf".
const TERMS_PDF = require("../../../../assets/others/termos-de-uso-empregol.pdf");
// Versão hospedada — abre inteira no navegador in-app (iOS/Android renderizam PDF remoto).
const TERMS_URL = `${env.apiUrl}/legal/termos-de-uso.pdf`;

/** Fallback: abre o PDF empacotado via preview do sistema (offline). */
async function openLocalTerms() {
  try {
    const asset = Asset.fromModule(TERMS_PDF);
    await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: "Termos de Uso – Empregol",
      });
    } else {
      await Linking.openURL(uri);
    }
  } catch {
    Alert.alert("Ops", "Não foi possível abrir os Termos de Uso.");
  }
}

/** Abre os Termos de Uso: visualizador in-app (remoto) ou fallback local. */
async function openTerms() {
  try {
    const res = await fetch(TERMS_URL, { method: "HEAD" });
    if (res.ok) {
      await WebBrowser.openBrowserAsync(TERMS_URL);
      return;
    }
  } catch {
    // sem rede ou documento indisponível → cai no fallback local
  }
  await openLocalTerms();
}

export type TermsAcceptanceProps = {
  accepted: boolean;
  onToggle: (value: boolean) => void;
};

/** Checkbox "Li e aceito os Termos de Uso" + link p/ o PDF. */
export function TermsAcceptance({ accepted, onToggle }: TermsAcceptanceProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        accessibilityLabel="Aceito os Termos de Uso"
        hitSlop={8}
        onPress={() => onToggle(!accepted)}
        style={[styles.box, accepted && styles.boxOn]}
      >
        {accepted && <Feather name="check" size={15} color={palette.giz} />}
      </Pressable>
      <Text variant="sm" color={colors.fgMuted} style={styles.text}>
        Li e aceito os{" "}
        <Text
          variant="smMedium"
          color={colors.fg}
          style={styles.link}
          onPress={openTerms}
        >
          Termos de Uso
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.rule,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: {
    backgroundColor: palette.gramado,
    borderColor: palette.gramado,
  },
  text: {
    flex: 1,
  },
  link: {
    textDecorationLine: "underline",
  },
});
