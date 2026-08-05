import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Button, Text, TextField } from "@/components/ui";
import { colors, fontFamily, fontSize, palette, radii, spacing } from "@/theme";

/** One annual statistics record (a single season the athlete reports). */
export interface SeasonStat {
  ano: number;
  gols: number;
  assistencias: number;
  jogos: number;
  minutos: number;
  alturaCm: number;
  pesoKg: number;
  publico: boolean;
  /** Clube / escola da temporada — alimenta a Trajetória do perfil. */
  clube?: string;
}

const CURRENT_YEAR = new Date().getFullYear();
/** Five seasons ending on the current year, e.g. 2022 … 2026. */
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 4 + i);

type Draft = {
  ano: number;
  gols: string;
  assistencias: string;
  jogos: string;
  altura: string; // meters, e.g. "1.85"
  peso: string;
  minutos: string;
  publico: boolean;
  clube: string;
};

function toDraft(s: SeasonStat): Draft {
  return {
    ano: s.ano,
    gols: String(s.gols),
    assistencias: String(s.assistencias),
    jogos: String(s.jogos),
    altura: (s.alturaCm / 100).toFixed(2),
    peso: String(s.pesoKg),
    minutos: String(s.minutos),
    publico: s.publico,
    clube: s.clube ?? "",
  };
}

const int = (v: string) =>
  Math.max(0, Math.trunc(Number(v.replace(/[^\d]/g, "")) || 0));
const metersToCm = (v: string) =>
  Math.round((Number(v.replace(",", ".").replace(/[^\d.]/g, "")) || 0) * 100);

export type EstatisticaEditModalProps = {
  visible: boolean;
  initial: SeasonStat;
  onApply: (s: SeasonStat) => void;
  onClose: () => void;
};

/** Bottom-sheet editor for a single season's stats — mirrors the reference. */
export function EstatisticaEditModal({
  visible,
  initial,
  onApply,
  onClose,
}: EstatisticaEditModalProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));

  // Re-seed whenever the sheet (re)opens.
  const [seen, setSeen] = useState(false);
  if (visible && !seen) {
    setDraft(toDraft(initial));
    setSeen(true);
  } else if (!visible && seen) {
    setSeen(false);
  }

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const apply = () =>
    onApply({
      ano: draft.ano,
      gols: int(draft.gols),
      assistencias: int(draft.assistencias),
      jogos: int(draft.jogos),
      minutos: int(draft.minutos),
      alturaCm: metersToCm(draft.altura),
      pesoKg: int(draft.peso),
      publico: draft.publico,
      clube: draft.clube.trim() || undefined,
    });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={styles.backdropTap}
          onPress={onClose}
          accessibilityLabel="Fechar"
        />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="displaySm" color={colors.fg}>
              Estatística
              <Text variant="displaySm" color={colors.accent}>
                .
              </Text>
            </Text>
            <Pressable
              hitSlop={10}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Feather name="x" size={22} color={colors.fg} />
            </Pressable>
          </View>
          <Text variant="sm" color={colors.fgMuted} style={styles.lead}>
            Preencha cada atributo. Tua nota fica visível pros clubes — sê
            honesto, isso fica num registro auditável.
          </Text>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Temporada selector */}
            <Text variant="eyebrow" color={colors.fgMuted}>
              T E M P O R A D A
            </Text>
            <View style={styles.years}>
              {YEARS.map((y) => {
                const active = draft.ano === y;
                return (
                  <Pressable
                    key={y}
                    onPress={() => patch({ ano: y })}
                    accessibilityRole="button"
                    style={[styles.yearChip, active && styles.yearChipActive]}
                  >
                    <Text
                      style={styles.yearNum}
                      color={active ? palette.giz : colors.fg}
                    >
                      {y}
                    </Text>
                    {y === CURRENT_YEAR && (
                      <Text
                        style={styles.yearTag}
                        color={active ? palette.giz : colors.fgMuted}
                      >
                        ATUAL
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Clube / Escola — alimenta a Trajetória */}
            <View style={styles.clubeField}>
              <TextField
                label="Clube / Escola"
                value={draft.clube}
                onChangeText={(v) => patch({ clube: v })}
                placeholder="Ex.: Grêmio · Base"
                autoCapitalize="words"
              />
            </View>

            {/* Fields */}
            <View style={styles.fields}>
              <FieldRow
                label="Gols"
                year={draft.ano}
                value={draft.gols}
                onChange={(v) => patch({ gols: v })}
              />
              <FieldRow
                label="Assistências"
                year={draft.ano}
                value={draft.assistencias}
                onChange={(v) => patch({ assistencias: v })}
              />
              <FieldRow
                label="Jogos"
                year={draft.ano}
                value={draft.jogos}
                onChange={(v) => patch({ jogos: v })}
              />
              <FieldRow
                label="Altura"
                year={draft.ano}
                value={draft.altura}
                suffix="M"
                decimal
                onChange={(v) => patch({ altura: v })}
              />
              <FieldRow
                label="Peso"
                year={draft.ano}
                value={draft.peso}
                suffix="KG"
                onChange={(v) => patch({ peso: v })}
              />
              <FieldRow
                label="Minutos Jogados"
                year={draft.ano}
                value={draft.minutos}
                onChange={(v) => patch({ minutos: v })}
              />
            </View>

            {/* Honesty note */}
            <View style={styles.note}>
              <Text variant="sm" color={colors.fgMuted}>
                <Text variant="smMedium" color={colors.fg}>
                  Honestidade conta.{" "}
                </Text>
                Atletas que mentem nos atributos perdem o selo verificado e são
                despriorizados na busca.
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={() => patch({ publico: !draft.publico })}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: draft.publico }}
              accessibilityLabel="Tornar público"
              style={[styles.checkbox, draft.publico && styles.checkboxOn]}
            >
              {draft.publico && (
                <Feather name="check" size={20} color={palette.giz} />
              )}
            </Pressable>
            <View style={styles.apply}>
              <Button label="SALVAR" chevron fullWidth onPress={apply} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FieldRow({
  label,
  year,
  value,
  suffix,
  decimal,
  onChange,
}: {
  label: string;
  year: number;
  value: string;
  suffix?: string;
  decimal?: boolean;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldLabel}>
        <Text variant="bodyMedium" color={colors.fg}>
          {label}
        </Text>
        <Text variant="monoLabel" color={colors.fgMuted}>
          ANO {year} APENAS
        </Text>
      </View>
      <View style={[styles.fieldInput, focused && styles.fieldInputFocused]}>
        <TextInput
          style={styles.fieldInputText}
          value={value}
          onChangeText={onChange}
          keyboardType={decimal ? "decimal-pad" : "number-pad"}
          placeholder="0"
          placeholderTextColor={colors.fgMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {!!suffix && (
          <Text style={styles.fieldSuffix} color={colors.fgMuted}>
            {suffix}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: palette.tinta64,
    justifyContent: "flex-end",
  },
  backdropTap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    maxHeight: "92%",
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
  },
  lead: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  years: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  yearChip: {
    flex: 1,
    height: 64,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: palette.giz,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  yearChipActive: {
    backgroundColor: palette.gramado,
    borderColor: palette.gramado,
  },
  yearNum: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 18,
    fontVariant: ["tabular-nums"],
  },
  yearTag: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 8,
    letterSpacing: 1,
  },
  clubeField: {
    marginTop: spacing.lg,
  },
  fields: {
    marginTop: spacing.lg,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  fieldLabel: {
    flex: 1,
    gap: 2,
  },
  fieldInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    width: 132,
    height: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.sm,
    backgroundColor: palette.giz,
  },
  fieldInputFocused: {
    borderColor: colors.ruleStrong,
  },
  fieldInputText: {
    flex: 1,
    fontFamily: fontFamily.monoMedium,
    fontSize: 20,
    color: colors.fg,
    textAlign: "right",
    padding: 0,
  },
  fieldSuffix: {
    fontFamily: fontFamily.monoMedium,
    fontSize: fontSize.tag,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  note: {
    backgroundColor: colors.bgSunken,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  checkbox: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.ruleStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: palette.gramado,
    borderColor: palette.gramado,
  },
  apply: {
    flex: 1,
  },
});
