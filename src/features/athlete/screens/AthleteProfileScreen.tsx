import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { conversationsApi } from '@/services/api/conversations-api';
import { mediaApi } from '@/services/api/media-api';
import { toMediaItems } from '@/services/api/mappers';
import { profileService } from '@/services';
import { colors, palette, spacing } from '@/theme';
import { POSITIONS } from '@/constants/positions';
import type { AthleteMediaItem, AthleteProfile } from '@/types';
import {
  AthleteAboutSection,
  AthleteStats,
  OwnAthleteHeader,
  PersonalDataSection,
  ScoutAthleteHeader,
  ScoutPersonalDataCard,
  TrajetoriaSection,
  VideoThumbs,
} from '../components';

/**
 * Fallback: URLs sem metadados → itens mínimos. Ignora URIs locais (file://,
 * content://) que nunca foram enviadas ao servidor — elas não abrem.
 */
function videosToItems(videos: string[]): AthleteMediaItem[] {
  return videos
    .filter((url) => !/^(file|content):/i.test(url.trim()))
    .map((url, i) => ({
      tipo: 'link',
      url,
      titulo: `Jogada ${String(i + 1).padStart(2, '0')}`,
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
  const { signOut } = useAuth();
  const [athlete, setAthlete] = useState<AthleteProfile | null>(provided ?? null);
  const [loading, setLoading] = useState(!provided);
  const [chatLoading, setChatLoading] = useState(false);
  const [ownMedia, setOwnMedia] = useState<AthleteMediaItem[]>([]);

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

  useEffect(() => {
    if (provided || !athleteId) return;
    let active = true;
    profileService.getAthlete(athleteId).then((data) => {
      if (active) {
        setAthlete(data);
        setLoading(false);
      }
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
          title="Atleta não encontrado.."
          message="Este perfil pode ter saído de campo."
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
        pathname: '/conversas/[id]',
        params: { id: conv.id, name: athlete.nome, subtitle: posLabel },
      });
    } finally {
      setChatLoading(false);
    }
  }

  function handleSignOut() {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  // ── Own profile: single dark editorial header + cream content ──
  if (!scout) {
    return (
      <View style={styles.ownRoot}>
        <StatusBar style="light" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.ownScroll}>
          <OwnAthleteHeader
            athlete={athlete}
            insetsTop={insets.top}
            onUpdatePhoto={() => Alert.alert('Em breve', 'Atualização de foto disponível em breve.')}
            onUpdateData={() => router.push('/meus-dados')}
            onShare={() => Share.share({ message: `Confira o perfil de ${athlete.nome} no Empregol.` })}
          />

          <View style={styles.ownBody}>
            <AthleteStats athlete={athlete} />
            {showPersonalData && <PersonalDataSection athlete={athlete} />}
            <TrajetoriaSection entries={athlete.trajetoria} />
            <VideoThumbs
              media={ownMedia.length ? ownMedia : videosToItems(athlete.videos)}
              photoUrl={athlete.fotoUrl}
              jerseyNumber={athlete.numero}
              emptyMessage="Suba suas melhores jogadas. É o que clubes veem primeiro."
            />

            <Pressable onPress={handleSignOut} style={styles.logoutRow} accessibilityRole="button">
              <Text variant="sm" color={colors.statusEmpregado}>Sair da conta ›</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Scout view (AGENT/CLUB looking at an athlete) — dark ──
  return (
    <SafeAreaView style={styles.scoutSafe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.topBar}>
        <Pressable hitSlop={8} onPress={() => router.back()} accessibilityRole="button">
          <Text variant="eyebrow" color={palette.giz}>‹ VOLTAR</Text>
        </Pressable>
        <View style={styles.topActions}>
          <Feather name="star" size={18} color={palette.giz} />
          <Feather name="more-horizontal" size={20} color={palette.giz} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Light editorial hero */}
        <ScoutAthleteHeader athlete={athlete} />

        {/* Padded content */}
        <View style={styles.body}>
          <AthleteAboutSection athlete={athlete} />
          <AthleteStats athlete={athlete} showClub={false} dark />
          <ScoutPersonalDataCard athlete={athlete} />
          <TrajetoriaSection entries={athlete.trajetoria} dark />
          <VideoThumbs
            media={athlete.media?.length ? athlete.media : videosToItems(athlete.videos)}
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Favoritar"
            style={({ pressed }) => [styles.starBtn, pressed && styles.starBtnPressed]}>
            <Feather name="star" size={20} color={colors.fg} />
          </Pressable>
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
    paddingBottom: spacing['4xl'],
    backgroundColor: colors.bg,
  },
  ownBody: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: '5%',
    paddingTop: spacing['2xl'],
    gap: spacing['2xl'],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: spacing.md,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  scroll: {
    paddingBottom: spacing['4xl'],
  },
  body: {
    paddingHorizontal: '5%',
    paddingTop: spacing['2xl'],
    gap: spacing['2xl'],
  },
  logoutRow: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: palette.ruleOnDark,
    backgroundColor: palette.tinta,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  ctaBtn: {
    flex: 1,
  },
  starBtn: {
    width: 52,
    height: 52,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: palette.giz64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBtnPressed: {
    opacity: 0.7,
  },
});
