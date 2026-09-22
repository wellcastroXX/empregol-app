import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';
import { io, type Socket } from 'socket.io-client';

import { Avatar, Text } from '@/components/ui';
import { env } from '@/config/env';
import { useAuth } from '@/context/AuthContext';
import { conversationsApi, type ApiMessage } from '@/services/api/conversations-api';
import { colors, fontFamily, palette, radii, spacing, textVariants } from '@/theme';

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const pad2 = (n: number) => String(n).padStart(2, '0');
const dayKey = (iso: string) => new Date(iso).toDateString();
const dayLabel = (iso: string) => {
  const d = new Date(iso);
  return `${WEEKDAYS[d.getDay()]} · ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
const clockTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const WAVEFORM = [6, 14, 9, 18, 11, 22, 12, 16, 7, 13, 9, 15, 8];

export function ChatScreen() {
  const {
    id: conversationId,
    name: participantName,
    subtitle,
  } = useLocalSearchParams<{ id: string; name?: string; subtitle?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, session } = useAuth();

  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<TextInput>(null);
  const socketRef = useRef<Socket | null>(null);

  /**
   * Adiciona uma mensagem evitando duplicar. Se for a própria mensagem chegando
   * (echo do socket ou resposta REST), remove o "otimista" temporário de mesmo
   * conteúdo — assim a mensagem aparece na hora e é reconciliada com a real.
   */
  const receiveMessage = useCallback(
    (msg: ApiMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        let base = prev;
        if (msg.senderUserId === user?.id) {
          const i = base.findIndex(
            (m) =>
              m.id.startsWith('temp:') &&
              m.senderUserId === user?.id &&
              m.content === msg.content,
          );
          if (i !== -1) base = base.filter((_, idx) => idx !== i);
        }
        return [msg, ...base];
      });
    },
    [user?.id],
  );

  // Tema por papel: agente/clube vê o chat dark; atleta vê claro.
  const dark = user?.role === 'contractor';
  const t = dark
    ? {
        bg: palette.tinta,
        elev: palette.tintaElev,
        fg: palette.giz,
        muted: palette.cinzaOnDark,
        rule: palette.ruleOnDark,
        ownBg: palette.giz,
        ownText: palette.tinta,
        otherBg: palette.tintaElev,
        otherText: palette.giz,
        sendBg: palette.gramado,
      }
    : {
        bg: colors.bg,
        elev: colors.bgElev,
        fg: colors.fg,
        muted: colors.fgMuted,
        rule: colors.rule,
        ownBg: colors.fg,
        ownText: colors.fgOnDark,
        otherBg: colors.bgElev,
        otherText: colors.fg,
        sendBg: colors.fg,
      };

  const loadMessages = useCallback(
    async (nextCursor?: string) => {
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
    },
    [conversationId],
  );

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Tempo real: conecta no socket, entra na sala e ouve novas mensagens.
  useEffect(() => {
    if (!conversationId || !session?.accessToken) return;
    // Sem forçar 'websocket': deixa o socket.io negociar (polling → upgrade),
    // senão a conexão quebra atrás do túnel Cloudflare/Traefik (WS-only falha).
    const socket = io(env.apiUrl, {
      auth: { token: session.accessToken },
      transports: ['polling', 'websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('conversation:join', conversationId);
      socket.emit('message:read', conversationId);
    });
    socket.on('connect_error', (err) => {
      if (__DEV__) console.warn('[chat] socket connect_error:', err.message);
    });
    socket.on('message:new', (msg: ApiMessage) => {
      if (msg.conversationId === conversationId) receiveMessage(msg);
    });

    return () => {
      socket.off('message:new');
      socket.off('connect_error');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, session?.accessToken, receiveMessage]);

  // Garantia de "quase tempo real": enquanto a tela está aberta, revalida as
  // mensagens recentes e mescla as novas (dedup por id). Cobre o caso do socket
  // não entregar — a recebida aparece sem precisar sair e voltar.
  useEffect(() => {
    if (!conversationId) return;
    const timer = setInterval(async () => {
      try {
        const res = await conversationsApi.getMessages(conversationId);
        [...res.data].reverse().forEach(receiveMessage);
      } catch {
        // silencioso — próxima iteração tenta de novo
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [conversationId, receiveMessage]);

  const loadOlder = useCallback(() => {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    loadMessages(cursor);
  }, [hasMore, loadingMore, cursor, loadMessages]);

  const send = useCallback(async () => {
    const content = draft.trim();
    if (!content || !conversationId || !user?.id) return;
    setDraft('');

    // Render otimista: a mensagem aparece na hora com um id temporário. Quando a
    // versão real chega (echo do socket ou resposta REST), `receiveMessage`
    // reconcilia trocando o temporário pelo real.
    const optimistic: ApiMessage = {
      id: `temp:${Date.now()}`,
      conversationId,
      senderUserId: user.id,
      type: 'TEXT',
      content,
      audioUrl: null,
      proposalId: null,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [optimistic, ...prev]);

    const socket = socketRef.current;
    if (socket?.connected) {
      // Servidor faz broadcast `message:new` p/ a sala (real-time nos dois lados).
      socket.emit('message:send', { conversationId, type: 'TEXT', content });
      return;
    }
    // Fallback REST (socket offline): a resposta traz a mensagem real.
    try {
      const msg = await conversationsApi.sendMessage(conversationId, content);
      receiveMessage(msg);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(content); // devolve o texto pro input
    }
  }, [draft, conversationId, user?.id, receiveMessage]);

  // data is newest-first (inverted list); the visually-previous bubble is messages[index+1].
  const renderMessage = useCallback(
    ({ item, index }: { item: ApiMessage; index: number }) => {
      const isOwn = item.senderUserId === user?.id;
      const older = messages[index + 1];
      const showDay = !older || dayKey(older.createdAt) !== dayKey(item.createdAt);
      const showName =
        !isOwn && (!older || older.senderUserId !== item.senderUserId || showDay);
      const read = item.readAt != null;

      return (
        <View>
          {showDay && (
            <View style={styles.dayDivider}>
              <View style={[styles.dayLine, { backgroundColor: t.rule }]} />
              <Text style={styles.dayLabel} color={t.muted}>
                {dayLabel(item.createdAt)}
              </Text>
              <View style={[styles.dayLine, { backgroundColor: t.rule }]} />
            </View>
          )}

          <View style={[styles.msgRow, isOwn ? styles.alignEnd : styles.alignStart]}>
            <View style={styles.msgCol}>
              {showName && (
                <Text style={styles.sender} color={t.muted} numberOfLines={1}>
                  {participantName ?? 'Conversa'}
                </Text>
              )}

              <View
                style={[
                  styles.bubble,
                  isOwn
                    ? [styles.bubbleOwn, { backgroundColor: t.ownBg }]
                    : [styles.bubbleOther, { backgroundColor: t.otherBg, borderColor: t.rule }],
                ]}>
                {item.type === 'AUDIO' ? (
                  <View style={styles.voice}>
                    <Feather name="play" size={14} color={isOwn ? t.ownText : t.otherText} />
                    <View style={styles.wave}>
                      {WAVEFORM.map((h, i) => (
                        <View
                          key={i}
                          style={[
                            styles.waveBar,
                            { height: h, backgroundColor: isOwn ? t.ownText : t.otherText, opacity: i > 7 ? 0.4 : 1 },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                ) : item.type === 'INVITE_CARD' ? (
                  <InviteCard title={participantName ?? 'Convite'} dark={dark} />
                ) : (
                  <Text
                    variant="body"
                    color={isOwn ? t.ownText : t.otherText}
                    style={styles.bubbleText}>
                    {item.content}
                  </Text>
                )}
              </View>

              <View style={[styles.metaRow, isOwn ? styles.alignEnd : styles.alignStart]}>
                <Text style={styles.metaText} color={t.muted}>
                  {clockTime(item.createdAt)}
                </Text>
                {isOwn && (
                  <Text
                    style={styles.metaText}
                    color={read ? colors.accent : t.muted}>
                    · {read ? 'LIDA' : 'ENVIADA'}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      );
    },
    [user?.id, messages, participantName, t, dark],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={['top', 'left', 'right']}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.rule }]}>
        <Pressable hitSlop={10} onPress={() => router.back()} accessibilityRole="button">
          <Feather name="chevron-left" size={24} color={t.fg} />
        </Pressable>
        <Avatar name={participantName ?? '?'} tone="bone" size={32} />
        <View style={styles.headerText}>
          <View style={styles.headerNameRow}>
            <Text style={styles.headerName} color={t.fg} numberOfLines={1}>
              {participantName ?? 'Conversa'}
            </Text>
            <View style={styles.check}>
              <Feather name="check" size={9} color={palette.giz} />
            </View>
          </View>
          {!!subtitle && (
            <Text style={styles.headerSub} color={t.muted} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        <Feather name="more-horizontal" size={20} color={t.fg} />
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
                <Text variant="body" color={t.muted} style={styles.emptyText}>
                  Nenhuma mensagem ainda..{'\n'}Inicie a conversa abaixo.
                </Text>
              </View>
            }
            ListFooterComponent={
              loadingMore ? <ActivityIndicator color={colors.accent} style={styles.footerLoader} /> : null
            }
          />
        )}

        {/* Composer */}
        <View
          style={[
            styles.composer,
            { borderTopColor: t.rule, backgroundColor: t.bg, paddingBottom: insets.bottom + spacing.md },
          ]}>
          <Pressable
            style={[styles.plusBtn, { backgroundColor: t.elev, borderColor: t.rule }]}
            accessibilityRole="button"
            accessibilityLabel="Anexar">
            <Feather name="plus" size={20} color={t.fg} />
          </Pressable>
          <TextInput
            ref={inputRef}
            style={[styles.input, { backgroundColor: t.elev, borderColor: t.rule, color: t.fg }]}
            value={draft}
            onChangeText={setDraft}
            placeholder="Escreve uma mensagem..."
            placeholderTextColor={t.muted}
            maxLength={2000}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={send}
          />
          <Pressable
            style={[styles.sendBtn, { backgroundColor: t.sendBg }, !draft.trim() && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!draft.trim()}
            accessibilityRole="button"
            accessibilityLabel="Enviar">
            <Feather name="chevron-right" size={20} color={palette.giz} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Test-invite card rendered inside the thread (INVITE_CARD message). */
function InviteCard({ title, dark }: { title: string; dark?: boolean }) {
  const fg = dark ? palette.giz : colors.fg;
  const muted = dark ? palette.cinzaOnDark : colors.fgMuted;
  return (
    <View style={styles.invite}>
      <Text style={styles.inviteEyebrow} color={muted}>
        C O N V I T E · D E · T E S T E
      </Text>
      <Text style={styles.inviteTitle} color={fg}>
        {title}
        <Text style={styles.inviteTitle} color={colors.accent}>
          .
        </Text>
      </Text>
      <View style={styles.inviteBtns}>
        <Pressable
          style={[styles.inviteBtn, styles.inviteConfirm]}
          onPress={() => Alert.alert('Em breve', 'Confirmação de convite disponível em breve.')}
          accessibilityRole="button">
          <Text style={styles.inviteBtnLabel} color={palette.giz}>
            CONFIRMAR
          </Text>
        </Pressable>
        <Pressable
          style={[styles.inviteBtn, styles.inviteDecline, { borderColor: fg }]}
          onPress={() => Alert.alert('Em breve', 'Recusa de convite disponível em breve.')}
          accessibilityRole="button">
          <Text style={styles.inviteBtnLabel} color={fg}>
            RECUSAR
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  headerText: { flex: 1, gap: 2 },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerName: { fontFamily: fontFamily.display, fontSize: 15, flexShrink: 1 },
  headerSub: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 9.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  check: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: { padding: spacing.lg, flexGrow: 1, justifyContent: 'flex-end' },
  footerLoader: { paddingVertical: spacing.md },

  dayDivider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  dayLine: { flex: 1, height: 1, backgroundColor: colors.rule },
  dayLabel: { fontFamily: fontFamily.monoMedium, fontSize: 10, letterSpacing: 2 },

  msgRow: { flexDirection: 'row', marginBottom: spacing.sm },
  alignEnd: { justifyContent: 'flex-end' },
  alignStart: { justifyContent: 'flex-start' },
  msgCol: { maxWidth: '80%' },
  sender: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 9.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginLeft: 2,
  },

  bubble: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md },
  bubbleOwn: { backgroundColor: colors.fg, borderBottomRightRadius: 2 },
  bubbleOther: {
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.rule,
    borderBottomLeftRadius: 2,
  },
  bubbleText: { lineHeight: 20 },

  voice: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minWidth: 160 },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 },
  waveBar: { width: 2, borderRadius: 1 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  metaText: { fontFamily: fontFamily.monoMedium, fontSize: 9.5, letterSpacing: 1 },

  invite: { width: 230 },
  inviteEyebrow: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inviteTitle: { fontFamily: fontFamily.display, fontSize: 18, lineHeight: 21 },
  inviteBtns: { flexDirection: 'row', gap: 6, marginTop: 14 },
  inviteBtn: {
    flex: 1,
    height: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteConfirm: { backgroundColor: colors.accent },
  inviteDecline: { borderWidth: 1, borderColor: colors.fg },
  inviteBtnLabel: { fontFamily: fontFamily.monoMedium, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['4xl'] },
  emptyText: { textAlign: 'center', lineHeight: 22 },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    backgroundColor: colors.bg,
  },
  plusBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 120,
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.fg,
    ...textVariants.body,
  },
  sendBtn: {
    width: 46,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.fg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
