import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Banner, Button, ChipGroup, Text, TextField, type ChipOption } from '@/components/ui';
import { AGENCY, DOMINANT_FEET, GENDERS, PLAYER_LEVELS, POSITIONS } from '@/constants/positions';
import { useAuth } from '@/context/AuthContext';
import { RegisterHeader } from '@/features/auth/components/RegisterHeader';
import { AuthError } from '@/services';
import { colors, fontFamily, palette, radii, spacing } from '@/theme';
import type {
  AgencyStatus,
  AvailabilityStatus,
  DominantFoot,
  Genero,
  PlayerLevel,
  Position,
} from '@/types';
import {
  ageFromBirthdate,
  isValidCpf,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  maskCpf,
  maskDate,
  maskPhone,
  maskThousands,
  unmask,
} from '@/utils';

interface FormState {
  nome: string;
  cpf: string;
  dataNascimento: string; // dd/mm/yyyy
  idade: string;
  naturalidade: string;
  email: string;
  senha: string;
  telefone: string;
  genero?: Genero;
  posicao?: Position;
  peDominante?: DominantFoot;
  alturaM: string; // meters, e.g. "1.84"
  pesoKg: string;
  nivel?: PlayerLevel;
  ultimoClube: string;
  redeSocial: string;
  disponibilidade?: AvailabilityStatus;
  agenciamento?: AgencyStatus;
  baseSalarial: string;
  videos: string;
}

const POSITION_CHIPS: ChipOption<Position>[] = POSITIONS.map((p) => ({
  value: p.value,
  label: p.short ?? p.label,
}));
/** Football-idiom labels (DESTRO/CANHOTO) over the generic option labels. */
const FOOT_LABELS: Record<DominantFoot, string> = {
  direito: 'DESTRO',
  esquerdo: 'CANHOTO',
  ambidestro: 'AMBIDESTRO',
};
const FOOT_CHIPS: ChipOption<DominantFoot>[] = DOMINANT_FEET.map((f) => ({
  value: f.value,
  label: FOOT_LABELS[f.value],
}));
const LEVEL_CHIPS: ChipOption<PlayerLevel>[] = PLAYER_LEVELS.map((l) => ({
  value: l.value,
  label: l.label.toUpperCase(),
}));
const GENERO_CHIPS: ChipOption<Genero>[] = GENDERS.map((g) => ({
  value: g.value,
  label: g.label.toUpperCase(),
}));
const AGENCY_CHIPS: ChipOption<AgencyStatus>[] = AGENCY.map((a) => ({
  value: a.value,
  label: a.label.toUpperCase(),
}));

const STEP_COUNT = 3; // shown as steps 2/4 · 3/4 · 4/4 (account-type was step 1)

function toIsoDate(value: string): string | null {
  const [d, m, y] = value.split('/').map(Number);
  if (!d || !m || !y || value.length < 10) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Multi-step athlete cadastro — Identidade · Esportivo · Status. */
export function AthleteRegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    nome: '',
    cpf: '',
    dataNascimento: '',
    idade: '',
    naturalidade: '',
    email: '',
    senha: '',
    telefone: '',
    alturaM: '',
    pesoKg: '',
    ultimoClube: '',
    redeSocial: '',
    baseSalarial: '',
    videos: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onNascimento = (raw: string) => {
    const masked = maskDate(raw);
    const iso = toIsoDate(masked);
    setForm((prev) => ({
      ...prev,
      dataNascimento: masked,
      idade: iso ? String(ageFromBirthdate(iso)) : prev.idade,
    }));
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (form.nome.trim().length < 3) return 'Informe seu nome completo.';
      if (!isValidCpf(form.cpf)) return 'CPF inválido.';
      if (!toIsoDate(form.dataNascimento)) return 'Data de nascimento inválida.';
      if (form.naturalidade.trim().length < 2) return 'Informe sua naturalidade.';
      if (!isValidEmail(form.email)) return 'E-mail inválido.';
      if (!isValidPassword(form.senha)) {
        return 'A senha precisa ter ao menos 8 caracteres, com letras e números.';
      }
      if (!isValidPhone(form.telefone)) return 'Telefone inválido.';
    }
    if (step === 1) {
      if (!form.genero) return 'Selecione o gênero.';
      if (!form.posicao) return 'Selecione a posição.';
      if (!form.peDominante) return 'Selecione o pé dominante.';
      if (!parseFloat(form.alturaM.replace(',', '.'))) return 'Informe a altura.';
      if (!Number(form.pesoKg)) return 'Informe o peso.';
      if (!form.nivel) return 'Selecione o nível.';
    }
    if (step === 2) {
      if (!form.disponibilidade) return 'Selecione a disponibilidade.';
      if (!form.agenciamento) return 'Informe o agenciamento.';
      if (!Number(unmask(form.baseSalarial))) return 'Informe a base salarial pretendida.';
    }
    return null;
  };

  const handleNext = async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (step < STEP_COUNT - 1) {
      setStep((s) => s + 1);
      return;
    }
    await submit();
  };

  const handleBack = () => {
    setError(null);
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  };

  const submit = async () => {
    const iso = toIsoDate(form.dataNascimento)!;
    const alturaCm = Math.round(parseFloat(form.alturaM.replace(',', '.')) * 100);
    setLoading(true);
    try {
      await register({
        role: 'athlete',
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        telefone: form.telefone,
        senha: form.senha,
        cpf: form.cpf,
        dataNascimento: iso,
        idade: ageFromBirthdate(iso),
        naturalidade: form.naturalidade.trim(),
        genero: form.genero!,
        posicao: form.posicao!,
        peDominante: form.peDominante!,
        alturaCm,
        pesoKg: Number(form.pesoKg),
        videos: form.videos.split(/[\n,]/).map((v) => v.trim()).filter(Boolean),
        nivel: form.nivel!,
        disponibilidade: form.disponibilidade!,
        agenciamento: form.agenciamento!,
        baseSalarial: Number(unmask(form.baseSalarial)),
        redeSocial: form.redeSocial.trim() || undefined,
        stats: form.ultimoClube.trim() ? { ultimoClube: form.ultimoClube.trim() } : undefined,
      });
      router.replace('/verify-email');
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Não foi possível concluir o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const HEADERS = [
    { eyebrow: 'I D E N T I D A D E · L E G A L', title: 'Quem é\nvocê na ficha', subtitle: 'Dados oficiais usados pra validar tua conta e firmar contratos.' },
    { eyebrow: 'P E R F I L · E S P O R T I V O', title: 'Em que time\ntua bola joga', subtitle: undefined },
    { eyebrow: 'S T A T U S · & · P R E T E N S Ã O', title: 'Tua vitrine,\ntuas regras', subtitle: 'Esses campos aparecem pros clubes na tua vitrine. Edita quando quiser.' },
  ];
  const head = HEADERS[step];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <RegisterHeader
          step={step + 2}
          total={4}
          eyebrow={head.eyebrow}
          title={head.title}
          accentTail={step === 2 ? '..' : '.'}
          subtitle={head.subtitle}
          onBack={handleBack}
        />
      </View>

      {!!error && (
        <View style={styles.bannerWrap}>
          <Banner tone="danger" message={error} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <>
            <TextField label="NOME COMPLETO" required value={form.nome} onChangeText={(v) => set('nome', v)} placeholder="Lucas Henrique da Silva" />
            <TextField label="CPF" required mono hint="Validado online" keyboardType="number-pad" value={form.cpf} onChangeText={(v) => set('cpf', maskCpf(v))} placeholder="000.000.000-00" />
            <View style={styles.row}>
              <View style={styles.col}>
                <TextField label="NASCIMENTO" required mono keyboardType="number-pad" value={form.dataNascimento} onChangeText={onNascimento} placeholder="DD/MM/AAAA" />
              </View>
              <View style={styles.colSmall}>
                <TextField label="IDADE" mono keyboardType="number-pad" value={form.idade} onChangeText={(v) => set('idade', v)} placeholder="27" />
              </View>
            </View>
            <TextField label="NATURALIDADE" required value={form.naturalidade} onChangeText={(v) => set('naturalidade', v)} placeholder="Cidade - UF" />
            <TextField label="E-MAIL" required hint="Vamos verificar" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(v) => set('email', v)} placeholder="seu@email.com" />
            <TextField label="SENHA" required secure value={form.senha} onChangeText={(v) => set('senha', v)} placeholder="••••••••" />
            <TextField label="TELEFONE" required mono suffix="BR" keyboardType="phone-pad" value={form.telefone} onChangeText={(v) => set('telefone', maskPhone(v))} placeholder="(00) 00000-0000" />
          </>
        )}

        {step === 1 && (
          <>
            <Field label="GÊNERO">
              <ChipGroup options={GENERO_CHIPS} value={form.genero} onChange={(v) => set('genero', v)} size="lg" />
            </Field>
            <Field label="POSIÇÃO">
              <ChipGroup options={POSITION_CHIPS} value={form.posicao} onChange={(v) => set('posicao', v)} size="lg" grow />
            </Field>
            <Field label="PÉ DOMINANTE">
              <ChipGroup options={FOOT_CHIPS} value={form.peDominante} onChange={(v) => set('peDominante', v)} size="lg" />
            </Field>
            <View style={styles.row}>
              <View style={styles.col}>
                <TextField label="ALTURA" required mono suffix="M" keyboardType="decimal-pad" value={form.alturaM} onChangeText={(v) => set('alturaM', v)} placeholder="1.84" />
              </View>
              <View style={styles.col}>
                <TextField label="PESO" required mono suffix="KG" keyboardType="number-pad" value={form.pesoKg} onChangeText={(v) => set('pesoKg', v.replace(/\D/g, ''))} placeholder="78" />
              </View>
            </View>
            <Field label="NÍVEL">
              <ChipGroup options={LEVEL_CHIPS} value={form.nivel} onChange={(v) => set('nivel', v)} size="lg" />
            </Field>
            <TextField label="ÚLTIMO CLUBE" hint="Profissional, base ou amador" value={form.ultimoClube} onChangeText={(v) => set('ultimoClube', v)} placeholder="Vitória" />
          </>
        )}

        {step === 2 && (
          <>
            <Field label="D I S P O N I B I L I D A D E">
              <View style={styles.row}>
                <DispButton
                  label="Livre"
                  active={form.disponibilidade === 'livre'}
                  activeBg={palette.gramado}
                  onPress={() => set('disponibilidade', 'livre')}
                />
                <DispButton
                  label="Empregado"
                  active={form.disponibilidade === 'empregado'}
                  activeBg={palette.empregado}
                  onPress={() => set('disponibilidade', 'empregado')}
                />
              </View>
            </Field>
            <Field label="A G E N C I A M E N T O">
              <ChipGroup options={AGENCY_CHIPS} value={form.agenciamento} onChange={(v) => set('agenciamento', v)} size="lg" />
            </Field>
            <TextField label="BASE SALARIAL PRETENDIDA" hint="Visível p/ clubes" mono suffix="BRL" keyboardType="number-pad" value={form.baseSalarial} onChangeText={(v) => set('baseSalarial', maskThousands(v))} placeholder="12.000" />
            <TextField label="LINK DE VÍDEOS" hint="Visível p/ clubes" autoCapitalize="none" value={form.videos} onChangeText={(v) => set('videos', v)} placeholder="youtube.com" />
            <TextField label="LINK DA SUA REDE SOCIAL" hint="Visível p/ clubes" autoCapitalize="none" value={form.redeSocial} onChangeText={(v) => set('redeSocial', v)} placeholder="@instagram" />
            <View style={styles.infoBox}>
              <Text variant="sm" color={colors.fg}>
                Perfis com vídeo + base salarial recebem em média 3× mais propostas.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={step < STEP_COUNT - 1 ? 'CONTINUAR' : 'FINALIZAR CADASTRO'}
          chevron
          fullWidth
          loading={loading}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

/** Labeled block for non-input controls (chips / buttons). */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldBlock}>
      <Text variant="eyebrow" color={colors.fg}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function DispButton({
  label,
  active,
  activeBg,
  onPress,
}: {
  label: string;
  active: boolean;
  activeBg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.disp,
        active ? { backgroundColor: activeBg, borderColor: activeBg } : styles.dispInactive,
      ]}>
      <Text variant="monoLabel" color={active ? palette.giz : colors.fgMuted}>
        EU TÔ
      </Text>
      <Text style={styles.dispName} color={active ? palette.giz : palette.tinta}>
        {label}
      </Text>
    </Pressable>
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
  colSmall: {
    width: 96,
  },
  fieldBlock: {
    gap: spacing.sm,
  },
  infoBox: {
    backgroundColor: palette.osso,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  disp: {
    flex: 1,
    gap: 2,
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  dispInactive: {
    backgroundColor: palette.giz,
    borderColor: palette.osso,
  },
  dispName: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
});
