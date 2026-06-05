import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { RegisterHeader } from '@/features/auth/components/RegisterHeader';
import { SocialAuthButtons } from '@/features/auth/components/SocialAuthButtons';
import { colors, fontFamily, palette, radii, spacing } from '@/theme';
import type { ContractorKind } from '@/types';

type Role = 'atleta' | 'contratante';

/** Step 1 — "Você é quem?" Atleta or Contratante (→ Clube / Agente). */
export function AccountTypeScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [sub, setSub] = useState<ContractorKind>('club');

  const total = role === 'contratante' ? 2 : 4;

  const onContinue = () => {
    if (role === 'atleta') {
      router.push('/register/athlete');
    } else if (role === 'contratante') {
      router.push({ pathname: '/register/contractor', params: { tipo: sub } });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <RegisterHeader
          step={1}
          total={total}
          eyebrow="V O C Ê · É · Q U E M"
          title={'Em 4 minutos\ntu tá no jogo.'}
        />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text variant="eyebrow" color={colors.fg}>
          S O U
        </Text>
        <View style={styles.grid}>
          <RoleCard token="09" name="Atleta" hint="Tenho minutos pra mostrar." active={role === 'atleta'} onPress={() => setRole('atleta')} />
          <RoleCard token="·" name="Contratante" hint="Procuro talento esquecido." active={role === 'contratante'} onPress={() => setRole('contratante')} />
        </View>

        {role === 'contratante' && (
          <View style={styles.subSection}>
            <Text variant="eyebrow" color={colors.fg}>
              T I P O · D E · C O N T R A T A N T E
            </Text>
            <View style={styles.grid}>
              <RoleCard token="FL" name="Clube" hint="Time, base, profissional." active={sub === 'club'} onPress={() => setSub('club')} />
              <RoleCard token="R." name="Agente" hint="Procurador / empresário." active={sub === 'agent'} onPress={() => setSub('agent')} />
            </View>
          </View>
        )}

        {role === 'atleta' && (
          <View style={styles.infoBox}>
            <Text variant="sm" color={colors.fg}>
              Vamos pedir nome, CPF, contato, posição e físico. Status (livre/empregado), agenciamento e pretensão salarial vêm no fim — você edita quando quiser.
            </Text>
          </View>
        )}

        {/* Cadastro por redes sociais — habilita após escolher o perfil */}
        <SocialAuthButtons disabled={!role} onApple={() => {}} onGoogle={() => {}} />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="CONTINUAR" chevron fullWidth disabled={!role} onPress={onContinue} />
        <Text variant="xs" color={colors.fgMuted} center>
          Ao continuar, você aceita os termos e a política.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function RoleCard({
  token,
  name,
  hint,
  active,
  onPress,
}: {
  token: string;
  name: string;
  hint: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.roleCard, active ? styles.roleActive : styles.roleInactive]}>
      <Text style={styles.roleToken} color={active ? palette.giz : palette.tinta}>
        {token}
      </Text>
      <Text variant="h3" color={active ? palette.giz : palette.tinta}>
        {name}
      </Text>
      <Text variant="xs" color={active ? palette.cinzaOnDark : colors.fgMuted}>
        {hint}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  subSection: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    marginTop: spacing.xs,
  },
  infoBox: {
    backgroundColor: palette.osso,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.xs,
  },
  roleCard: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  roleActive: {
    backgroundColor: palette.tinta,
    borderColor: palette.tinta,
  },
  roleInactive: {
    backgroundColor: palette.giz,
    borderColor: palette.osso,
  },
  roleToken: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 30,
    lineHeight: 32,
    letterSpacing: -1,
    marginBottom: spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    gap: spacing.md,
  },
});
