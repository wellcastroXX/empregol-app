import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";

import { Screen, ScreenHeader, Text, Toast } from "@/components/ui";
import { supportWhatsappUrl } from "@/constants/support";
import { useAuth } from "@/context/AuthContext";
import { openTerms } from "@/features/auth/components/TermsAcceptance";
import { authService } from "@/services";
import { accountApi } from "@/services/api/account-api";
import { colors, radii, spacing } from "@/theme";

const NAO_PREENCHIDO = "Não informado";

/**
 * Linha da seção CONTA. Ícone check (verde quando `complete`) ou X vermelho
 * (`danger`). Igual ao padrão usado em "Meus dados".
 */
function AccountRow({
  title,
  subtitle,
  complete,
  danger,
  onPress,
}: {
  title: string;
  subtitle: string;
  complete?: boolean;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View
        style={[
          styles.checkBox,
          complete && styles.checkBoxDone,
          danger && styles.checkBoxDanger,
        ]}
      >
        <Feather
          name={danger ? "x" : "check"}
          size={18}
          color={danger || complete ? colors.accentFg : colors.fgMuted}
          style={danger || complete ? undefined : styles.checkIncomplete}
        />
      </View>
      <View style={styles.rowBody}>
        <Text variant="bodyMedium" color={colors.fg}>
          {title}
        </Text>
        <Text variant="sm" color={colors.fgMuted}>
          {subtitle}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.fgMuted} />
    </Pressable>
  );
}

/** Configurações — seção CONTA (e-mail, senha, privacidade, suporte, excluir). */
export function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  if (!user) return null;

  const verified = user.verificacao === "verified";

  const openSupport = async () => {
    try {
      await Linking.openURL(supportWhatsappUrl());
    } catch {
      setToastMessage("Não foi possível abrir o WhatsApp");
    }
  };

  const doDeleteAccount = async () => {
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
                  onPress: doDeleteAccount,
                },
              ],
            ),
        },
      ],
    );
  };

  const confirmSignOut = () => {
    Alert.alert("Sair da conta", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const trocarSenha = () => {
    Alert.alert(
      "Trocar senha",
      `Vamos enviar um link para redefinir sua senha para ${user.email}.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: async () => {
            try {
              await authService.requestPasswordReset(user.email);
              Alert.alert(
                "Verifique seu e-mail",
                "Enviamos instruções para redefinir sua senha.",
              );
            } catch {
              setToastMessage("Não foi possível enviar agora. Tente de novo.");
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <Screen contentContainerStyle={styles.content}>
        <ScreenHeader title="Configurações" back />

        <View>
          <Text
            variant="eyebrow"
            color={colors.fgMuted}
            style={styles.sectionLabel}
          >
            C O N T A
          </Text>
          <View style={styles.list}>
            <AccountRow
              title={verified ? "E-mail verificado" : "E-mail"}
              subtitle={user.email}
              complete={verified}
            />
            <AccountRow
              title="Telefone"
              subtitle={user.telefone || NAO_PREENCHIDO}
              complete={!!user.telefone}
            />
            <AccountRow
              title="Trocar senha"
              subtitle="Redefina sua senha por e-mail"
              complete
              onPress={trocarSenha}
            />
            <AccountRow
              title="Privacidade & Segurança"
              subtitle="Leia os Termos de Uso"
              complete
              onPress={openTerms}
            />
            <AccountRow
              title="Ajuda e Suporte"
              subtitle="Fale com a Empregol no WhatsApp"
              complete
              onPress={openSupport}
            />
            <AccountRow
              title="Excluir conta"
              subtitle="Apaga permanentemente sua conta e seus dados"
              danger
              onPress={confirmDeleteAccount}
            />
          </View>
        </View>

        <Pressable
          onPress={confirmSignOut}
          style={styles.logoutRow}
          accessibilityRole="button"
        >
          <Text variant="sm" color={colors.statusEmpregado}>
            Sair da conta ›
          </Text>
        </Pressable>
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
  sectionLabel: {
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    marginHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  rowPressed: {
    opacity: 0.6,
  },
  checkBox: {
    width: 38,
    height: 38,
    borderRadius: radii.xs,
    backgroundColor: colors.bgSunken,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBoxDone: {
    backgroundColor: colors.accent,
  },
  checkBoxDanger: {
    backgroundColor: colors.statusEmpregado,
  },
  checkIncomplete: {
    opacity: 0.4,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  logoutRow: {
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
});
