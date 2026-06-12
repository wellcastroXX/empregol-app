import { StyleSheet, View } from 'react-native';

import { Avatar, Divider, Tag, Text } from '@/components/ui';
import { CONTRACTOR_KINDS, labelOf } from '@/constants/positions';
import { palette, spacing } from '@/theme';
import type { ContractorProfile } from '@/types';

/** Top of the contractor profile — monogram, name, account type, contact. */
export function ContractorHeader({ contractor }: { contractor: ContractorProfile }) {
  const verified = contractor.verificacao === 'verified';

  return (
    <View style={styles.wrapper}>
      <View style={styles.identityRow}>
        <Avatar name={contractor.nome} uri={contractor.fotoUrl} size={64} tone="bone" />
        <View style={styles.identity}>
          <Text variant="h2" color={palette.giz}>
            {contractor.nome}
          </Text>
          <View style={styles.tags}>
            <Tag label={labelOf(CONTRACTOR_KINDS, contractor.tipo).toUpperCase()} variant="inkElev" />
            <Tag
              label={verified ? 'VERIFICADO' : 'NÃO VERIFICADO'}
              variant={verified ? 'live' : 'ghostLight'}
            />
          </View>
        </View>
      </View>

      <Divider color={palette.ruleOnDark} />

      <ContactRow label="E-mail" value={contractor.email} />
      <ContactRow label="Telefone" value={contractor.telefone} />
    </View>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.contactRow}>
      <Text variant="sm" color={palette.cinzaOnDark}>
        {label}
      </Text>
      <Text variant="smMedium" color={palette.giz}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  identity: {
    flex: 1,
    gap: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
});
