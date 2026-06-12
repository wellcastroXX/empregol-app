import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, Tag, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { conversationsApi } from '@/services/api/conversations-api';
import { profileService } from '@/services';
import { colors, spacing } from '@/theme';
import { POSITIONS } from '@/constants/positions';
import type { AthleteProfile, DominantFoot } from '@/types';
import {
  AthleteHero,
  AthleteStats,
  OwnAthleteHeader,
  PersonalDataSection,
  SalaryCard,
  TrajetoriaSection,
  VideoList,
} from '../components';

const FOOT_LABEL: Record<DominantFoot, string> = {
  direito: 'DESTRO',
  esquerdo: 'CANHOTO',
  ambidestro: 'AMBIDESTRO',
};

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
  const { user, signOut } = useAuth();
  const isContractor = user?.role === 'contractor';
  const [athlete, setAthlete] = useState<AthleteProfile | null>(provided ?? null);
  const [loading, setLoading] = useState(!provided);
  const [chatLoading, setChatLoading] = useState(false);

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
  const alturaStr = `${(athlete.alturaCm / 100).toFixed(2).replace('.', ',')}M`;
  const ageHeightLabel = `${athlete.idade} ANOS · ${alturaStr}`;

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
            onUpdateData={onSettings}
            onShare={() => Share.share({ message: `Confira o perfil de ${athlete.nome} no Empregol.` })}
          />

          <View style={styles.ownBody}>
            <AthleteStats athlete={athlete} />
            {showPersonalData && <PersonalDataSection athlete={athlete} />}
            <TrajetoriaSection entries={athlete.trajetoria} />
            <VideoList videos={athlete.videos} />

            <Pressable onPress={handleSignOut} style={styles.logoutRow} accessibilityRole="button">
              <Text variant="sm" color={colors.statusEmpregado}>Sair da conta ›</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* ── Header ── */}
      <View style={styles.topBar}>
        {scout ? (
          <>
            <Pressable hitSlop={8} onPress={() => router.back()} accessibilityRole="button">
              <Text variant="eyebrow" color={colors.fg}>‹ VOLTAR</Text>
            </Pressable>
            <Text variant="h3" color={colors.fg}>★</Text>
          </>
        ) : (
          <>
            <Text variant="eyebrow" color={colors.fg}>P E R F I L</Text>
            {onSettings && (
              <Pressable hitSlop={8} onPress={onSettings} accessibilityRole="button">
                <Feather name="share-2" size={18} color={colors.fg} />
              </Pressable>
            )}
          </>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero — full-width, no horizontal padding */}
        <AthleteHero athlete={athlete} />

        {/* ── All padded content ── */}
        <View style={styles.body}>
          {/* Data chips */}
          <View style={styles.chips}>
            <Tag label={posLabel} />
            <Tag label={ageHeightLabel} />
            <Tag label={FOOT_LABEL[athlete.peDominante]} />
          </View>

          {/* Action buttons — own profile only */}
          {!scout && (
            <View style={styles.actions}>
              <Button
                style={styles.halfBtn}
                variant="ghost"
                size="sm"
                label="ATUALIZAR FOTO  📷"
                onPress={() => Alert.alert('Em breve', 'Funcionalidade disponível em breve.')}
              />
              <Button
                style={styles.halfBtn}
                variant="primary"
                size="sm"
                label="ATUALIZAR DADOS  ✏"
                onPress={onSettings}
              />
            </View>
          )}

          {/* Stats */}
          <AthleteStats athlete={athlete} />

          {/* Private data */}
          {showPersonalData && <PersonalDataSection athlete={athlete} />}

          {/* Trajetória */}
          <TrajetoriaSection entries={athlete.trajetoria} />

          {/* Base salarial — scout view only */}
          {scout && athlete.baseSalarial > 0 && <SalaryCard value={athlete.baseSalarial} />}

          {/* Vídeos */}
          <VideoList videos={athlete.videos} />

          {/* Logout */}
          {!scout && (
            <Pressable onPress={handleSignOut} style={styles.logoutRow} accessibilityRole="button">
              <Text variant="sm" color={colors.statusEmpregado}>Sair da conta ›</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Scout sticky CTA */}
      {scout && isContractor && (
        <View style={styles.footer}>
          <Button label="Conversar" chevron fullWidth loading={chatLoading} onPress={openChat} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
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
  scroll: {
    paddingBottom: spacing['4xl'],
  },
  body: {
    paddingHorizontal: '5%',
    paddingTop: spacing['2xl'],
    gap: spacing['2xl'],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfBtn: {
    flex: 1,
  },
  logoutRow: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    backgroundColor: colors.bg,
  },
});
