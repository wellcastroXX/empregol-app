import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { Avatar, ChipGroup, EmptyState, Screen, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { conversationsApi, type ApiConversation } from '@/services/api/conversations-api';
import { colors, fontFamily, palette, radii, spacing } from '@/theme';
import { timeAgoShort } from '@/utils';

type Filter = 'TODAS' | 'NAO_LIDAS';

const LIGHT = { bg: colors.bg, fg: colors.fg, muted: colors.fgMuted, rule: colors.rule };
const DARK = { bg: palette.tinta, fg: palette.giz, muted: palette.cinzaOnDark, rule: palette.ruleOnDark };

/** Conversas — real list from GET /conversations, styled per the reference. */
export function ConversasScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const isAthlete = user?.role === 'athlete';
  const t = isAthlete ? LIGHT : DARK;
  const [items, setItems] = useState<ApiConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('TODAS');

  const load = useCallback(async () => {
    try {
      setItems(await conversationsApi.listMine());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refetch every time the tab regains focus (e.g. after opening/closing a chat).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const unreadOf = useCallback(
    (c: ApiConversation) => (isAthlete ? c.athleteUnreadCount : c.contractorUnreadCount),
    [isAthlete],
  );

  const unreadTotal = useMemo(() => items.filter((c) => unreadOf(c) > 0).length, [items, unreadOf]);
  const visible = useMemo(
    () => (filter === 'NAO_LIDAS' ? items.filter((c) => unreadOf(c) > 0) : items),
    [items, filter, unreadOf],
  );

  function openChat(c: ApiConversation) {
    const name = isAthlete ? c.contractor?.name : c.athlete?.fullName;
    const subtitle = isAthlete
      ? c.contractor?.type === 'AGENT'
        ? 'AGENTE'
        : 'CLUBE'
      : (c.athlete?.position ?? '').toUpperCase();
    conversationsApi.markRead(c.id).catch(() => {});
    router.push({ pathname: '/conversas/[id]', params: { id: c.id, name: name ?? '', subtitle } });
  }

  const count = items.length;
  const headline = isAthlete
    ? `${count} ${count === 1 ? 'clube quer' : 'clubes querem'}\nte ver jogar`
    : `${count} ${count === 1 ? 'atleta' : 'atletas'}\nno teu radar`;

  return (
    <Screen
      scroll
      padded={false}
      surface={t.bg}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }>
      <StatusBar style={isAthlete ? 'dark' : 'light'} />
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: t.rule }]}>
        <Text variant="eyebrow" color={t.fg}>
          C O N V E R S A S
        </Text>
        <Feather name="search" size={18} color={t.fg} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : count === 0 ? (
        <View style={styles.section}>
          <EmptyState
            icon="message-circle"
            title="Nenhuma conversa ainda.."
            message={
              isAthlete
                ? 'Quando um clube ou agente puxar papo, a conversa aparece aqui.'
                : 'Abra a vitrine e convide um atleta para conversar.'
            }
          />
        </View>
      ) : (
        <>
          {/* Hero */}
          <View style={styles.hero}>
            <Text variant="eyebrow" color={t.muted}>
              E S S A · S E M A N A
            </Text>
            <Text style={styles.headline} color={t.fg}>
              {headline}
              <Text style={styles.headline} color={colors.accent}>
                ..
              </Text>
            </Text>
            <ChipGroup<Filter>
              dark={!isAthlete}
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'TODAS', label: `TODAS · ${count}` },
                { value: 'NAO_LIDAS', label: `NÃO LIDAS · ${unreadTotal}` },
              ]}
            />
          </View>

          {/* List */}
          <View>
            {visible.map((c) => {
              const other = isAthlete ? c.contractor : c.athlete;
              const name = (isAthlete ? c.contractor?.name : c.athlete?.fullName) ?? 'Conversa';
              const unread = unreadOf(c);
              const isAgent = isAthlete && c.contractor?.type === 'AGENT';
              return (
                <Pressable
                  key={c.id}
                  style={({ pressed }) => [styles.row, { borderBottomColor: t.rule }, pressed && styles.rowPressed]}
                  onPress={() => openChat(c)}
                  accessibilityRole="button">
                  <Avatar name={name} uri={other?.avatarUrl ?? undefined} tone="bone" size={44} />
                  <View style={styles.rowBody}>
                    <View style={styles.nameLine}>
                      <Text variant="smMedium" color={t.fg} numberOfLines={1} style={styles.name}>
                        {name}
                      </Text>
                      <View style={styles.check}>
                        <Feather name="check" size={9} color={palette.giz} />
                      </View>
                      {isAgent && (
                        <View style={[styles.roleTag, { borderColor: t.rule }]}>
                          <Text style={styles.roleTagText} color={t.muted}>
                            AGENTE
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      variant="xs"
                      color={unread > 0 ? t.fg : t.muted}
                      numberOfLines={1}>
                      {c.lastMessagePreview ?? 'Sem mensagens ainda'}
                    </Text>
                  </View>
                  <View style={styles.rowMeta}>
                    {c.lastMessageAt && (
                      <Text variant="monoLabel" color={t.muted}>
                        {timeAgoShort(c.lastMessageAt)}
                      </Text>
                    )}
                    {unread > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText} color={palette.giz}>
                          {unread}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

const PAD = '5%';

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing['4xl'] },
  loader: { marginTop: spacing['2xl'] },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },

  section: { paddingHorizontal: PAD, paddingTop: spacing.xl },

  hero: {
    paddingHorizontal: PAD,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headline: {
    fontFamily: fontFamily.display,
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: -0.7,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: PAD,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  rowPressed: { opacity: 0.6 },
  rowBody: { flex: 1, gap: 3 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1 },
  check: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTag: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  roleTagText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  rowMeta: { alignItems: 'flex-end', gap: 6 },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 10,
    fontWeight: '600',
  },
});
