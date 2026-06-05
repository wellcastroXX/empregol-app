import { StyleSheet, View } from 'react-native';

import { Divider, SectionHeader, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';
import type { AthleteProfile } from '@/types';
import { formatDate } from '@/utils';

function maskCpfPrivate(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  if (!digits || digits.length < 2) return '···.···.···-··';
  return `···.···.···-${digits.slice(-2)}`;
}

function formatAltura(cm: number): string {
  return `${(cm / 100).toFixed(2).replace('.', ',')} m`;
}

/** Private data section for own-profile view — masked CPF/phone, height, weight, disclaimer. */
export function PersonalDataSection({ athlete }: { athlete: AthleteProfile }) {
  const rows: { label: string; value: string }[] = [
    { label: 'CPF', value: maskCpfPrivate(athlete.cpf) },
    { label: 'Nascimento', value: formatDate(athlete.dataNascimento) },
    { label: 'E-mail', value: athlete.email },
    { label: 'Telefone', value: athlete.telefone },
    { label: 'Altura', value: formatAltura(athlete.alturaCm) },
    { label: 'Peso', value: `${athlete.pesoKg} kg` },
  ];

  return (
    <View style={styles.wrapper}>
      <SectionHeader eyebrow="D A D O S · P E S S O A I S · P R I V A D O 🔒" />
      <View>
        {rows.map((row, index) => (
          <View key={row.label}>
            {index > 0 && <Divider />}
            <View style={styles.row}>
              <Text variant="sm" color={colors.fgMuted}>
                {row.label}
              </Text>
              <Text variant="smMedium" color={colors.fg}>
                {row.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Text variant="xs" color={colors.fgMuted} style={styles.disclaimer}>
        Visível apenas para contratantes verificados na plataforma.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  disclaimer: {
    marginTop: spacing.xs,
  },
});
