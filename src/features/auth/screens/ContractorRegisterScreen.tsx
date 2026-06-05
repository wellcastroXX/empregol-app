import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Banner, Button, ChipGroup, Text, TextField, type ChipOption } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { RegisterHeader } from '@/features/auth/components/RegisterHeader';
import { AuthError } from '@/services';
import type { ContractorKind } from '@/types';
import { colors, spacing } from '@/theme';
import {
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  maskCnpj,
  maskCpf,
  maskPhone,
} from '@/utils';

const TIPO_CHIPS: ChipOption<ContractorKind>[] = [
  { value: 'club', label: 'CLUBE' },
  { value: 'agent', label: 'AGENTE' },
];

/** Cadastro do contratante — Clube (CNPJ) ou Agente (CPF). */
export function ContractorRegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const params = useLocalSearchParams<{ tipo?: string }>();

  const [tipo, setTipo] = useState<ContractorKind>(params.tipo === 'agent' ? 'agent' : 'club');
  const isClub = tipo === 'club';

  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [redeSocial, setRedeSocial] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (nome.trim().length < 2) return setError(isClub ? 'Informe o nome do clube.' : 'Informe seu nome.');
    if (isClub) {
      if (!isValidCnpj(documento)) return setError('CNPJ inválido.');
    } else if (!isValidCpf(documento)) {
      return setError('CPF inválido.');
    }
    if (!isValidEmail(email)) return setError('E-mail inválido.');
    if (!isValidPhone(telefone)) return setError('Telefone inválido.');
    if (!isValidPassword(senha)) {
      return setError('A senha precisa ter ao menos 8 caracteres, com letras e números.');
    }

    setLoading(true);
    try {
      await register({
        role: 'contractor',
        tipo,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone,
        senha,
        redeSocial: redeSocial.trim() || undefined,
        ...(isClub ? { cnpj: documento, razaoSocial: razaoSocial.trim() || undefined } : { cpf: documento }),
      });
      router.replace('/verify-email');
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível concluir o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <RegisterHeader
          step={2}
          total={2}
          eyebrow="C O N T R A T A N T E"
          title={isClub ? 'Quem é o clube' : 'Quem é o agente'}
          accentTail="."
          subtitle="Validamos CPF / CNPJ pra liberar mensagens com atletas."
        />
      </View>

      {!!error && (
        <View style={styles.bannerWrap}>
          <Banner tone="danger" message={error} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.tipoBlock}>
          <Text variant="eyebrow" color={colors.fg}>
            T I P O · D E · C O N T A
          </Text>
          <ChipGroup options={TIPO_CHIPS} value={tipo} onChange={setTipo} />
        </View>

        <TextField
          label={isClub ? 'NOME DO CLUBE' : 'NOME COMPLETO'}
          required
          value={nome}
          onChangeText={setNome}
          placeholder={isClub ? 'Botafogo de Ribeirão Preto' : 'Renato Pacheco'}
        />

        {isClub ? (
          <>
            <TextField label="CNPJ" required mono hint="Validado online" keyboardType="number-pad" value={documento} onChangeText={(v) => setDocumento(maskCnpj(v))} placeholder="00.000.000/0000-00" />
            <TextField label="RAZÃO SOCIAL" value={razaoSocial} onChangeText={setRazaoSocial} placeholder="Botafogo Futebol e Regatas S/A" />
          </>
        ) : (
          <TextField label="CPF" required mono hint="Validado online" keyboardType="number-pad" value={documento} onChangeText={(v) => setDocumento(maskCpf(v))} placeholder="000.000.000-00" />
        )}

        <TextField label="E-MAIL" required hint="Vamos verificar" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="contato@clube.com.br" />
        <TextField label="TELEFONE" required mono suffix="BR" keyboardType="phone-pad" value={telefone} onChangeText={(v) => setTelefone(maskPhone(v))} placeholder="(00) 00000-0000" />
        <TextField label="REDE SOCIAL" hint="Opcional" autoCapitalize="none" value={redeSocial} onChangeText={setRedeSocial} placeholder="@clube" />
        <TextField label="SENHA" required secure value={senha} onChangeText={setSenha} placeholder="••••••••" />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="VERIFICAR E CONTINUAR" chevron fullWidth loading={loading} onPress={handleSubmit} />
      </View>
    </SafeAreaView>
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
  bannerWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  tipoBlock: {
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
});
