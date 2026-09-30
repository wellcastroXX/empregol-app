import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { notificationsApi } from "@/services/api/notifications-api";

// Mostra a notificação mesmo com o app em primeiro plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** deepLink (data da notificação) → rota do app. Padrão: home. */
const DEEP_LINKS: Record<string, string> = {
  HOME: "/(app)/(tabs)",
  MY_PROFILE: "/(app)/(tabs)/profile",
  WHO_VIEWED: "/(app)/(tabs)",
  CONVERSATION: "/(app)/(tabs)/conversas",
  CONVERSATIONS: "/(app)/(tabs)/conversas",
  COMPLETE_PROFILE: "/meus-dados",
  EDIT_PROFILE: "/meus-dados",
  ADD_VIDEO: "/nova-midia",
  ADD_PHOTO: "/(app)/(tabs)/profile",
  SUPPORT_NETWORK: "/(app)/(tabs)/benefits",
  CONTENT: "/(app)/(tabs)/benefits",
  SHARE: "/(app)/(tabs)/profile",
  SEARCH_ATHLETES: "/(app)/(tabs)/discover",
  FILTER_RESULTS: "/(app)/(tabs)/discover",
  SAVED_LISTS: "/(app)/(tabs)/discover",
  ATHLETE_PROFILE: "/(app)/(tabs)/discover",
  CLUB_PROFILE: "/(app)/(tabs)/profile",
};

/**
 * Registra o token de push quando o usuário está autenticado e leva para a tela
 * certa ao tocar na notificação. Usar uma vez, no layout autenticado.
 */
export function usePushNotifications() {
  const { status } = useAuth();
  const router = useRouter();

  // Permissão + token → backend.
  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    (async () => {
      if (!Device.isDevice) return; // simulador não recebe push real
      const perm = await Notifications.getPermissionsAsync();
      const granted = perm.granted || (await Notifications.requestPermissionsAsync()).granted;
      if (!granted || !active) return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
        if (!active) return;
        await notificationsApi.registerDevice(token, Platform.OS as "ios" | "android");
      } catch {
        // sem token — ignora silenciosamente
      }
    })();
    return () => {
      active = false;
    };
  }, [status]);

  // Navegação ao tocar na notificação.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { deepLink?: string } | undefined;
      const path = (data?.deepLink && DEEP_LINKS[data.deepLink]) || "/(app)/(tabs)";
      router.push(path as never);
    });
    return () => sub.remove();
  }, [router]);
}
