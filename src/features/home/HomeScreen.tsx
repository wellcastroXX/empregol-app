import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Logo, Tag, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { dashboardApi, type AthleteDashboard } from '@/services/api/dashboard-api';
import { colors, fontFamily, palette, radii, spacing } from '@/theme';
import type { AthleteProfile } from '@/types';
import { timeAgoShort } from '@/utils';

const CONTRACTOR_LABEL: Record<'AGENT' | 'CLUB', string> = { AGENT: 'AGENTE', CLUB: 'CLUBE' };

function dateEyebrow(): string {
  const now = new Date();
  const wd = now.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const mon = now.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return `${wd} · ${now.getDate()} · ${mon}`.toUpperCase();
}

export function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  if (!user) return null;

  const isAthlete = user.role === 'athlete';
  const jersey =
    isAthlete && (user as AthleteProfile).numero != null
      ? String((user as AthleteProfile).numero).padStart(2, '0')
      : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Logo size={22} />
        <View style={styles.topRight}>
          <Text variant="h3" color={colors.fg}>
            ★
          </Text>
          {jersey && (
            <View style={styles.jerseyBadge}>
              <Text style={styles.jerseyBadgeText} color={palette.giz}>
                {jersey}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isAthlete ? (
          <AthleteHome athlete={user as AthleteProfile} onEdit={() => router.push('/profile')} />
        ) : (
          <ContractorHome onOpenVitrine={() => router.push('/discover')} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ───────────────────────── Athlete view (real dashboard) ───────────────────── */

function AthleteHome({ athlete, onEdit }: { athlete: AthleteProfile; onEdit: () => void }) {
  const [data, setData] = useState<AthleteDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    dashboardApi
      .getAthleteDashboard()
      .then((d) => active && setData(d))
      .catch(() => active && setData(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const destaque = data?.recentClubs[0];
  const convite = data?.latestProposal;
  const viewers = data?.whoViewedToday ?? [];

  return (
    <>
      <View style={styles.greetBlock}>
        <Text variant="eyebrow" color={colors.fgMuted}>
          {dateEyebrow()}
        </Text>
        <Text style={styles.greet}>
          <Text style={styles.greet} color={colors.accent}>
            Olá{' '}
          </Text>
          <Text style={styles.greet} color={colors.fg}>
            {athlete.nome}
          </Text>
        </Text>
      </View>
      <View style={styles.rule} />

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : (
        <>
          {/* Stats */}
          <View style={styles.stats}>
            <StatCell value={String(data?.stats.viewsToday ?? 0)} label="viram hoje" up={!!data?.stats.viewsToday} />
            <StatCell value={String(data?.stats.pendingProposals ?? 0)} label="propostas" />
            <StatCell value={`${data?.stats.daysOnPlatform ?? 0}d`} label="na vitrine" />
          </View>

          {/* Destaque da semana */}
          {destaque && (
            <View style={styles.darkCard}>
              <View style={styles.darkBody}>
                <Text variant="monoLabel" color={palette.cinzaOnDark}>
                  D E S T A Q U E S · D A · S E M A N A
                </Text>
                <View style={styles.destaqueRow}>
                  <Avatar name={destaque.name} uri={destaque.avatarUrl ?? undefined} tone="bone" size={44} />
                  <Text style={styles.destaqueName} color={palette.giz}>
                    {destaque.companyName ?? destaque.name}
                  </Text>
                </View>
                {destaque.user?.createdAt && (
                  <Text variant="sm" color={palette.cinzaOnDark}>
                    Entrou há{' '}
                    <Text variant="smMedium" color={colors.accent}>
                      {timeAgoShort(destaque.user.createdAt)}
                    </Text>
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Novo convite */}
          {convite && (
            <View style={styles.section}>
              <Text variant="eyebrow" color={colors.fgMuted}>
                N O V O · C O N V I T E
              </Text>
              <View style={styles.inviteCard}>
                <View style={styles.inviteTop}>
                  <Avatar name={convite.contractor.name} uri={convite.contractor.avatarUrl ?? undefined} tone="bone" size={40} />
                  <View style={styles.inviteInfo}>
                    <Text variant="bodyMedium" color={palette.giz} numberOfLines={1}>
                      {convite.contractor.companyName ?? convite.contractor.name}
                    </Text>
                    <Text variant="monoLabel" color={palette.cinzaOnDark}>
                      {CONTRACTOR_LABEL[convite.contractor.type]}
                    </Text>
                  </View>
                  <Tag label="NOVO" variant="live" dot />
                </View>
                <Text style={styles.inviteHeadline} color={palette.giz}>
                  Quer conversar com você!
                </Text>
                <View style={styles.inviteActions}>
                  <View style={styles.inviteCta}>
                    <Button label="CONVERSAR" chevron fullWidth onPress={() => {}} />
                  </View>
                  <Pressable style={styles.remarcar} accessibilityRole="button" onPress={() => {}}>
                    <Text variant="smMedium" color={palette.giz}>
                      REMARCAR
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Quem te viu */}
          <View style={styles.section}>
            <Text variant="eyebrow" color={colors.fgMuted}>
              Q U E M · T E · V I U · H O J E
            </Text>
            {viewers.length === 0 ? (
              <Text variant="sm" color={colors.fgMuted}>
                Ninguém ainda hoje. Mantenha sua vitrine ativa..
              </Text>
            ) : (
              <View>
                {viewers.map((v) => (
                  <View key={v.id} style={styles.scoutRow}>
                    <Avatar name={v.contractor.name} uri={v.contractor.avatarUrl ?? undefined} tone="bone" size={36} />
                    <View style={styles.scoutInfo}>
                      <Text variant="smMedium" color={colors.fg} numberOfLines={1}>
                        {v.contractor.name}
                      </Text>
                      <Text variant="monoLabel" color={colors.fgMuted}>
                        {CONTRACTOR_LABEL[v.contractor.type]}
                      </Text>
                    </View>
                    <Text variant="monoLabel" color={colors.fgMuted}>
                      {timeAgoShort(v.viewedAt)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      )}

      {/* Suggested action */}
      <View style={styles.suggest}>
        <View style={styles.suggestText}>
          <Text variant="h3" color={colors.fg}>
            Sobe um vídeo{'\n'}novo essa semana.
          </Text>
          <Text variant="xs" color={colors.fgMuted}>
            Perfis com vídeo recebem 3× mais propostas.
          </Text>
        </View>
        <Button label="SUBIR" chevron variant="ink" size="sm" onPress={onEdit} />
      </View>
    </>
  );
}

/* ───────────────────────── Contractor view ───────────────────────── */

function ContractorHome({ onOpenVitrine }: { onOpenVitrine: () => void }) {
  return (
    <>
      <View style={styles.greetBlock}>
        <Text variant="eyebrow" color={colors.fgMuted}>
          {dateEyebrow()}
        </Text>
        <Text variant="displayMd" color={colors.fg}>
          Talento livre{'\n'}te esperando
          <Text variant="displayMd" color={colors.accent}>
            ..
          </Text>
        </Text>
        <Text variant="sm" color={colors.fgMuted}>
          Filtre atletas livres, monte sua shortlist e convide para teste.
        </Text>
      </View>
      <Button label="Abrir a vitrine" chevron fullWidth onPress={onOpenVitrine} />
    </>
  );
}

/* ───────────────────────── Atoms ───────────────────────── */

function StatCell({ value, label, up }: { value: string; label: string; up?: boolean }) {
  return (
    <View style={styles.statCell}>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue} color={colors.fg}>
          {value}
        </Text>
        {up && (
          <Text style={styles.statUp} color={colors.accent}>
            ↑
          </Text>
        )}
      </View>
      <Text variant="monoLabel" color={colors.fgMuted}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  jerseyBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 4,
    borderRadius: radii.xs,
    backgroundColor: palette.tinta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jerseyBadgeText: { fontFamily: fontFamily.monoMedium, fontSize: 13, fontVariant: ['tabular-nums'] },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'], gap: spacing.xl },
  greetBlock: { gap: spacing.sm },
  greet: { fontFamily: fontFamily.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.4 },
  rule: { height: 1.5, backgroundColor: colors.ruleStrong, marginTop: -spacing.sm },
  loader: { marginVertical: spacing['2xl'] },
  stats: { flexDirection: 'row' },
  statCell: { flex: 1, gap: spacing.xs },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statValue: { fontFamily: fontFamily.monoMedium, fontSize: 28, lineHeight: 30, fontVariant: ['tabular-nums'] },
  statUp: { fontFamily: fontFamily.monoMedium, fontSize: 16 },
  darkCard: { flexDirection: 'row', backgroundColor: palette.tinta, borderRadius: radii.md, padding: spacing.lg, gap: spacing.sm },
  darkBody: { flex: 1, gap: spacing.md },
  destaqueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  destaqueName: { flex: 1, fontFamily: fontFamily.displayBold, fontSize: 22, lineHeight: 24, letterSpacing: -0.3 },
  section: { gap: spacing.md },
  inviteCard: { backgroundColor: palette.tinta, borderRadius: radii.md, padding: spacing.lg, gap: spacing.lg },
  inviteTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  inviteInfo: { flex: 1, gap: 2 },
  inviteHeadline: { fontFamily: fontFamily.display, fontSize: 22, lineHeight: 26, letterSpacing: -0.3 },
  inviteActions: { flexDirection: 'row', gap: spacing.md },
  inviteCta: { flex: 1 },
  remarcar: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: palette.giz,
    borderRadius: radii.sm,
  },
  scoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  scoutInfo: { flex: 1, gap: 2 },
  suggest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: palette.osso,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  suggestText: { flex: 1, gap: spacing.xs },
});
