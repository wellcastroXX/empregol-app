import { Alert, StyleSheet, View } from "react-native";

import {
    Avatar,
    Button,
    DataRow,
    Divider,
    Screen,
    ScreenHeader,
    Tag,
    Text,
    Toast,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { colors, spacing } from "@/theme";
import { useState } from "react";

/** Ajustes — account summary + menu + sign out. */
export function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  if (!user) return null;

  const verified = user.verificacao === "verified";

  const confirmSignOut = () => {
    Alert.alert("Sair da conta", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const showUnavailable = () => setToastMessage("Tente novamente mais tarde");

  return (
    <View style={styles.root}>
      <Screen contentContainerStyle={styles.content}>
        <ScreenHeader title="Ajustes" />

        <View style={styles.account}>
          <Avatar name={user.nome} uri={user.fotoUrl} size={56} tone="ink" />
          <View style={styles.accountInfo}>
            <Text variant="h3" color={colors.fg}>
              {user.nome}
            </Text>
            <Text variant="sm" color={colors.fgMuted}>
              {user.email}
            </Text>
          </View>
          <Tag
            label={verified ? "VERIFICADO" : "PENDENTE"}
            variant={verified ? "live" : "warn"}
          />
        </View>

        <View style={styles.menu}>
          <DataRow
            icon="user"
            title="Editar perfil"
            chevron
            onPress={showUnavailable}
          />
          <Divider />
          <DataRow
            icon="bell"
            title="Notificações"
            chevron
            onPress={showUnavailable}
          />
          <Divider />
          <DataRow
            icon="shield"
            title="Privacidade e segurança"
            chevron
            onPress={showUnavailable}
          />
          <Divider />
          <DataRow
            icon="help-circle"
            title="Ajuda e suporte"
            chevron
            onPress={showUnavailable}
          />
        </View>

        <Button
          label="Sair da conta"
          variant="ghost"
          fullWidth
          onPress={confirmSignOut}
        />
      </Screen>
      <Toast
        message={toastMessage}
        tone="warning"
        onHide={() => setToastMessage(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    gap: spacing["2xl"],
  },
  account: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  accountInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  menu: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
});
