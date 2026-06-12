import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Chip, Text, TextField } from '@/components/ui';
import { GENDERS, PLAYER_LEVELS, POSITIONS } from '@/constants/positions';
import { colors, palette, radii, spacing } from '@/theme';
import type { AvailabilityStatus, Genero, PlayerLevel, Position } from '@/types';

/** All client-side filter criteria for the vitrine. Empty arrays / undefined = no filter. */
export interface AthleteFilters {
  generos: Genero[];
  posicoes: Position[];
  niveis: PlayerLevel[];
  disponibilidade?: AvailabilityStatus;
  idadeMin?: number;
  idadeMax?: number;
  alturaMinCm?: number;
  alturaMaxCm?: number;
  pesoMin?: number;
  pesoMax?: number;
  golsMin?: number;
  estado?: string;
  cidade?: string;
}

export const EMPTY_FILTERS: AthleteFilters = { generos: [], posicoes: [], niveis: [] };

const num = (v: string): number | undefined => {
  const n = Number(v.replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && v.trim() !== '' ? n : undefined;
};
const str = (n?: number) => (n != null ? String(n) : '');

/** Count of active criteria — drives the "APLICAR (N)" badge and chips bar. */
export function activeFilterCount(f: AthleteFilters): number {
  let n = f.generos.length + f.posicoes.length + f.niveis.length;
  if (f.disponibilidade) n++;
  if (f.idadeMin != null || f.idadeMax != null) n++;
  if (f.alturaMinCm != null || f.alturaMaxCm != null) n++;
  if (f.pesoMin != null || f.pesoMax != null) n++;
  if (f.golsMin != null) n++;
  if (f.estado?.trim()) n++;
  if (f.cidade?.trim()) n++;
  return n;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function AthleteFilterModal({
  visible,
  initial,
  resultCount,
  onApply,
  onClose,
}: {
  visible: boolean;
  initial: AthleteFilters;
  /** How many athletes the draft currently matches (live preview). */
  resultCount?: number;
  onApply: (f: AthleteFilters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<AthleteFilters>(initial);

  // Re-seed the draft whenever the sheet is (re)opened.
  const [seenVisible, setSeenVisible] = useState(false);
  if (visible && !seenVisible) {
    setDraft(initial);
    setSeenVisible(true);
  } else if (!visible && seenVisible) {
    setSeenVisible(false);
  }

  const patch = (p: Partial<AthleteFilters>) => setDraft((d) => ({ ...d, ...p }));
  const count = activeFilterCount(draft);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} accessibilityLabel="Fechar" />
        <View style={styles.sheet}>
          {/* Handle + header */}
          <View style={styles.grabber} />
          <View style={styles.header}>
            <Text variant="eyebrow" color={colors.fgMuted}>
              F I L T R A R · A T L E T A S
            </Text>
            <Pressable hitSlop={10} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar">
              <Feather name="x" size={20} color={colors.fg} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <Section label="GÊNERO">
              <View style={styles.chips}>
                {GENDERS.map((g) => (
                  <Chip
                    key={g.value}
                    label={g.label}
                    selected={draft.generos.includes(g.value)}
                    onPress={() => patch({ generos: toggle(draft.generos, g.value) })}
                  />
                ))}
              </View>
            </Section>

            <Section label="DISPONIBILIDADE">
              <View style={styles.chips}>
                <Chip
                  label="LIVRE"
                  selected={draft.disponibilidade === 'livre'}
                  onPress={() =>
                    patch({ disponibilidade: draft.disponibilidade === 'livre' ? undefined : 'livre' })
                  }
                />
                <Chip
                  label="EMPREGADO"
                  selected={draft.disponibilidade === 'empregado'}
                  onPress={() =>
                    patch({ disponibilidade: draft.disponibilidade === 'empregado' ? undefined : 'empregado' })
                  }
                />
              </View>
            </Section>

            <Section label="POSIÇÃO">
              <View style={styles.chips}>
                {POSITIONS.map((p) => (
                  <Chip
                    key={p.value}
                    label={p.short ?? p.label}
                    selected={draft.posicoes.includes(p.value)}
                    onPress={() => patch({ posicoes: toggle(draft.posicoes, p.value) })}
                  />
                ))}
              </View>
            </Section>

            <Section label="NÍVEL">
              <View style={styles.chips}>
                {PLAYER_LEVELS.map((l) => (
                  <Chip
                    key={l.value}
                    label={l.label.toUpperCase()}
                    selected={draft.niveis.includes(l.value)}
                    onPress={() => patch({ niveis: toggle(draft.niveis, l.value) })}
                  />
                ))}
              </View>
            </Section>

            <RangeRow
              label="IDADE"
              suffix="ANOS"
              min={str(draft.idadeMin)}
              max={str(draft.idadeMax)}
              onMin={(v) => patch({ idadeMin: num(v) })}
              onMax={(v) => patch({ idadeMax: num(v) })}
            />
            <RangeRow
              label="ALTURA"
              suffix="M"
              decimal
              min={draft.alturaMinCm != null ? String(draft.alturaMinCm / 100) : ''}
              max={draft.alturaMaxCm != null ? String(draft.alturaMaxCm / 100) : ''}
              onMin={(v) => patch({ alturaMinCm: num(v) != null ? Math.round(num(v)! * 100) : undefined })}
              onMax={(v) => patch({ alturaMaxCm: num(v) != null ? Math.round(num(v)! * 100) : undefined })}
            />
            <RangeRow
              label="PESO"
              suffix="KG"
              min={str(draft.pesoMin)}
              max={str(draft.pesoMax)}
              onMin={(v) => patch({ pesoMin: num(v) })}
              onMax={(v) => patch({ pesoMax: num(v) })}
            />

            <Section label="GOLS (MÍNIMO)">
              <TextField
                mono
                keyboardType="number-pad"
                placeholder="0"
                value={str(draft.golsMin)}
                onChangeText={(v) => patch({ golsMin: num(v) })}
              />
            </Section>

            <View style={styles.row}>
              <View style={styles.col}>
                <Section label="ESTADO">
                  <TextField
                    placeholder="SP"
                    autoCapitalize="characters"
                    value={draft.estado ?? ''}
                    onChangeText={(v) => patch({ estado: v })}
                  />
                </Section>
              </View>
              <View style={styles.col}>
                <Section label="CIDADE">
                  <TextField
                    placeholder="São Paulo"
                    value={draft.cidade ?? ''}
                    onChangeText={(v) => patch({ cidade: v })}
                  />
                </Section>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              style={styles.clear}
              onPress={() => setDraft(EMPTY_FILTERS)}
              accessibilityRole="button">
              <Text variant="monoLabel" color={colors.fgMuted}>
                LIMPAR
              </Text>
            </Pressable>
            <View style={styles.apply}>
              <Button
                label={
                  resultCount != null
                    ? `VER ${resultCount} ${resultCount === 1 ? 'ATLETA' : 'ATLETAS'}`
                    : count > 0
                      ? `APLICAR · ${count}`
                      : 'APLICAR'
                }
                chevron
                fullWidth
                onPress={() => onApply(draft)}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="eyebrow" color={colors.fg}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function RangeRow({
  label,
  suffix,
  decimal,
  min,
  max,
  onMin,
  onMax,
}: {
  label: string;
  suffix: string;
  decimal?: boolean;
  min: string;
  max: string;
  onMin: (v: string) => void;
  onMax: (v: string) => void;
}) {
  return (
    <Section label={label}>
      <View style={styles.row}>
        <View style={styles.col}>
          <TextField
            mono
            suffix={suffix}
            keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
            placeholder="mín"
            value={min}
            onChangeText={onMin}
          />
        </View>
        <View style={styles.col}>
          <TextField
            mono
            suffix={suffix}
            keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
            placeholder="máx"
            value={max}
            onChangeText={onMax}
          />
        </View>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: palette.tinta64, justifyContent: 'flex-end' },
  backdropTap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: '88%',
    paddingTop: spacing.sm,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.rule,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  body: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  col: { flex: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  clear: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  apply: { flex: 1 },
});
