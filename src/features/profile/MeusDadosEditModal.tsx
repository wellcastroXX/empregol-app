import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Button, ChipGroup, Text, TextField } from "@/components/ui";
import {
  AGENCY,
  AVAILABILITY,
  DOMINANT_FEET,
  PLAYER_LEVELS,
  POSITIONS,
} from "@/constants/positions";
import { colors, palette, radii, spacing } from "@/theme";
import type {
  AgencyStatus,
  AthleteProfile,
  AvailabilityStatus,
  DominantFoot,
  PlayerLevel,
  Position,
} from "@/types";

/** Which "Meus dados" item the sheet is editing. */
export type EditSection = "status" | "posicao" | "salario" | "dados";

const COPY: Record<EditSection, { title: string; lead: string }> = {
  status: {
    title: "Status",
    lead: "Atualize sua disponibilidade e situação no mercado.",
  },
  posicao: {
    title: "Posição & Numeração",
    lead: "Defina posição, pé dominante, número e medidas.",
  },
  salario: {
    title: "Base salarial",
    lead: "Valor mensal pretendido em caso de vínculo.",
  },
  dados: {
    title: "Dados pessoais",
    lead: "Informações de cadastro e contato.",
  },
};

type Draft = {
  disponibilidade: AvailabilityStatus;
  agenciamento: AgencyStatus;
  nivel: PlayerLevel;
  posicao: Position;
  peDominante: DominantFoot;
  numero: string;
  altura: string; // meters, e.g. "1.85"
  peso: string;
  salario: string;
  cpf: string;
  nascimento: string;
  naturalidade: string;
  telefone: string;
};

function toDraft(a: AthleteProfile): Draft {
  return {
    disponibilidade: a.disponibilidade,
    agenciamento: a.agenciamento,
    nivel: a.nivel,
    posicao: a.posicao,
    peDominante: a.peDominante,
    numero: a.numero != null ? String(a.numero) : "",
    altura: a.alturaCm ? (a.alturaCm / 100).toFixed(2) : "",
    peso: a.pesoKg ? String(a.pesoKg) : "",
    salario: a.baseSalarial ? String(a.baseSalarial) : "",
    cpf: a.cpf ?? "",
    nascimento: a.dataNascimento ?? "",
    naturalidade: a.naturalidade ?? "",
    telefone: a.telefone ?? "",
  };
}

const digits = (v: string) => v.replace(/[^\d]/g, "");
const int = (v: string) => Math.max(0, Math.trunc(Number(digits(v)) || 0));
const metersToCm = (v: string) =>
  Math.round((Number(v.replace(",", ".").replace(/[^\d.]/g, "")) || 0) * 100);

const POSITION_CHIPS = POSITIONS.map((p) => ({
  value: p.value,
  label: p.short ?? p.label,
}));

export type MeusDadosEditModalProps = {
  visible: boolean;
  section: EditSection;
  athlete: AthleteProfile;
  onSave: (patch: Partial<AthleteProfile>) => void;
  onClose: () => void;
};

/** Bottom-sheet editor for a single "Meus dados" vitrine item. */
export function MeusDadosEditModal({
  visible,
  section,
  athlete,
  onSave,
  onClose,
}: MeusDadosEditModalProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(athlete));

  // Re-seed whenever the sheet (re)opens, so it mirrors the latest profile.
  const [seen, setSeen] = useState(false);
  if (visible && !seen) {
    setDraft(toDraft(athlete));
    setSeen(true);
  } else if (!visible && seen) {
    setSeen(false);
  }

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const save = () => {
    switch (section) {
      case "status":
        onSave({
          disponibilidade: draft.disponibilidade,
          agenciamento: draft.agenciamento,
          nivel: draft.nivel,
        });
        break;
      case "posicao":
        onSave({
          posicao: draft.posicao,
          peDominante: draft.peDominante,
          numero: draft.numero ? int(draft.numero) : undefined,
          alturaCm: metersToCm(draft.altura),
          pesoKg: int(draft.peso),
        });
        break;
      case "salario":
        onSave({ baseSalarial: int(draft.salario) });
        break;
      case "dados":
        onSave({
          cpf: draft.cpf.trim(),
          dataNascimento: draft.nascimento.trim(),
          naturalidade: draft.naturalidade.trim(),
          telefone: draft.telefone.trim(),
        });
        break;
    }
  };

  const copy = COPY[section];

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
              {copy.title}
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
            {copy.lead}
          </Text>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {section === "status" && (
              <>
                <Group label="D I S P O N I B I L I D A D E">
                  <ChipGroup
                    options={AVAILABILITY}
                    value={draft.disponibilidade}
                    onChange={(v) => patch({ disponibilidade: v })}
                    grow
                  />
                </Group>
                <Group label="A G E N C I A M E N T O">
                  <ChipGroup
                    options={AGENCY}
                    value={draft.agenciamento}
                    onChange={(v) => patch({ agenciamento: v })}
                    grow
                  />
                </Group>
                <Group label="N Í V E L">
                  <ChipGroup
                    options={PLAYER_LEVELS}
                    value={draft.nivel}
                    onChange={(v) => patch({ nivel: v })}
                    grow
                  />
                </Group>
              </>
            )}

            {section === "posicao" && (
              <>
                <Group label="P O S I Ç Ã O">
                  <ChipGroup
                    options={POSITION_CHIPS}
                    value={draft.posicao}
                    onChange={(v) => patch({ posicao: v })}
                  />
                </Group>
                <Group label="P É · D O M I N A N T E">
                  <ChipGroup
                    options={DOMINANT_FEET}
                    value={draft.peDominante}
                    onChange={(v) => patch({ peDominante: v })}
                    grow
                  />
                </Group>
                <TextField
                  label="Número da camisa"
                  value={draft.numero}
                  onChangeText={(v) => patch({ numero: digits(v).slice(0, 2) })}
                  keyboardType="number-pad"
                  placeholder="10"
                  mono
                />
                <TextField
                  label="Altura"
                  suffix="M"
                  value={draft.altura}
                  onChangeText={(v) => patch({ altura: v })}
                  keyboardType="decimal-pad"
                  placeholder="1.85"
                  mono
                />
                <TextField
                  label="Peso"
                  suffix="KG"
                  value={draft.peso}
                  onChangeText={(v) => patch({ peso: digits(v) })}
                  keyboardType="number-pad"
                  placeholder="78"
                  mono
                />
              </>
            )}

            {section === "salario" && (
              <TextField
                label="Base salarial pretendida"
                hint="POR MÊS"
                suffix="BRL"
                value={draft.salario}
                onChangeText={(v) => patch({ salario: digits(v) })}
                keyboardType="number-pad"
                placeholder="0"
                mono
              />
            )}

            {section === "dados" && (
              <>
                <TextField
                  label="CPF"
                  value={draft.cpf}
                  onChangeText={(v) => patch({ cpf: v })}
                  keyboardType="number-pad"
                  placeholder="000.000.000-00"
                  mono
                />
                <TextField
                  label="Data de nascimento"
                  value={draft.nascimento}
                  onChangeText={(v) => patch({ nascimento: v })}
                  placeholder="AAAA-MM-DD"
                  mono
                />
                <TextField
                  label="Naturalidade"
                  value={draft.naturalidade}
                  onChangeText={(v) => patch({ naturalidade: v })}
                  placeholder="Cidade / UF"
                />
                <TextField
                  label="Telefone"
                  value={draft.telefone}
                  onChangeText={(v) => patch({ telefone: v })}
                  keyboardType="phone-pad"
                  placeholder="(00) 00000-0000"
                  mono
                />
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button label="SALVAR" chevron fullWidth onPress={save} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <Text variant="eyebrow" color={colors.fgMuted}>
        {label}
      </Text>
      {children}
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
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
});
