import { Alert } from "react-native";

import {
  moderationApi,
  type ReportContext,
  type ReportReason,
} from "@/services/api/moderation-api";

async function submitReport(
  userId: string,
  reason: ReportReason,
  context: ReportContext,
) {
  try {
    await moderationApi.report({ reportedUserId: userId, reason, context });
    Alert.alert(
      "Denúncia enviada",
      "Obrigado. Nossa equipe vai analisar o conteúdo.",
    );
  } catch {
    Alert.alert("Ops", "Não foi possível enviar a denúncia. Tente de novo.");
  }
}

function promptReport(userId: string, context: ReportContext) {
  Alert.alert("Denunciar", "Qual o motivo da denúncia?", [
    {
      text: "Conteúdo impróprio",
      onPress: () => submitReport(userId, "inappropriate", context),
    },
    {
      text: "Assédio ou abuso",
      onPress: () => submitReport(userId, "harassment", context),
    },
    { text: "Spam", onPress: () => submitReport(userId, "spam", context) },
    { text: "Cancelar", style: "cancel" },
  ]);
}

function confirmBlock(userId: string, name?: string, onBlocked?: () => void) {
  Alert.alert(
    name ? `Bloquear ${name}` : "Bloquear usuário",
    "Vocês não poderão mais se ver nem trocar mensagens. Deseja continuar?",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Bloquear",
        style: "destructive",
        onPress: async () => {
          try {
            await moderationApi.block(userId);
            Alert.alert("Usuário bloqueado");
            onBlocked?.();
          } catch {
            Alert.alert("Ops", "Não foi possível bloquear. Tente de novo.");
          }
        },
      },
    ],
  );
}

/** Abre o menu de moderação (Denunciar / Bloquear) para um usuário-alvo. */
export function showModerationMenu(opts: {
  targetUserId?: string;
  targetName?: string;
  context: ReportContext;
  onBlocked?: () => void;
}) {
  const { targetUserId, targetName, context, onBlocked } = opts;
  if (!targetUserId) {
    Alert.alert(
      "Indisponível",
      "Não foi possível identificar o usuário para esta ação.",
    );
    return;
  }
  Alert.alert(targetName ?? "Opções", undefined, [
    {
      text: "Denunciar",
      onPress: () => promptReport(targetUserId, context),
    },
    {
      text: "Bloquear",
      style: "destructive",
      onPress: () => confirmBlock(targetUserId, targetName, onBlocked),
    },
    { text: "Cancelar", style: "cancel" },
  ]);
}
