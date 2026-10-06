import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  Button,
  EmptyState,
  FavoriteButton,
  Text,
  Toast,
} from "@/components/ui";
import { POSITIONS } from "@/constants/positions";
import { useAuth } from "@/context/AuthContext";
import { useGlobalLoading } from "@/context/GlobalLoadingContext";
import { AvatarSheet } from "@/features/profile/AvatarSheet";
import { profileService } from "@/services";
import { conversationsApi } from "@/services/api/conversations-api";
import { favoritesApi } from "@/services/api/favorites-api";
import { toMediaItems } from "@/services/api/mappers";
import { mediaApi } from "@/services/api/media-api";
import { colors, palette, radii, spacing } from "@/theme";
import type { AthleteMediaItem, AthleteProfile } from "@/types";
import {
  AthleteAboutSection,
  AthleteStats,
  OwnAthleteHeader,
  PersonalDataSection,
  ScoutAthleteHeader,
  // ScoutPersonalDataCard, // oculto no ambiente Agente/Clube (a pedido)
  TrajetoriaSection,
  VideoThumbs,
} from "../components";
import { ShareProfileSheet } from "../components/ShareProfileSheet";

/** URL amigável p/ exibição: sem protocolo nem barra final. */
const prettyUrl = (raw: string) =>
  raw.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");

/** Abre o link externo no navegador (adiciona https:// se faltar). */
async function openExternal(raw: string) {
  const url = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Link indisponível", "Não foi possível abrir este link.");
  }
}

/**
 * Fallback: URLs sem metadados → itens mínimos. Ignora URIs locais (file://,
 * content://) que nunca foram enviadas ao servidor — elas não abrem.
 */
function videosToItems(videos: string[]): AthleteMediaItem[] {
  return videos
    .filter((url) => !/^(file|content):/i.test(url.trim()))
    .map((url, i) => ({
      tipo: "link",
      url,
      titulo: `Jogada ${String(i + 1).padStart(2, "0")}`,
    }));
}

export type AthleteProfileScreenProps = {
  athleteId?: string;
  athlete?: AthleteProfile;
  showPersonalData?: boolean;
  scout?: boolean;
  onSettings?: () => void;
};

export function AthleteProfileScreen({
  athleteId,
  athlete: provided,
  showPersonalData,
  scout,
  onSettings,
}: AthleteProfileScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { runWithGlobalLoading } = useGlobalLoading();
  const { signOut, user } = useAuth();
  const [athlete, setAthlete] = useState<AthleteProfile | null>(
    provided ?? null,
  );
  const [loading, setLoading] = useState(!provided);
  const [loadError, setLoadError] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteActionLoading, setFavoriteActionLoading] = useState(false);
  const [favoriteStatusLoaded, setFavoriteStatusLoaded] = useState(false);
  const [ownMedia, setOwnMedia] = useState<AthleteMediaItem[]>([]);
  const [avatarSheet, setAvatarSheet] = useState(false);
  const [shareSheet, setShareSheet] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "danger";
  } | null>(null);

  // Perfil próprio: reflete atualizações do usuário (ex.: após publicar mídia).
  useEffect(() => {
    if (provided) setAthlete(provided);
  }, [provided]);

  // Perfil próprio: busca a mídia da vitrine a cada foco (reflete novos uploads).
  useFocusEffect(
    useCallback(() => {
      if (scout) return;
      let active = true;
      mediaApi
        .listMine()
        .then((list) => active && setOwnMedia(toMediaItems(list)))
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, [scout]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!scout || user?.role !== "contractor" || !athleteId) return;
      let active = true;
      setFavoriteLoading(true);
      favoritesApi
        .list()
        .then((favorites) => {
          if (!active) return;
          setIsFavorited(
            favorites.some((favorite) => favorite.id === athleteId),
          );
          setFavoriteStatusLoaded(true);
        })
        .catch(() => {
          if (active) {
            Alert.alert(
              "Favoritos indisponíveis",
              "Não foi possível carregar seus favoritos.",
            );
          }
        })
        .finally(() => active && setFavoriteLoading(false));
      return () => {
        active = false;
      };
    }, [athleteId, scout, user?.role]),
  );

  useEffect(() => {
    if (provided || !athleteId) return;
    let active = true;
    profileService
      .getAthlete(athleteId)
      .then((data) => {
        if (active) setAthlete(data);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [athleteId, provided]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!athlete) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          icon="user-x"
          title={loadError ? "Perfil indisponível." : "Atleta não encontrado."}
          message={
            loadError
              ? "Não foi possível carregar os dados agora."
              : "Este perfil pode ter saído de campo."
          }
        />
      </SafeAreaView>
    );
  }

  const posOpt = POSITIONS.find((p) => p.value === athlete.posicao);
  const posLabel = posOpt
    ? `${posOpt.short} · ${posOpt.label.toUpperCase()}`
    : athlete.posicao.toUpperCase();

  async function openChat() {
    if (!athlete?.id || chatLoading) return;
    setChatLoading(true);
    try {
      const conv = await conversationsApi.open(athlete.id);
      router.push({
        pathname: "/conversas/[id]",
        params: { id: conv.id, name: athlete.nome, subtitle: posLabel },
      });
    } finally {
      setChatLoading(false);
    }
  }

  async function toggleFavorite() {
    if (
      !athlete?.id ||
      favoriteLoading ||
      favoriteActionLoading ||
      !favoriteStatusLoaded
    )
      return;
    setFavoriteActionLoading(true);
    try {
      setIsFavorited(
        await runWithGlobalLoading(() => favoritesApi.toggle(athlete.id)),
      );
    } catch {
      Alert.alert("Não foi possível atualizar", "Tente favoritar novamente.");
    } finally {
      setFavoriteActionLoading(false);
    }
  }

  function handleSignOut() {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() },
    ]);
  }

  // ── Own profile: single dark editorial header + cream content ──
  if (!scout) {
    return (
      <View style={styles.ownRoot}>
        <StatusBar style="light" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ownScroll}
        >
          <OwnAthleteHeader
            athlete={athlete}
            insetsTop={insets.top}
            onUpdatePhoto={() => setAvatarSheet(true)}
            onUpdateData={() => router.push("/meus-dados")}
            onShare={() => setShareSheet(true)}
          />

          <View style={styles.ownBody}>
            <AthleteStats
              athlete={athlete}
              onPressClube={() => router.push("/estatisticas")}
            />
            {showPersonalData && <PersonalDataSection athlete={athlete} />}
            <TrajetoriaSection entries={athlete.trajetoria} />
            <VideoThumbs
              media={ownMedia.length ? ownMedia : videosToItems(athlete.videos)}
              photoUrl={athlete.fotoUrl}
              jerseyNumber={athlete.numero}
              emptyMessage="Suba suas melhores jogadas. É o que clubes veem primeiro."
            />

            <Pressable
              onPress={handleSignOut}
              style={styles.logoutRow}
              accessibilityRole="button"
            >
              <Text variant="sm" color={colors.statusEmpregado}>
                Sair da conta ›
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <AvatarSheet
          visible={avatarSheet}
          onClose={() => setAvatarSheet(false)}
          hasPhoto={!!athlete.fotoUrl}
          onSuccess={(fotoUrl) => {
            setAthlete((prev) => (prev ? { ...prev, fotoUrl } : prev));
            setToast({
              message: fotoUrl ? "Foto atualizada!" : "Foto removida.",
              tone: "success",
            });
          }}
          onError={(message) => setToast({ message, tone: "danger" })}
        />
        <ShareProfileSheet
          visible={shareSheet}
          onClose={() => setShareSheet(false)}
          athlete={athlete}
        />
        <Toast
          message={toast?.message ?? null}
          tone={toast?.tone}
          onHide={() => setToast(null)}
        />
      </View>
    );
  }

  // ── Scout view (AGENT/CLUB looking at an athlete) — dark ──
  return (
    <SafeAreaView style={styles.scoutSafe} edges={["top", "left", "right"]}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text variant="eyebrow" color={palette.giz}>
            ‹ VOLTAR
          </Text>
        </Pressable>
        <View style={styles.topActions}>
          <FavoriteButton
            favorited={isFavorited}
            disabled={
              favoriteLoading || favoriteActionLoading || !favoriteStatusLoaded
            }
            size={18}
            inactiveColor={palette.giz}
            onPress={toggleFavorite}
          />
          <Feather name="more-horizontal" size={20} color={palette.giz} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Light editorial hero */}
        <ScoutAthleteHeader athlete={athlete} />

        {/* Padded content */}
        <View style={styles.body}>
          <AthleteAboutSection athlete={athlete} />
          <AthleteStats athlete={athlete} showClub={false} dark />
          {/* Dados pessoais ocultos no ambiente Agente/Clube (comentado a pedido). */}
          {/* <ScoutPersonalDataCard athlete={athlete} /> */}
          <TrajetoriaSection entries={athlete.trajetoria} dark />
          {!!athlete.perfilEsportivoUrl?.trim() && (
            <View style={styles.linkSection}>
              <Text variant="eyebrow" color={palette.cinzaOnDark}>
                P E R F I L · E S P O R T I V O
              </Text>
              <Pressable
                onPress={() => openExternal(athlete.perfilEsportivoUrl!)}
                accessibilityRole="link"
                accessibilityLabel="Abrir perfil esportivo externo"
                style={({ pressed }) => [
                  styles.linkRow,
                  pressed && styles.linkPressed,
                ]}
              >
                <Feather name="external-link" size={18} color={palette.gramado} />
                <Text
                  variant="smMedium"
                  color={palette.giz}
                  numberOfLines={1}
                  style={styles.linkText}
                >
                  {prettyUrl(athlete.perfilEsportivoUrl)}
                </Text>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={palette.cinzaOnDark}
                />
              </Pressable>
            </View>
          )}
          <VideoThumbs
            media={
              athlete.media?.length
                ? athlete.media
                : videosToItems(athlete.videos)
            }
            photoUrl={athlete.fotoUrl}
            jerseyNumber={athlete.numero}
            dark
          />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.footer}>
        <View style={styles.ctaRow}>
          <Button
            style={styles.ctaBtn}
            label="CONVERSAR COM ATLETA"
            chevron
            loading={chatLoading}
            onPress={openChat}
          />
          <FavoriteButton
            favorited={isFavorited}
            disabled={
              favoriteLoading || favoriteActionLoading || !favoriteStatusLoaded
            }
            size={20}
            inactiveColor={colors.bg}
            style={styles.starBtn}
            onPress={toggleFavorite}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scoutSafe: {
    flex: 1,
    backgroundColor: palette.tinta,
  },
  ownRoot: {
    flex: 1,
    backgroundColor: colors.fg, // dark, so top overscroll matches the header
  },
  ownScroll: {
    flexGrow: 1,
    paddingBottom: spacing["4xl"],
    backgroundColor: colors.bg,
  },
  ownBody: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: "5%",
    paddingTop: spacing["2xl"],
    gap: spacing["2xl"],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "5%",
    paddingVertical: spacing.md,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  scroll: {
    paddingBottom: spacing["4xl"],
  },
  body: {
    paddingHorizontal: "5%",
    paddingTop: spacing["2xl"],
    gap: spacing["2xl"],
  },
  linkSection: {
    gap: spacing.md,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: palette.tintaElev,
    borderWidth: 1,
    borderColor: palette.ruleOnDark,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  linkText: {
    flex: 1,
  },
  linkPressed: {
    opacity: 0.6,
  },
  logoutRow: {
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: palette.ruleOnDark,
    backgroundColor: palette.tinta,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
  },
  ctaBtn: {
    flex: 1,
  },
  starBtn: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: palette.giz64,
    alignItems: "center",
    justifyContent: "center",
  },
  starBtnPressed: {
    opacity: 0.7,
  },
});
