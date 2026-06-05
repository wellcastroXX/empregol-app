import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Logo, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';

/** Onboarding entry — ink-on-cream manifesto + role CTAs. */
export function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.top}>
          <Logo size={26} />
          <View style={styles.copy}>
            <Text variant="eyebrow" color={colors.fgMuted}>
              R E C O L O C A N D O · A T L E T A S
            </Text>
            <Text variant="displayLg" color={colors.fg}>
              Volta pro{'\n'}campo..
            </Text>
            <Text variant="body" color={colors.fgMuted}>
              A ponte entre atletas sem clube e quem decide a próxima janela. Atleta livre não é atleta esquecido.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label="Sou atleta"
            chevron
            size="md"
            fullWidth
            onPress={() => router.push('/register/athlete')}
          />
          <Button
            label="Sou clube ou agente"
            chevron
            variant="ink"
            fullWidth
            onPress={() => router.push('/register/account-type')}
          />
          <Button label="Já tenho conta" variant="text" onPress={() => router.push('/login')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  top: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing['3xl'],
  },
  copy: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.md,
    alignItems: 'stretch',
  },
});
