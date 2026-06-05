import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Banner, Button, Logo, Text, TextField } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { SocialAuthButtons } from '@/features/auth/components/SocialAuthButtons';
import { AuthError } from '@/services';
import { colors, palette, spacing } from '@/theme';
import { isValidEmail } from '@/utils';

/** Login — "Volta pro campo." Brand top, e-mail/senha, social, signup link. */
export function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!isValidEmail(email) || senha.length === 0) {
      setError('Informe um e-mail válido e a senha.');
      return;
    }
    setLoading(true);
    try {
      await signIn({ email, senha });
    } catch (e) {
      if (e instanceof AuthError && e.code === 'EMAIL_NOT_VERIFIED') {
        router.push('/verify-email');
        return;
      }
      setError(e instanceof AuthError ? e.message : 'Não foi possível entrar. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Brand top */}
        <View style={styles.top}>
          <Logo size={28} />
          <View style={styles.headline}>
            <Text variant="eyebrow" color={colors.fgMuted}>
              V O L T A · P R O · C A M P O
            </Text>
            <Text variant="displayLg" color={colors.fg}>
              Bem-vindo de{'\n'}volta<Text variant="displayLg" color={colors.accent}>.</Text>
            </Text>
            <Text variant="sm" color={colors.fgMuted} style={styles.sub}>
              312 clubes olham hoje. Bom te ver de volta.
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!!error && <Banner tone="danger" message={error} />}
          <TextField
            label="E-MAIL"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
          />
          <TextField
            label="SENHA"
            secure
            value={senha}
            onChangeText={setSenha}
            placeholder="••••••••"
          />
          <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8} style={styles.forgot}>
            <Text variant="monoLabel" color={colors.fg}>
              Esqueci a senha ›
            </Text>
          </Pressable>

          <Button label="ENTRAR" chevron fullWidth loading={loading} onPress={handleSubmit} />

          <SocialAuthButtons onApple={() => {}} onGoogle={() => {}} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="sm" color={colors.fgMuted}>
            Novo aqui?{' '}
          </Text>
          <Pressable onPress={() => router.push('/register/account-type')} hitSlop={8}>
            <Text variant="smMedium" color={colors.fg} style={styles.footerLink}>
              Cadastra-se em 4 minutos ›
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: spacing['2xl'],
    gap: spacing['2xl'],
  },
  top: {
    gap: spacing['3xl'],
  },
  headline: {
    gap: spacing.md,
  },
  sub: {
    maxWidth: 280,
  },
  form: {
    gap: spacing.lg,
  },
  forgot: {
    alignSelf: 'flex-start',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLink: {
    borderBottomWidth: 1.5,
    borderBottomColor: palette.tinta,
  },
});
