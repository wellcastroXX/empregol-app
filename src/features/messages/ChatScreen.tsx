import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { conversationsApi, type ApiMessage } from '@/services/api/conversations-api';
import { colors, palette, spacing, textVariants } from '@/theme';
import { timeAgoShort } from '@/utils';

export function ChatScreen() {
  const { id: conversationId, name: participantName } = useLocalSearchParams<{
    id: string;
    name?: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const loadMessages = useCallback(async (nextCursor?: string) => {
    if (!conversationId) return;
    try {
      const res = await conversationsApi.getMessages(conversationId, nextCursor);
      setMessages((prev) => (nextCursor ? [...prev, ...res.data] : res.data));
      setCursor(res.nextCursor);
      setHasMore(res.nextCursor !== null);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const loadOlder = useCallback(() => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    loadMessages(cursor);
  }, [hasMore, loadingMore, cursor, loadMessages]);

  const send = useCallback(async () => {
    const content = draft.trim();
    if (!content || sending || !conversationId) return;
    setSending(true);
    setDraft('');
    try {
      const msg = await conversationsApi.sendMessage(conversationId, content);
      setMessages((prev) => [msg, ...prev]);
    } catch {
      setDraft(content);
    } finally {
      setSending(false);
    }
  }, [draft, sending, conversationId]);

  const renderMessage = useCallback(({ item }: { item: ApiMessage }) => {
    const isOwn = item.senderUserId === user?.id;
    const text = item.type === 'TEXT' ? item.content
      : item.type === 'AUDIO' ? 'Mensagem de voz'
      : 'Convite de teste';

    return (
      <View style={[styles.msgRow, isOwn ? styles.msgRowOwn : styles.msgRowOther]}>
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          {text ? (
            <Text variant="body" color={isOwn ? colors.fgOnDark : colors.fg} style={styles.bubbleText}>
              {text}
            </Text>
          ) : null}
          <Text
            variant="monoLabel"
            color={isOwn ? palette.cinzaOnDark : colors.fgMuted}
            style={styles.timestamp}>
            {timeAgoShort(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => router.back()} accessibilityRole="button">
          <Feather name="arrow-left" size={22} color={colors.fg} />
        </Pressable>
        <View style={styles.headerAvatar}>
          <Avatar name={participantName ?? '?'} tone="bone" size={34} />
        </View>
        <Text variant="h3" color={colors.fg} numberOfLines={1} style={styles.headerName}>
          {participantName ?? 'Conversa'}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            inverted
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onEndReached={loadOlder}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text variant="body" color={colors.fgMuted} style={styles.emptyText}>
                  Nenhuma mensagem ainda..{'\n'}Inicie a conversa abaixo.
                </Text>
              </View>
            }
            ListFooterComponent={
              loadingMore ? <ActivityIndicator color={colors.accent} style={styles.footerLoader} /> : null
            }
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Mensagem..."
            placeholderTextColor={colors.fgMuted}
            multiline
            maxLength={2000}
            returnKeyType="default"
          />
          <Pressable
            style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!draft.trim() || sending}
            accessibilityRole="button"
            accessibilityLabel="Enviar">
            {sending ? (
              <ActivityIndicator size={16} color={palette.giz} />
            ) : (
              <Feather name="send" size={18} color={palette.giz} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  headerAvatar: { marginLeft: spacing.xs },
  headerName: { flex: 1 },

  list: {
    padding: spacing.lg,
    gap: spacing.sm,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  footerLoader: { paddingVertical: spacing.md },

  msgRow: { flexDirection: 'row', marginBottom: spacing.xs },
  msgRowOwn: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    gap: 4,
  },
  bubbleOwn: { backgroundColor: colors.fg },
  bubbleOther: { backgroundColor: colors.bgSunken },
  bubbleText: { lineHeight: 20 },
  timestamp: { textAlign: 'right' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['4xl'] },
  emptyText: { textAlign: 'center', lineHeight: 22 },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.bgElev,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.fg,
    ...textVariants.body,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
