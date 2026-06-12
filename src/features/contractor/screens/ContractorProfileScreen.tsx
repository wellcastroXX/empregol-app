import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { palette, spacing } from '@/theme';
import type { ContractorProfile } from '@/types';
import { ContractorHeader, InstitutionalSection } from '../components';

/** Contractor profile — Topo (header) + Área institucional. Dark canvas (#141413). */
export function ContractorProfileScreen({
  contractor,
  onSettings,
}: {
  contractor: ContractorProfile;
  onSettings?: () => void;
}) {
  return (
    <Screen surface={palette.tinta}>
      <StatusBar style="light" />
      {onSettings && (
        <View style={styles.topBar}>
          <Text variant="eyebrow" color={palette.cinzaOnDark}>
            M I N H A · C O N T A
          </Text>
          <Pressable hitSlop={8} onPress={onSettings} accessibilityRole="button" accessibilityLabel="Ajustes">
            <Feather name="settings" size={20} color={palette.giz} />
          </Pressable>
        </View>
      )}
      <ContractorHeader contractor={contractor} />
      <InstitutionalSection contractor={contractor} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
});
