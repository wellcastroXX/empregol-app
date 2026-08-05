import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, SelectField, TextField, Text } from '@/components/ui';
import type { Option } from '@/constants/positions';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/api/client';
import { mediaApi } from '@/services/api/media-api';
import { colors, fontFamily, palette, radii, spacing } from '@/theme';
import type { AthleteProfile } from '@/types';

type MediaKind = 'video' | 'foto' | 'link';

/** A locally-picked file sent to the upload endpoint as multipart. */
type PickedAsset = {
  uri: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  duration?: number | null;
};

const TABS: { key: MediaKind; label: string }[] = [
  { key: 'video', label: 'VÍDEO' },
  { key: 'foto', label: 'FOTO' },
  { key: 'link', label: 'LINK EXTERNO' },
];

const CATEGORIAS: Option<string>[] = [
  { value: 'gols', label: 'Gols' },
  { value: 'assistencias', label: 'Assistências' },
  { value: 'defesas', label: 'Defesas' },
  { value: 'dribles', label: 'Dribles' },
  { value: 'jogo_completo', label: 'Jogo completo' },
  { value: 'treino', label: 'Treino' },
];

const SUBCATEGORIAS: Option<string>[] = [
  { value: 'cabeca', label: 'De cabeça' },
  { value: 'falta', label: 'De falta' },
  { value: 'penalti', label: 'Pênalti' },
  { value: 'fora_area', label: 'Fora da área' },
  { value: 'contra_ataque', label: 'Contra-ataque' },
];

/** bytes → "62 MB" (omitted when size is unknown). */
function formatSize(bytes?: number): string | null {
  if (!bytes) return null;
  const mb = bytes / 1_000_000;
  return mb >= 1 ? `${mb.toFixed(0)} MB` : `${(bytes / 1000).toFixed(0)} KB`;
}

/** ms → "2:18". */
function formatDuration(ms?: number | null): string | null {
  if (!ms) return null;
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Best-effort mime type: picker value → extension → kind fallback. */
function resolveMime(a: ImagePicker.ImagePickerAsset, kind: 'video' | 'foto'): string {
  if (a.mimeType) return a.mimeType;
  const ext = (a.fileName ?? a.uri).split('.').pop()?.toLowerCase();
  const byExt: Record<string, string> = {
    mp4: 'video/mp4', mov: 'video/quicktime', mkv: 'video/x-matroska', webm: 'video/webm',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic',
  };
  if (ext && byExt[ext]) return byExt[ext];
  return kind === 'video' ? 'video/mp4' : 'image/jpeg';
}

function toAsset(a: ImagePicker.ImagePickerAsset, kind: 'video' | 'foto'): PickedAsset {
  return {
    uri: a.uri,
    fileName: a.fileName ?? a.uri.split('/').pop() ?? 'mídia',
    mimeType: resolveMime(a, kind),
    fileSize: a.fileSize,
    duration: a.duration,
  };
}

/** Pill toggle — green track when on, bone when off. */
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}>
      <View style={[styles.knob, value && styles.knobOn]} />
    </Pressable>
  );
}

/** Outline action button used inside the upload card (GRAVAR / GALERIA). */
function UploadButton({ icon, label, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.uploadBtn, pressed && styles.pressed]}>
      <Feather name={icon} size={16} color={colors.fg} />
      <Text style={styles.uploadBtnLabel} color={colors.fg}>
        {label}
      </Text>
    </Pressable>
  );
}

/** "Sobe a jogada" — publish a video, photo, or external link to the vitrine. */
export function NovaMidiaScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const athlete = user?.role === 'athlete' ? (user as AthleteProfile) : null;

  // Modo edição: vem de "Minhas mídias" com os dados da mídia nos params.
  const params = useLocalSearchParams<{
    id?: string;
    mediaType?: string;
    title?: string;
    category?: string;
    subcategory?: string;
    gameInfo?: string;
    url?: string;
    isPublic?: string;
  }>();
  const editId = typeof params.id === 'string' ? params.id : undefined;
  const initialTab: MediaKind =
    params.mediaType === 'PHOTO' ? 'foto' : params.mediaType === 'EXTERNAL_LINK' ? 'link' : 'video';

  const [tab, setTab] = useState<MediaKind>(initialTab);
  const [titulo, setTitulo] = useState(params.title ?? '');
  const [categoria, setCategoria] = useState<string | undefined>(params.category || undefined);
  const [subcategoria, setSubcategoria] = useState<string | undefined>(params.subcategory || undefined);
  const [jogoData, setJogoData] = useState(params.gameInfo ?? '');
  const [link, setLink] = useState(params.mediaType === 'EXTERNAL_LINK' ? (params.url ?? '') : '');
  const [visivel, setVisivel] = useState(params.isPublic ? params.isPublic === 'true' : true);
  const [asset, setAsset] = useState<PickedAsset | null>(null);
  const [publishing, setPublishing] = useState(false);

  const switchTab = (next: MediaKind) => {
    if (next === tab) return;
    setTab(next);
    setAsset(null);
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Libere o acesso à galeria para escolher uma mídia.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: tab === 'video' ? ['videos'] : ['images'],
      quality: 0.8,
      videoMaxDuration: 120,
    });
    if (!result.canceled) setAsset(toAsset(result.assets[0], tab === 'video' ? 'video' : 'foto'));
  };

  const captureFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Libere o acesso à câmera para gravar.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: tab === 'video' ? ['videos'] : ['images'],
      quality: 0.8,
      videoMaxDuration: 120,
    });
    if (!result.canceled) setAsset(toAsset(result.assets[0], tab === 'video' ? 'video' : 'foto'));
  };

  // Editando arquivo (vídeo/foto): só metadados — o arquivo em si não é trocado.
  const needsFile = !editId && tab !== 'link';
  const canPublish =
    !publishing &&
    titulo.trim().length > 0 &&
    (tab === 'link' ? link.trim().length > 0 : !needsFile || asset != null);

  const publish = async () => {
    if (!athlete || !canPublish) return;
    const meta = {
      title: titulo.trim(),
      year: new Date().getFullYear(),
      category: categoria,
      subcategory: subcategoria,
      gameInfo: jogoData.trim() || undefined,
      isPublic: visivel,
    };
    setPublishing(true);
    try {
      if (editId) {
        // Edição: atualiza metadados (e a URL, no caso de link externo).
        await mediaApi.update(editId, tab === 'link' ? { ...meta, url: link.trim() } : meta);
        router.back();
        return;
      }
      const created =
        tab === 'link'
          ? await mediaApi.addLink(link.trim(), meta)
          : await mediaApi.upload(
              { uri: asset!.uri, fileName: asset!.fileName, mimeType: asset!.mimeType },
              meta,
            );
      // Reflete na vitrine local na hora (a API é a fonte de verdade).
      await updateUser({ videos: [...athlete.videos, created.url] });
      router.back();
    } catch (err) {
      setPublishing(false);
      const message = err instanceof ApiError ? err.message : 'Tente novamente em instantes.';
      Alert.alert(editId ? 'Não foi possível salvar' : 'Não foi possível publicar', message);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.topBar}>
        <Pressable hitSlop={8} onPress={() => router.back()} accessibilityRole="button">
          <Text variant="eyebrow" color={colors.fg}>
            ‹ CANCELAR
          </Text>
        </Pressable>
        <Pressable hitSlop={8} onPress={publish} disabled={!canPublish} accessibilityRole="button">
          <Text variant="eyebrow" color={canPublish ? colors.accent : colors.fgMuted}>
            {editId ? 'SALVAR ›' : 'PUBLICAR ›'}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Title block */}
        <View style={styles.intro}>
          <Text variant="eyebrow" color={colors.fgMuted}>
            {editId ? 'E D I T A R · M Í D I A' : 'N O V A · M Í D I A'}
          </Text>
          <Text variant="displayMd" color={colors.fg}>
            {editId ? 'Editar jogada' : 'Sobe a jogada'}
            <Text variant="displayMd" color={colors.accent}>.</Text>
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => switchTab(t.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={[styles.tab, active && styles.tabActive]}>
                <Text style={styles.tabLabel} color={active ? palette.giz : colors.fgMuted}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Upload area */}
        {tab === 'link' ? (
          <View style={styles.linkWrap}>
            <TextField
              label="LINK DO VÍDEO"
              autoCapitalize="none"
              keyboardType="url"
              placeholder="youtube.com/watch?v=…"
              value={link}
              onChangeText={setLink}
            />
            <Text variant="xs" color={colors.fgMuted}>
              YouTube, Vimeo ou link direto. O clube assiste sem sair do app.
            </Text>
          </View>
        ) : editId ? (
          <View style={styles.editNote}>
            <Feather name={tab === 'foto' ? 'image' : 'video'} size={18} color={colors.fgMuted} />
            <Text variant="sm" color={colors.fgMuted} style={styles.editNoteText}>
              O arquivo enviado não pode ser trocado. Edite os dados abaixo ou remova a mídia em
              "Minhas mídias".
            </Text>
          </View>
        ) : (
          <View style={styles.uploadCard}>
            {asset ? (
              <>
                {/* Real preview of the picked file */}
                {tab === 'foto' ? (
                  <Image source={{ uri: asset.uri }} style={styles.previewImage} contentFit="cover" />
                ) : (
                  <View style={styles.preview}>
                    <View style={styles.playTriangle} />
                    {formatDuration(asset.duration) && (
                      <View style={styles.duration}>
                        <Text style={styles.durationText} color={palette.giz}>
                          {formatDuration(asset.duration)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.fileRow}>
                  <Text style={styles.fileName} color={colors.fg} numberOfLines={1}>
                    {asset.fileName}
                  </Text>
                  {formatSize(asset.fileSize) && (
                    <Text style={styles.fileSize} color={colors.fgMuted}>
                      {formatSize(asset.fileSize)}
                    </Text>
                  )}
                </View>
                <Pressable hitSlop={6} onPress={() => setAsset(null)} accessibilityRole="button">
                  <Text style={styles.progressLabel} color={colors.fgMuted}>
                    REMOVER ›
                  </Text>
                </Pressable>
              </>
            ) : (
              /* Empty state — nothing picked yet */
              <View style={styles.empty}>
                <Feather name={tab === 'video' ? 'video' : 'image'} size={32} color={colors.fgMuted} />
                <Text variant="bodyMedium" color={colors.fg}>
                  {tab === 'video' ? 'Nenhum vídeo selecionado' : 'Nenhuma foto selecionada'}
                </Text>
                <Text variant="xs" color={colors.fgMuted}>
                  {tab === 'video' ? 'Grave agora ou escolha da galeria.' : 'Tire uma foto ou escolha da galeria.'}
                </Text>
              </View>
            )}

            {/* Source buttons */}
            <View style={styles.uploadActions}>
              {tab === 'video' ? (
                <UploadButton icon="video" label="GRAVAR" onPress={captureFromCamera} />
              ) : (
                <UploadButton icon="camera" label="CÂMERA" onPress={captureFromCamera} />
              )}
              <UploadButton icon="upload" label="GALERIA" onPress={pickFromLibrary} />
            </View>
          </View>
        )}

        {/* Meta fields */}
        <TextField
          label="TÍTULO"
          required
          placeholder="Gols 2024"
          value={titulo}
          onChangeText={setTitulo}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <SelectField label="CATEGORIA" options={CATEGORIAS} value={categoria} onChange={setCategoria} />
          </View>
          <View style={styles.col}>
            <SelectField label="SUB-CATEGORIA" options={SUBCATEGORIAS} value={subcategoria} onChange={setSubcategoria} />
          </View>
        </View>

        <TextField
          label="JOGO / DATA"
          placeholder="Vitória 2 × 1 ABC · 14/10/2024"
          value={jogoData}
          onChangeText={setJogoData}
        />

        {/* Visibility */}
        <View style={styles.visivelCard}>
          <View style={styles.visivelText}>
            <Text variant="bodyMedium" color={colors.fg}>
              Visível na vitrine
            </Text>
            <Text variant="xs" color={colors.fgMuted}>
              Todo clube/agente verificado vê.
            </Text>
          </View>
          <Toggle value={visivel} onChange={setVisivel} />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          label={editId ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR NA VITRINE'}
          chevron
          fullWidth
          loading={publishing}
          disabled={!canPublish}
          onPress={publish}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    paddingVertical: spacing.md,
  },
  editNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgSunken,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  editNoteText: {
    flex: 1,
  },
  content: {
    paddingHorizontal: '5%',
    paddingBottom: spacing['3xl'],
    gap: spacing.xl,
  },
  intro: {
    gap: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  tabActive: {
    backgroundColor: palette.tinta,
  },
  tabLabel: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 1,
  },
  uploadCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.rule,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing['2xl'],
  },
  preview: {
    height: 184,
    borderRadius: radii.sm,
    backgroundColor: palette.tinta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    height: 184,
    borderRadius: radii.sm,
    backgroundColor: palette.tinta,
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 16,
    borderBottomWidth: 16,
    borderLeftWidth: 26,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: palette.giz,
  },
  duration: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
  durationText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  fileName: {
    flex: 1,
    fontFamily: fontFamily.monoMedium,
    fontSize: 13,
  },
  fileSize: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  progressLabel: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  uploadBtn: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.sm,
    backgroundColor: palette.giz,
  },
  uploadBtnLabel: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  pressed: {
    opacity: 0.7,
  },
  linkWrap: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
  visivelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.bgElev,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  visivelText: {
    flex: 1,
    gap: 2,
  },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: radii.pill,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: palette.gramado,
    alignItems: 'flex-end',
  },
  toggleOff: {
    backgroundColor: colors.bgSunken,
    alignItems: 'flex-start',
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.giz,
  },
  knobOn: {
    backgroundColor: palette.giz,
  },
  footer: {
    paddingHorizontal: '5%',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
});
