import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { fontFamily, palette, radii, spacing } from '@/theme';
import type { AthleteProfile } from '@/types';

function maskCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.length >= 2 ? `•••.•••.•••-${digits.slice(-2)}` : '•••.•••.•••-••';
}

function birthDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '•• / •• / ••••';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd} / ${mm} / ${d.getUTCFullYear()}`;
}

/** Masks the trailing 4 digits of a phone number (privacy teaser). */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^55/, '');
  if (digits.length < 6) return '+55 •• ••••• ••••';
  const ddd = digits.slice(0, 2);
  const mid = digits.slice(2, -4);
  return `+55 ${ddd} ${mid} ••••`;
}

/** Locked private-data card for the scout view — masked values + access disclaimer. */
export function ScoutPersonalDataCard({ athlete }: { athlete: AthleteProfile }) {
  const rows: { label: string; value: string }[] = [
    { label: 'CPF', value: maskCpf(athlete.cpf) },
    { label: 'Nascimento', value: birthDate(athlete.dataNascimento) },
    { label: 'E-mail', value: athlete.email || '•••••@•••••' },
    { label: 'Telefone', value: maskPhone(athlete.telefone) },
    { label: 'Altura', value: `${(athlete.alturaCm / 100).toFixed(2)} m` },
    { label: 'Peso', value: `${athlete.pesoKg} kg` },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="eyebrow" color={palette.cinzaOnDark}>
          D A D O S · P E S S O A I S · P R I V A D O
        </Text>
        <Feather name="lock" size={14} color={palette.cinzaOnDark} />
      </View>

      <View style={styles.rows}>
        {rows.map((row, index) => (
          <View key={row.label} style={[styles.row, index > 0 && styles.rowDivider]}>
            <Text variant="sm" color={palette.cinzaOnDark}>
              {row.label}
            </Text>
            <Text style={styles.value} color={palette.giz}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      <Text variant="xs" color={palette.cinzaOnDark} style={styles.note}>
        Esses dados aparecem completos só pra clubes /{' '}
        agentes <Text variant="xs" color={palette.giz}>verificados</Text> com proposta enviada.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.tintaElev,
    borderWidth: 1,
    borderColor: palette.ruleOnDark,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rows: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: palette.giz12,
  },
  value: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 13,
    letterSpacing: 0.3,
    textAlign: 'right',
    flexShrink: 1,
  },
  note: {
    marginTop: spacing.xs,
    lineHeight: 17,
  },
});
