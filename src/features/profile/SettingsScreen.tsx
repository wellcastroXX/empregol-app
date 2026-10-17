import { Alert, Linking, StyleSheet, View } from "react-native";

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
import { supportWhatsappUrl } from "@/constants/support";
import { useAuth } from "@/context/AuthContext";
import { accountApi } from "@/services/api/account-api";
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

  const openSupport = async () => {
    try {
      await Linking.openURL(supportWhatsappUrl());
    } catch {
      setToastMessage("Não foi possível abrir o WhatsApp");
    }
  };

  const deleteAccount = async () => {
    try {
      await accountApi.deleteAccount();
      await signOut();
    } catch {
      Alert.alert(
        "Não foi possível excluir",
        "Tente novamente em instantes ou fale com o suporte.",
      );
    }
  };

  const confirmDeleteAccount = () => {
    // Dupla confirmação — ação destrutiva e permanente.
    Alert.alert(
      "Excluir conta",
      "Isso apaga permanentemente sua conta, perfil, mídias e conversas. Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          style: "destructive",
          onPress: () =>
            Alert.alert(
              "Tem certeza?",
              "Sua conta e todos os seus dados serão excluídos para sempre.",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Excluir definitivamente",
                  style: "destructive",
                  onPress: deleteAccount,
                },
              ],
            ),
        },
      ],
    );
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
            onPress={openSupport}
          />
          <Divider />
          <DataRow
            icon="trash-2"
            title="Excluir conta"
            chevron
            onPress={confirmDeleteAccount}
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
