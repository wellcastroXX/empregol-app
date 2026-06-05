import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { Avatar, EmptyState, Screen, ScreenHeader, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { conversationsApi, type ApiConversation } from '@/services/api/conversations-api';
import { colors, spacing } from '@/theme';
import { timeAgoShort } from '@/utils';

/** Conversas — real list from GET /conversations. Tap a row to open the thread. */
export function ConversasScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const isAthlete = user?.role === 'athlete';
  const [items, setItems] = useState<ApiConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await conversationsApi.listMine();
      setItems(data);
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

  function openChat(c: ApiConversation) {
    const name = isAthlete ? c.contractor?.name : c.athlete?.fullName;
    conversationsApi.markRead(c.id).catch(() => {});
    router.push({ pathname: '/conversas/[id]', params: { id: c.id, name: name ?? '' } });
  }

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }>
      <ScreenHeader eyebrow="M E N S A G E N S" title="Conversas" />

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="message-circle"
          title="Nenhuma conversa ainda.."
          message={
            isAthlete
              ? 'Quando um clube ou agente puxar papo, a conversa aparece aqui.'
              : 'Abra a vitrine e convide um atleta para conversar.'
          }
        />
      ) : (
        <View>
          {items.map((c) => {
            const other = isAthlete ? c.contractor : c.athlete;
            const name = isAthlete ? c.contractor?.name : c.athlete?.fullName;
            const unread = (isAthlete ? c.athleteUnreadCount : c.contractorUnreadCount) > 0;
            return (
              <Pressable
                key={c.id}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => openChat(c)}
                accessibilityRole="button">
                <Avatar name={name ?? '?'} uri={other?.avatarUrl ?? undefined} tone="bone" size={44} />
                <View style={styles.body}>
                  <Text variant="smMedium" color={colors.fg} numberOfLines={1}>
                    {name ?? 'Conversa'}
                  </Text>
                  <Text variant="xs" color={colors.fgMuted} numberOfLines={1}>
                    {c.lastMessagePreview ?? 'Sem mensagens ainda'}
                  </Text>
                </View>
                <View style={styles.meta}>
                  {c.lastMessageAt && (
                    <Text variant="monoLabel" color={colors.fgMuted}>
                      {timeAgoShort(c.lastMessageAt)}
                    </Text>
                  )}
                  {unread && <View style={styles.unreadDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing['2xl'] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  rowPressed: { opacity: 0.6 },
  body: { flex: 1, gap: 2 },
  meta: { alignItems: 'flex-end', gap: spacing.xs },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
});
