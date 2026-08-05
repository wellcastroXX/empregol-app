import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Tag, Text } from "@/components/ui";
import { POSITIONS } from "@/constants/positions";
import { useAuth } from "@/context/AuthContext";
import {
  dashboardApi,
  type AthleteDashboard,
} from "@/services/api/dashboard-api";
import { mediaApi } from "@/services/api/media-api";
import { colors, fontFamily, palette, radii, spacing } from "@/theme";
import type { AthleteProfile } from "@/types";
import { formatNumber } from "@/utils";

import { MeusDadosEditModal, type EditSection } from "./MeusDadosEditModal";

const FOOT_WORD: Record<AthleteProfile["peDominante"], string> = {
  esquerdo: "canhoto",
  direito: "destro",
  ambidestro: "ambidestro",
};

/** 2800 → "2.8K", 312 → "312". */
function compact(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return String(n);
}

/**
 * An "EDITAR · VITRINE" row — completion check chip, title, subtitle, chevron.
 * `complete` paints a white check on the brand green; otherwise a faded check.
 */
function EditRow({
  complete,
  title,
  subtitle,
  locked,
  onPress,
}: {
  complete: boolean;
  title: string;
  subtitle: string;
  locked?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.checkBox, complete && styles.checkBoxDone]}>
        <Feather
          name="check"
          size={18}
          color={complete ? colors.accentFg : colors.fgMuted}
          style={complete ? undefined : styles.checkIncomplete}
        />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTitleLine}>
          <Text variant="bodyMedium" color={colors.fg}>
            {title}
          </Text>
          {locked && <Feather name="lock" size={13} color={colors.fgMuted} />}
        </View>
        <Text variant="sm" color={colors.fgMuted}>
          {subtitle}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.fgMuted} />
    </Pressable>
  );
}

/**
 * A "CONTA" row — completion check chip, title, subtitle, chevron.
 * `complete` paints a white check on the brand green; otherwise a faded check.
 */
function AccountRow({
  title,
  subtitle,
  complete,
  onPress,
}: {
  title: string;
  subtitle: string;
  complete?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.checkBox, complete && styles.checkBoxDone]}>
        <Feather
          name="check"
          size={18}
          color={complete ? colors.accentFg : colors.fgMuted}
          style={complete ? undefined : styles.checkIncomplete}
        />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTitleLine}>
          <Text variant="bodyMedium" color={colors.fg}>
            {title}
          </Text>
        </View>
        <Text variant="sm" color={colors.fgMuted}>
          {subtitle}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.fgMuted} />
    </Pressable>
  );
}

function StatCell({
  value,
  label,
  up,
}: {
  value: string;
  label: string;
  up?: boolean;
}) {
  return (
    <View style={styles.statCell}>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue} color={colors.fg}>
          {value}
        </Text>
        {up && (
          <Text style={styles.statUp} color={colors.accent}>
            ↑
          </Text>
        )}
      </View>
      <Text variant="monoLabel" color={colors.fgMuted}>
        {label}
      </Text>
    </View>
  );
}

/** "Meus dados" — editorial edit hub for the athlete's vitrine + account. */
export function MeusDadosScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [dashboard, setDashboard] = useState<AthleteDashboard | null>(null);
  const [editing, setEditing] = useState<EditSection | null>(null);
  const [mediaCount, setMediaCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    dashboardApi
      .getAthleteDashboard()
      .then((d) => active && setDashboard(d))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Contagem real de mídias do servidor (a cada foco, reflete add/remove).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      mediaApi
        .listMine()
        .then((list) => active && setMediaCount(list.length))
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  if (!user || user.role !== "athlete")
    return <SafeAreaView style={styles.safe} />;
  const athlete = user as AthleteProfile;

  const year = new Date().getFullYear();
  const daysActive = Math.max(
    0,
    Math.floor((Date.now() - new Date(athlete.criadoEm).getTime()) / 86400000),
  );
  const vitrineDays = dashboard?.stats.daysOnPlatform ?? daysActive;

  const jersey =
    athlete.numero != null ? String(athlete.numero).padStart(2, "0") : "—";
  const isLivre = athlete.disponibilidade === "livre";
  const levelTag =
    athlete.nivel === "profissional" ? "PRO" : athlete.nivel.toUpperCase();

  const pos = POSITIONS.find((p) => p.value === athlete.posicao);
  const posShort = pos?.short ?? athlete.posicao.toUpperCase();
  const heightStr = `${(athlete.alturaCm / 100).toFixed(2)}m`;
  const fisico = `${posShort} · ${FOOT_WORD[athlete.peDominante]} · ${heightStr} · ${athlete.pesoKg}kg`;

  const s = athlete.stats;
  const NAO_PREENCHIDO = "Não preenchido";

  // Completude de cada item — campos obrigatórios já vêm preenchidos; vídeos,
  // estatísticas e base salarial dependem do que o atleta cadastrou.
  const hasVideos = (mediaCount ?? 0) > 0;
  const hasStats =
    !!s &&
    ((s.jogosNaTemporada ?? 0) > 0 ||
      (s.gols ?? 0) > 0 ||
      (s.assistencias ?? 0) > 0);
  const hasSalary = athlete.baseSalarial > 0;
  const hasDados = !!athlete.cpf;

  // Subtítulos — prévia dos dados reais cadastrados, ou "Não preenchido".
  const statusSub = `${isLivre ? "Livre" : "Empregado"} · ${
    athlete.agenciamento === "nao_agenciado" ? "não agenciado" : "agenciado"
  } · ${levelTag}`;
  const posicaoSub = `${athlete.numero != null ? `#${athlete.numero} · ` : ""}${fisico}`;
  const videosSub = hasVideos
    ? `${mediaCount} ${mediaCount === 1 ? "mídia" : "mídias"} · ${year}`
    : NAO_PREENCHIDO;
  const statsSub = hasStats
    ? `${s?.gols ?? 0} gols · ${s?.assistencias ?? 0} assist · ${s?.jogosNaTemporada ?? 0} jogos`
    : NAO_PREENCHIDO;
  const salarioSub = hasSalary
    ? `R$ ${formatNumber(athlete.baseSalarial)} / mês`
    : NAO_PREENCHIDO;
  const dadosSub = hasDados
    ? `${athlete.cpf} · ${athlete.naturalidade}`
    : NAO_PREENCHIDO;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.topBar}>
        <Text variant="eyebrow" color={colors.fg}>
          M E U S D A D O S
        </Text>
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={styles.save} color={colors.fg}>
            VOLTAR
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile card */}
        <View style={styles.card}>
          <Text variant="monoLabel" color={palette.cinzaOnDark}>
            T E U · P E R F I L
          </Text>
          <View style={styles.cardRow}>
            <Text style={styles.cardName} color={palette.giz} numberOfLines={1}>
              {athlete.nome}
            </Text>
            <Text style={styles.cardJersey} color={palette.giz}>
              {jersey}
            </Text>
          </View>
          <View style={styles.cardTags}>
            <Tag
              label={isLivre ? "LIVRE" : "EMPREGADO"}
              variant={isLivre ? "live" : "empregado"}
              dot={isLivre}
            />
            <Text variant="monoLabel" color={palette.cinzaOnDark}>
              {levelTag}
            </Text>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.stats}>
          <StatCell
            value={compact(dashboard?.stats.viewsToday ?? 0)}
            label="HOJE"
            up={!!dashboard?.stats.viewsToday}
          />
          <StatCell
            value={compact(dashboard?.stats.viewsThisWeek ?? 0)}
            label="SEMANA"
          />
          <StatCell
            value={String(dashboard?.stats.pendingProposals ?? 0)}
            label="PROPOSTAS"
          />
          <StatCell value={`${vitrineDays}d`} label="VITRINE" />
        </View>

        {/* Editar · vitrine */}
        <Text
          variant="eyebrow"
          color={colors.fgMuted}
          style={styles.sectionLabel}
        >
          E D I T A R · V I T R I N E
        </Text>
        <View style={styles.list}>
          <EditRow
            complete
            title="Status"
            subtitle={statusSub}
            onPress={() => setEditing("status")}
          />
          <EditRow
            complete
            title="Posição & Numeração"
            subtitle={posicaoSub}
            onPress={() => setEditing("posicao")}
          />
          <EditRow
            complete={hasVideos}
            title="Vídeos & jogadas"
            subtitle={videosSub}
            onPress={() => router.push("/minhas-midias")}
          />
          <EditRow
            complete={hasStats}
            title="Estatísticas"
            subtitle={statsSub}
            onPress={() => router.push("/estatisticas")}
          />
          <EditRow
            complete={hasSalary}
            title="Base salarial"
            subtitle={salarioSub}
            onPress={() => setEditing("salario")}
          />
          <EditRow
            complete={hasDados}
            title="Dados pessoais"
            subtitle={dadosSub}
            locked
            onPress={() => setEditing("dados")}
          />
        </View>

        {/* Conta */}
        <Text
          variant="eyebrow"
          color={colors.fgMuted}
          style={styles.sectionLabel}
        >
          C O N T A
        </Text>
        <View style={styles.list}>
          <AccountRow
            title={athlete.emailVerificado ? "E-mail verificado" : "E-mail"}
            subtitle={athlete.email}
            complete={athlete.emailVerificado}
          />
          <AccountRow
            title="Telefone"
            subtitle={athlete.telefone || NAO_PREENCHIDO}
            complete={!!athlete.telefone}
          />
          <AccountRow
            title="Trocar senha"
            subtitle={`Última troca há ${daysActive}d`}
            complete
          />
        </View>
      </ScrollView>

      {editing && (
        <MeusDadosEditModal
          visible
          section={editing}
          athlete={athlete}
          onSave={(p) => {
            updateUser(p);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "5%",
    paddingVertical: spacing.md,
  },
  save: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 13,
    letterSpacing: 0.5,
    textDecorationLine: "underline",
  },
  content: {
    paddingHorizontal: "5%",
    paddingBottom: spacing["4xl"],
    gap: spacing.xl,
  },
  card: {
    backgroundColor: palette.tinta,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  cardName: {
    flex: 1,
    fontFamily: fontFamily.display,
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  cardJersey: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: -3,
    fontVariant: ["tabular-nums"],
    includeFontPadding: false,
  },
  cardTags: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  stats: {
    flexDirection: "row",
    borderTopWidth: 1.5,
    borderTopColor: colors.ruleStrong,
    paddingTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  statCell: {
    flex: 1,
    gap: spacing.xs,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 2,
  },
  statValue: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 26,
    lineHeight: 28,
    fontVariant: ["tabular-nums"],
  },
  statUp: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 14,
  },
  sectionLabel: {
    marginBottom: -spacing.sm,
    marginHorizontal: spacing.md,
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    marginHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  rowPressed: {
    opacity: 0.6,
  },
  checkBox: {
    width: 38,
    height: 38,
    borderRadius: radii.xs,
    backgroundColor: colors.bgSunken,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBoxDone: {
    backgroundColor: colors.accent,
  },
  checkIncomplete: {
    opacity: 0.4,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
