import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, Text } from '@/components/ui';
import { ApiError } from '@/services/api/client';
import { mediaApi, type AthleteMedia } from '@/services/api/media-api';
import { colors, palette, radii, spacing } from '@/theme';

const ICON_BY_TYPE: Record<AthleteMedia['mediaType'], keyof typeof Feather.glyphMap> = {
  VIDEO: 'play',
  PHOTO: 'image',
  EXTERNAL_LINK: 'link',
};

const LABEL_BY_TYPE: Record<AthleteMedia['mediaType'], string> = {
  VIDEO: 'VÍDEO',
  PHOTO: 'FOTO',
  EXTERNAL_LINK: 'LINK',
};

/** "Minhas mídias" — lista a vitrine do atleta com opções de editar e remover. */
export function MinhasMidiasScreen() {
  const router = useRouter();
  const [media, setMedia] = useState<AthleteMedia[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    let active = true;
    mediaApi
      .listMine()
      .then((list) => active && setMedia(list))
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(load);

  const confirmDelete = (item: AthleteMedia) => {
    Alert.alert('Remover mídia', `Apagar "${item.title}" da sua vitrine?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            await mediaApi.remove(item.id);
            setMedia((list) => list.filter((m) => m.id !== item.id));
          } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Tente novamente.';
            Alert.alert('Não foi possível remover', message);
          }
        },
      },
    ]);
  };

  const edit = (item: AthleteMedia) => {
    router.push({
      pathname: '/nova-midia',
      params: {
        id: item.id,
        mediaType: item.mediaType,
        title: item.title,
        category: item.category ?? '',
        subcategory: item.subcategory ?? '',
        gameInfo: item.gameInfo ?? '',
        url: item.url,
        isPublic: String(item.isPublic),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.topBar}>
        <Pressable hitSlop={8} onPress={() => router.back()} accessibilityRole="button">
          <Text variant="eyebrow" color={colors.fg}>
            ‹ VOLTAR
          </Text>
        </Pressable>
        <Text variant="eyebrow" color={colors.fgMuted}>
          M I N H A S · M Í D I A S
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text variant="displaySm" color={colors.fg} style={styles.title}>
            Suas jogadas<Text variant="displaySm" color={colors.accent}>.</Text>
          </Text>

          {media.length === 0 ? (
            <EmptyState
              icon="video"
              title="Nenhuma mídia ainda.."
              message="Suba seus melhores vídeos e fotos. É o que clubes veem primeiro."
            />
          ) : (
            <View style={styles.list}>
              {media.map((item) => (
                <View key={item.id} style={styles.row}>
                  <View style={styles.thumb}>
                    <Feather name={ICON_BY_TYPE[item.mediaType]} size={18} color={palette.giz} />
                  </View>
                  <View style={styles.rowBody}>
                    <Text variant="bodyMedium" color={colors.fg} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text variant="sm" color={colors.fgMuted} numberOfLines={1}>
                      {[LABEL_BY_TYPE[item.mediaType], item.category?.toUpperCase(), item.gameInfo]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={() => edit(item)}
                    accessibilityRole="button"
                    accessibilityLabel="Editar"
                    style={styles.action}>
                    <Feather name="edit-2" size={18} color={colors.fg} />
                  </Pressable>
                  <Pressable
                    hitSlop={8}
                    onPress={() => confirmDelete(item)}
                    accessibilityRole="button"
                    accessibilityLabel="Apagar"
                    style={styles.action}>
                    <Feather name="trash-2" size={18} color={colors.statusEmpregado} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Footer CTA */}
      <View style={styles.footer}>
        <Button label="NOVA MÍDIA" chevron fullWidth onPress={() => router.push('/nova-midia')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: spacing.md,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: '5%', paddingBottom: spacing['4xl'], gap: spacing.lg },
  title: { marginTop: spacing.sm },
  list: { borderTopWidth: 1, borderTopColor: colors.rule },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: palette.tinta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 2 },
  action: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: '5%',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
});
