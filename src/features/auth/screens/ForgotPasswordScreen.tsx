import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Banner, Button, ScreenHeader, Screen, TextField } from '@/components/ui';
import { AuthError, authService } from '@/services';
import { spacing } from '@/theme';
import { isValidEmail } from '@/utils';

/** Password recovery — requests a reset e-mail from the API. */
export function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setSent(true);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível enviar. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <ScreenHeader
        back
        eyebrow="A C E S S O"
        title="Recuperar senha"
        subtitle="Enviaremos um link de redefinição para o seu e-mail."
      />

      {sent ? (
        <View style={styles.form}>
          <Banner
            tone="success"
            title="E-MAIL ENVIADO"
            message="Se houver uma conta com esse e-mail, você receberá as instruções em instantes."
          />
          <Button label="Voltar ao login" chevron fullWidth onPress={() => router.replace('/login')} />
        </View>
      ) : (
        <View style={styles.form}>
          {!!error && <Banner tone="danger" message={error} />}
          <TextField
            label="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
          />
          <Button label="Enviar link" chevron fullWidth loading={loading} onPress={handleSubmit} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
});
