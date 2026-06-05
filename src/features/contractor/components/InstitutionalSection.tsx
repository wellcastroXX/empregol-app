import { StyleSheet, View } from 'react-native';

import { Divider, SectionHeader, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';
import type { ContractorProfile } from '@/types';

/** Institutional area — document, razão social, social, extra info. */
export function InstitutionalSection({ contractor }: { contractor: ContractorProfile }) {
  const rows: { label: string; value?: string }[] = [
    { label: contractor.tipo === 'club' ? 'CNPJ' : 'CPF', value: contractor.cnpj ?? contractor.cpf },
    { label: 'Razão social', value: contractor.razaoSocial },
    { label: 'Rede social', value: contractor.redeSocial },
    { label: 'Informações adicionais', value: contractor.informacoesAdicionais },
  ].filter((r) => !!r.value);

  if (rows.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <SectionHeader eyebrow="I N S T I T U C I O N A L" />
      <View>
        {rows.map((row, index) => (
          <View key={row.label}>
            {index > 0 && <Divider />}
            <View style={styles.row}>
              <Text variant="sm" color={colors.fgMuted}>
                {row.label}
              </Text>
              <Text variant="smMedium" color={colors.fg} style={styles.value}>
                {row.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
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
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
});
