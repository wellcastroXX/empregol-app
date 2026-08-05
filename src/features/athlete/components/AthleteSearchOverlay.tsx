import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Tag, Text } from '@/components/ui';
import { POSITIONS } from '@/constants/positions';
import { colors, fontFamily, palette, radii, spacing } from '@/theme';
import type { AthleteProfile } from '@/types';

const posShort = (a: AthleteProfile) => POSITIONS.find((p) => p.value === a.posicao)?.short ?? '';

export type AthleteSearchOverlayProps = {
  visible: boolean;
  athletes: AthleteProfile[];
  onClose: () => void;
  onSelect: (id: string) => void;
  /** Ambiente escuro (home do agente). */
  dark?: boolean;
};

/**
 * Busca de atletas como overlay no topo: abre com slide (sobe até o topo) e, ao
 * fechar (X ou toque fora), desce de volta. Digitar filtra a lista; tocar num
 * atleta abre o perfil público.
 */
export function AthleteSearchOverlay({ visible, athletes, onClose, onSelect, dark }: AthleteSearchOverlayProps) {
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(visible);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) {
      setRendered(true);
      setQuery('');
      Animated.timing(anim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    } else {
      Keyboard.dismiss();
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
  }, [visible, anim]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return athletes.filter((a) => a.nome.toLowerCase().includes(term)).slice(0, 30);
  }, [athletes, query]);

  if (!rendered) return null;

  const t = dark
    ? { panel: palette.tinta, field: palette.tintaElev, border: palette.ruleOnDark, fg: palette.giz, muted: palette.cinzaOnDark }
    : { panel: colors.bg, field: palette.giz, border: colors.rule, fg: colors.fg, muted: colors.fgMuted };

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [140, 0] });

  return (
    <View style={styles.fill}>
      {/* Backdrop — toque fora fecha */}
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar busca">
        <Animated.View style={[styles.backdropFill, { opacity: anim }]} />
      </Pressable>

      {/* Painel de busca no topo */}
      <Animated.View
        style={[
          styles.panel,
          { backgroundColor: t.panel, paddingTop: insets.top + spacing.sm, opacity: anim, transform: [{ translateY }] },
        ]}>
        <View style={[styles.searchRow, { backgroundColor: t.field, borderColor: t.border }]}>
          <Feather name="search" size={18} color={t.muted} />
          <TextInput
            style={[styles.input, { color: t.fg }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar atleta pelo nome..."
            placeholderTextColor={t.muted}
            autoFocus
            autoCapitalize="none"
            returnKeyType="search"
          />
          <Pressable hitSlop={10} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar">
            <Feather name="x" size={22} color={t.fg} />
          </Pressable>
        </View>

        {query.trim().length > 0 && (
          <ScrollView
            style={styles.results}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {results.length === 0 ? (
              <Text variant="sm" color={t.muted} style={styles.empty}>
                Nenhum atleta encontrado.
              </Text>
            ) : (
              results.map((a) => {
                const livre = a.disponibilidade === 'livre';
                return (
                  <Pressable
                    key={a.id}
                    style={[styles.row, { borderBottomColor: t.border }]}
                    onPress={() => onSelect(a.id)}
                    accessibilityRole="button">
                    <View style={styles.rowBody}>
                      <Text variant="bodyMedium" color={t.fg} numberOfLines={1}>
                        {a.nome}
                      </Text>
                      <Text variant="monoLabel" color={t.muted}>
                        {posShort(a)} · {a.idade} ANOS
                      </Text>
                    </View>
                    <Tag label={livre ? 'LIVRE' : 'EMPREGADO'} variant={livre ? 'live' : 'empregado'} dot={livre} />
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropFill: {
    flex: 1,
    backgroundColor: palette.tinta64,
  },
  panel: {
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    maxHeight: '85%',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: radii.sm,
  },
  input: { flex: 1, fontFamily: fontFamily.text, fontSize: 15, padding: 0 },
  results: { marginTop: spacing.md },
  empty: { paddingVertical: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  rowBody: { flex: 1, gap: 2 },
});
