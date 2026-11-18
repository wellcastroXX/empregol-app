import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar, Button, EmptyState, SectionHeader, Tag, Text } from "@/components/ui";
import {
  contractorsApi,
  type PublicContractor,
} from "@/services/api/contractors-api";
import { conversationsApi } from "@/services/api/conversations-api";
import { colors, fontFamily, palette, radii, spacing } from "@/theme";
import { formatDate } from "@/utils";

const TYPE_LABEL: Record<PublicContractor["type"], string> = {
  CLUB: "CLUBE",
  AGENT: "AGÊNCIA",
};

/**
 * Perfil de um clube/agência visto pelo atleta.
 *
 * Existe para o atleta checar a veracidade de quem o procurou. Por isso não
 * tem botão de iniciar conversa: quem abre contato é o contratante. Quando já
 * existe conversa, o botão leva até ela.
 */
export function ContractorPublicScreen({ contractorId }: { contractorId: string }) {
  const router = useRouter();
  const [contractor, setContractor] = useState<PublicContractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  /** Id da conversa existente com este contratante, se houver. */
  const [conversaId, setConversaId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    contractorsApi
      .getById(contractorId)
      .then((data) => active && setContractor(data))
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));

    conversationsApi
      .listMine()
      .then((list) => {
        if (!active) return;
        const existente = list.find((c) => c.contractor?.id === contractorId);
        setConversaId(existente?.id ?? null);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [contractorId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <StatusBar style="light" />
        <ActivityIndicator color={palette.gramado} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (failed || !contractor) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <StatusBar style="light" />
        <View style={styles.errorBox}>
          <EmptyState
            icon="wifi-off"
            title="Perfil indisponível"
            message="Não foi possível carregar este clube ou agência."
            dark
          />
        </View>
      </SafeAreaView>
    );
  }

  const nome = contractor.name;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      <View style={styles.topBar}>
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Feather name="chevron-left" size={24} color={palette.giz} />
        </Pressable>
        <Text variant="eyebrow" color={palette.cinzaOnDark}>
          {TYPE_LABEL[contractor.type]}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Identidade */}
        <View style={styles.identity}>
          <Avatar
            name={nome}
            uri={contractor.avatarUrl ?? undefined}
            tone="bone"
            size={76}
          />
          <View style={styles.identityBody}>
            <Text variant="h3" color={palette.giz} numberOfLines={2}>
              {nome}
            </Text>
            <View style={styles.badges}>
              <Tag
                label={contractor.verified ? "VERIFICADO" : "NÃO VERIFICADO"}
                variant={contractor.verified ? "live" : "warn"}
                dot
              />
              {contractor.activeThisWeek && (
                <Tag label="ATIVO ESTA SEMANA" variant="inkElev" />
              )}
            </View>
          </View>
        </View>

        {/* Dados institucionais */}
        <View style={styles.facts}>
          <View style={styles.factRow}>
            <Text variant="monoLabel" color={palette.cinzaOnDark}>
              TIPO
            </Text>
            <Text variant="smMedium" color={palette.giz}>
              {TYPE_LABEL[contractor.type]}
            </Text>
          </View>
          <View style={styles.factRow}>
            <Text variant="monoLabel" color={palette.cinzaOnDark}>
              NA EMPREGOL DESDE
            </Text>
            <Text variant="smMedium" color={palette.giz}>
              {formatDate(contractor.memberSince)}
            </Text>
          </View>
        </View>

        {/* Sobre */}
        {!!contractor.about?.trim() && (
          <View style={styles.section}>
            <SectionHeader eyebrow="S O B R E" dark />
            <Text variant="body" color={palette.cinzaOnDark}>
              {contractor.about.trim()}
            </Text>
          </View>
        )}

        {/* Contato: o atleta não inicia conversa — só continua uma existente. */}
        {conversaId ? (
          <Button
            label="ABRIR CONVERSA"
            chevron
            fullWidth
            onPress={() => router.push(`/conversas/${conversaId}`)}
          />
        ) : (
          <View style={styles.notice}>
            <Text variant="smMedium" color={palette.giz}>
              Clubes e agências entram em contato com você por aqui.
            </Text>
            <Text variant="sm" color={palette.cinzaOnDark}>
              Mantenha seu perfil completo para aparecer nas buscas.
            </Text>
            <Pressable
              style={styles.noticeLink}
              onPress={() => router.push("/meus-dados")}
              accessibilityRole="button"
            >
              <Text variant="monoLabel" color={palette.gramado}>
                COMPLETAR PERFIL
              </Text>
              <Feather name="chevron-right" size={16} color={palette.gramado} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.tinta },
  loader: { marginTop: spacing["4xl"] },
  errorBox: { paddingHorizontal: "5%", paddingTop: spacing["3xl"] },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "5%",
    paddingBottom: spacing.sm,
  },
  topSpacer: { width: 24 },
  scroll: {
    paddingHorizontal: "5%",
    paddingBottom: spacing["4xl"],
    gap: spacing.xl,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  identityBody: { flex: 1, gap: spacing.sm },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  facts: {
    borderTopWidth: 1,
    borderTopColor: palette.ruleOnDark,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  section: { gap: spacing.md },
  notice: {
    backgroundColor: palette.tintaElev,
    borderWidth: 1,
    borderColor: palette.ruleOnDark,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  noticeLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
