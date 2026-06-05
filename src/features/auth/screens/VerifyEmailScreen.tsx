import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Banner, Button, Text } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { AuthError } from '@/services';
import { colors, fontFamily, palette, radii, spacing } from '@/theme';

const CODE_LEN = 6;

/** E-mail verification — 6-digit code → verify + auto-login (real API). */
export function VerifyEmailScreen() {
  const router = useRouter();
  const { pendingEmail, verifyEmail, resendCode } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [seconds, setSeconds] = useState(42);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const handleConfirm = async () => {
    if (code.length < CODE_LEN) {
      setError('Digite o código de 6 dígitos.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyEmail(code);
      // Auto-login on success → the (auth) layout redirects into the app.
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível verificar. Tente de novo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    try {
      await resendCode();
      setResent(true);
      setSeconds(42);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível reenviar.');
    }
  };

  const digits = Array.from({ length: CODE_LEN }, (_, i) => code[i] ?? '·');
  const timer = `0:${String(seconds).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Pressable hitSlop={8} onPress={() => router.back()} accessibilityRole="button">
            <Text variant="monoLabel" color={colors.fg}>
              ‹ VOLTAR
            </Text>
          </Pressable>
          <Text variant="monoLabel" color={colors.fgMuted}>
            SEGURANÇA
          </Text>
        </View>

        <View style={styles.head}>
          <Text variant="eyebrow" color={colors.fgMuted}>
            V E R I F I C A Ç Ã O · E - M A I L
          </Text>
          <Text variant="displaySm" color={colors.fg}>
            Confirma{'\n'}que é você
            <Text variant="displaySm" color={colors.accent}>
              .
            </Text>
          </Text>
          <Text variant="sm" color={colors.fgMuted}>
            Mandamos um código de 6 dígitos pra{' '}
            <Text variant="smMedium" color={colors.fg}>
              {pendingEmail ?? 'seu e-mail'}
            </Text>
            .
          </Text>
        </View>

        {!!error && <Banner tone="danger" message={error} />}
        {resent && !error && <Banner tone="success" message="Código reenviado para seu e-mail." />}

        {/* Code input */}
        <View>
          <Pressable style={styles.codeRow} onPress={() => inputRef.current?.focus()}>
            {digits.map((d, i) => {
              const filled = d !== '·';
              return (
                <View key={i} style={[styles.codeBox, filled && styles.codeBoxFilled]}>
                  <Text style={styles.codeDigit} color={filled ? palette.tinta : colors.fgMuted}>
                    {d}
                  </Text>
                </View>
              );
            })}
          </Pressable>
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            maxLength={CODE_LEN}
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
            autoFocus
          />
          <View style={styles.codeMeta}>
            {seconds > 0 ? (
              <Text variant="monoLabel" color={colors.fgMuted}>
                REENVIAR EM {timer}
              </Text>
            ) : (
              <Pressable hitSlop={8} onPress={handleResend} accessibilityRole="button">
                <Text variant="monoLabel" color={colors.fg}>
                  REENVIAR ›
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.bottom}>
          <Button label="CONFIRMAR" chevron fullWidth loading={loading} onPress={handleConfirm} />
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
    padding: spacing['2xl'],
    gap: spacing['2xl'],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  head: {
    gap: spacing.md,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  codeBox: {
    flex: 1,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: palette.giz,
    borderWidth: 1.5,
    borderColor: palette.osso,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFilled: {
    borderColor: palette.tinta,
  },
  codeDigit: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 26,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  codeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  bottom: {
    marginTop: 'auto',
  },
});
