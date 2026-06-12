import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Tag, Text } from '@/components/ui';
import { POSITIONS } from '@/constants/positions';
import { conversationsApi } from '@/services/api/conversations-api';
import { profileService } from '@/services';
import { fontFamily, palette, radii, spacing } from '@/theme';
import type { AthleteProfile, ContractorProfile } from '@/types';
import { initials as toInitials, timeAgoShort } from '@/utils';

/** Dark canvas tokens for the contractor environment (#141413). */
const D = {
  bg: palette.tinta,
  elev: palette.tintaElev,
  fg: palette.giz,
  muted: palette.cinzaOnDark,
  rule: palette.ruleOnDark,
  accent: palette.gramado,
};

function dateEyebrow(): string {
  const now = new Date();
  const wd = now.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const mon = now.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return `${wd} · ${now.getDate()} · ${mon} · VITRINE`.toUpperCase();
}

const posShort = (a: AthleteProfile) => POSITIONS.find((p) => p.value === a.posicao)?.short ?? '';
const posLabel = (a: AthleteProfile) => POSITIONS.find((p) => p.value === a.posicao)?.label ?? '';
const heightM = (a: AthleteProfile) => `${(a.alturaCm / 100).toFixed(2)}M`;

export function ContractorHome({ contractor }: { contractor: ContractorProfile }) {
  const router = useRouter();
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [convCount, setConvCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    profileService
      .listAthletes()
      .then((data) => active && setAthletes(data))
      .catch(() => active && setAthletes([]))
      .finally(() => active && setLoading(false));
    conversationsApi
      .listMine()
      .then((cs) => {
        if (!active) return;
        setConvCount(cs.length);
        setUnread(cs.filter((c) => c.contractorUnreadCount > 0).length);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const clubName = contractor.razaoSocial ?? contractor.nome;
  const featured = athletes.slice(0, 6);
  const destaque = featured[0];
  const total = athletes.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Top bar — club identity + notifications */}
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText} color={palette.tinta}>
              {toInitials(clubName)}
            </Text>
          </View>
          <Text style={styles.brandName} color={D.fg} numberOfLines={1}>
            {clubName.toUpperCase()} · SCOUT
          </Text>
        </View>
        <Pressable hitSlop={8} onPress={() => router.push('/conversas')} accessibilityRole="button" accessibilityLabel="Notificações">
          <Feather name="bell" size={20} color={D.fg} />
          {unread > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText} color={D.fg}>
                {unread}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
      <View style={styles.topRule} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text variant="eyebrow" color={D.muted}>
            {dateEyebrow()}
          </Text>
          <Text style={styles.headline} color={D.fg}>
            <Text style={styles.headline} color={D.accent}>
              {total}
            </Text>
            {` atletas novos\npara você essa semana`}
            <Text style={styles.headline} color={D.accent}>
              .
            </Text>
          </Text>
          <Text variant="sm" color={D.muted}>
            Filtrados pelos teus critérios — ST livres ou em fim de contrato, 18–30 anos, 1.75m+.
          </Text>
        </View>

        {/* Search CTA */}
        <Pressable style={styles.search} onPress={() => router.push('/discover')} accessibilityRole="button">
          <Feather name="search" size={18} color={D.muted} />
          <Text variant="body" color={D.muted}>
            Buscar atleta · posição · status...
          </Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator color={D.accent} style={styles.loader} />
        ) : (
          <>
            {/* Destaque da semana */}
            {destaque && (
              <View style={styles.destaqueCard}>
                <View style={styles.destaqueBody}>
                  <Text style={styles.destaqueEyebrow} color={D.fg}>
                    D E S T A Q U E S · D A · S E M A N A
                  </Text>
                  <View style={styles.destaqueRow}>
                    {destaque.fotoUrl ? (
                      <Image source={{ uri: destaque.fotoUrl }} style={styles.destaquePhoto} contentFit="cover" />
                    ) : (
                      <View style={[styles.destaquePhoto, styles.destaquePhotoFallback]}>
                        <Text style={styles.destaquePhotoInit} color={palette.giz}>
                          {toInitials(destaque.nome)}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.destaqueName} color={D.fg} numberOfLines={2}>
                      {destaque.nome}
                    </Text>
                  </View>
                  <Text style={styles.destaqueCity} color={D.fg}>
                    {destaque.naturalidade?.toUpperCase()}
                  </Text>
                  <View style={styles.destaqueFooter}>
                    <Text variant="smMedium" color={D.fg}>
                      Entrou {timeAgoShort(destaque.criadoEm)} atrás
                    </Text>
                    <Text variant="sm" color="rgba(251,250,245,0.7)">
                      Está agora na <Text variant="smMedium" color={D.fg}>empregol</Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.dots}>
                  {featured.map((a, i) => (
                    <View key={a.id} style={[styles.dot, i === 0 && styles.dotActive]} />
                  ))}
                </View>
              </View>
            )}

            {/* Últimas visualizações */}
            {athletes.length > 0 && (
              <View style={styles.section}>
                <Text variant="eyebrow" color={D.muted}>
                  Ú L T I M A S · V I S U A L I Z A Ç Õ E S
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hList}>
                  {athletes.slice(0, 8).map((a) => (
                    <AthleteWideCard key={a.id} a={a} onPress={() => router.push(`/athletes/${a.id}`)} />
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}

        {/* Stats band */}
        <View style={styles.statsBand}>
          <StatCell value={String(total)} label="NOVOS HOJE" />
          <StatCell value="0" label="NOS FAVORITOS" />
          <StatCell value={String(convCount)} label="CONVERSAS" />
        </View>

        {/* Seus favoritos (preview usa atletas reais) */}
        {athletes.length > 0 && (
          <View style={styles.section}>
            <Text variant="eyebrow" color={D.muted}>
              S E U S · F A V O R I T O S
            </Text>
            <View style={styles.favGrid}>
              {athletes.slice(0, 5).map((a) => (
                <Pressable key={a.id} style={styles.favCell} onPress={() => router.push(`/athletes/${a.id}`)}>
                  {a.fotoUrl ? (
                    <Image source={{ uri: a.fotoUrl }} style={styles.favPhoto} contentFit="cover" />
                  ) : (
                    <Text style={styles.favNum} color={palette.tinta}>
                      {a.numero ?? posShort(a)}
                    </Text>
                  )}
                  <Text style={styles.favMeta} color={a.fotoUrl ? palette.giz : palette.tinta}>
                    {a.idade} {posShort(a)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AthleteWideCard({ a, onPress }: { a: AthleteProfile; onPress: () => void }) {
  const livre = a.disponibilidade === 'livre';
  const lastClub = a.stats?.ultimoClube;
  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      <View style={styles.cardTop}>
        <Tag label={livre ? 'LIVRE' : 'EMPREGADO'} variant={livre ? 'live' : 'empregado'} dot={livre} />
        <Text style={styles.cardAgeHeight} color={palette.cinza}>
          {a.idade} ANOS · {heightM(a)}
        </Text>
      </View>
      <Text style={styles.cardNum} color={palette.tinta}>
        {a.numero != null ? String(a.numero).padStart(2, '0') : posShort(a)}
      </Text>
      <Text style={styles.cardName} color={palette.tinta} numberOfLines={1}>
        {a.nome}
      </Text>
      <Text style={styles.cardPos} color={palette.cinza} numberOfLines={1}>
        {posLabel(a)} · {posShort(a)}
        {lastClub ? ` · Ex-${lastClub}` : ''}
      </Text>
      <View style={styles.cardRule} />
      <View style={styles.cardStats}>
        <View>
          <Text style={styles.cardStatValue} color={palette.tinta}>
            {a.stats?.gols ?? 0}
          </Text>
          <Text style={styles.cardStatLabel} color={palette.cinza}>
            GOLS / 24
          </Text>
        </View>
        <View style={styles.cardStatRight}>
          <Text style={styles.cardStatValue} color={palette.tinta}>
            {a.stats?.minutosNaTemporada ? `${a.stats.minutosNaTemporada.toLocaleString('pt-BR')}'` : "—"}
          </Text>
          <Text style={styles.cardStatLabel} color={palette.cinza}>
            MINUTOS
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue} color={palette.giz}>
        {value}
      </Text>
      <Text style={styles.statLabel} color="rgba(251,250,245,0.75)">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: D.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.xs,
    backgroundColor: palette.giz,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: { fontFamily: fontFamily.displayBold, fontSize: 12 },
  brandName: { fontFamily: fontFamily.monoMedium, fontSize: 11, letterSpacing: 1.4, flexShrink: 1 },
  bellBadge: {
    position: 'absolute',
    top: -5,
    right: -6,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    paddingHorizontal: 3,
    backgroundColor: palette.gramado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: { fontFamily: fontFamily.monoMedium, fontSize: 9, fontWeight: '700' },
  topRule: { height: 1, backgroundColor: D.rule, marginHorizontal: spacing.lg },

  scroll: { paddingBottom: spacing['4xl'], gap: spacing.xl },

  hero: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm },
  headline: { fontFamily: fontFamily.display, fontSize: 34, lineHeight: 36, letterSpacing: -0.6 },

  search: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(251,250,245,0.2)',
    backgroundColor: D.elev,
  },

  loader: { marginVertical: spacing.xl },
  section: { gap: spacing.md },

  destaqueCard: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    backgroundColor: palette.gramado,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(251,250,245,0.25)',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  destaqueBody: { flex: 1, gap: spacing.sm },
  destaqueEyebrow: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1.8,
    opacity: 0.85,
  },
  destaqueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  destaquePhoto: { width: 40, height: 40, borderRadius: radii.xs, backgroundColor: palette.tinta },
  destaquePhotoFallback: { alignItems: 'center', justifyContent: 'center' },
  destaquePhotoInit: { fontFamily: fontFamily.displayBold, fontSize: 15 },
  destaqueName: { flex: 1, fontFamily: fontFamily.displayBold, fontSize: 22, lineHeight: 24, letterSpacing: -0.3 },
  destaqueCity: { fontFamily: fontFamily.monoMedium, fontSize: 10, letterSpacing: 1.4, textAlign: 'right', opacity: 0.85 },
  destaqueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dots: { justifyContent: 'center', gap: 5, paddingLeft: spacing.xs },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(251,250,245,0.4)' },
  dotActive: { backgroundColor: palette.giz },

  hList: { gap: spacing.md, paddingHorizontal: spacing.lg },
  card: {
    width: 220,
    backgroundColor: palette.giz,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: 6,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardAgeHeight: { fontFamily: fontFamily.monoMedium, fontSize: 10, letterSpacing: 0.6 },
  cardNum: { fontFamily: fontFamily.monoMedium, fontSize: 56, lineHeight: 60, letterSpacing: -3, fontVariant: ['tabular-nums'] },
  cardName: { fontFamily: fontFamily.displayBold, fontSize: 18, letterSpacing: -0.3 },
  cardPos: { fontFamily: fontFamily.text, fontSize: 12 },
  cardRule: { height: 1, backgroundColor: palette.osso, marginVertical: spacing.sm },
  cardStats: { flexDirection: 'row', justifyContent: 'space-between' },
  cardStatRight: { alignItems: 'flex-end' },
  cardStatValue: { fontFamily: fontFamily.monoMedium, fontSize: 20, fontVariant: ['tabular-nums'] },
  cardStatLabel: { fontFamily: fontFamily.monoMedium, fontSize: 9, letterSpacing: 1.2, marginTop: 2 },

  statsBand: {
    flexDirection: 'row',
    backgroundColor: palette.gramado,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  statCell: { flex: 1, gap: spacing.xs },
  statValue: { fontFamily: fontFamily.monoMedium, fontSize: 30, lineHeight: 32, fontVariant: ['tabular-nums'] },
  statLabel: { fontFamily: fontFamily.monoMedium, fontSize: 9.5, letterSpacing: 1.2 },

  favGrid: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg },
  favCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radii.sm,
    backgroundColor: palette.osso,
    overflow: 'hidden',
    padding: 6,
    justifyContent: 'space-between',
  },
  favPhoto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  favNum: { fontFamily: fontFamily.monoMedium, fontSize: 22, lineHeight: 24, letterSpacing: -1 },
  favMeta: { fontFamily: fontFamily.monoMedium, fontSize: 9, letterSpacing: 0.6 },
});
