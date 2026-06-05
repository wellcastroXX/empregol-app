import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, EmptyState, Logo, Text, TextField } from '@/components/ui';
import { POSITIONS } from '@/constants/positions';
import { profileService } from '@/services';
import { colors, spacing } from '@/theme';
import type { AthleteProfile, Position } from '@/types';
import { AthleteCard } from '../components';

/** Vitrine — scout view of available athletes. "N atletas esperando você." */
export function DiscoverScreen() {
  const router = useRouter();
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<Position | undefined>();

  useEffect(() => {
    let active = true;
    profileService
      .listAthletes()
      .then((data) => active && setAthletes(data))
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return athletes.filter((a) => {
      if (term && !a.nome.toLowerCase().includes(term)) return false;
      if (position && a.posicao !== position) return false;
      return true;
    });
  }, [athletes, search, position]);

  const livres = athletes.filter((a) => a.disponibilidade === 'livre').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.strip}>
          <Logo size={20} />
          <Text variant="eyebrow" color={colors.fgMuted}>
            VITRINE
          </Text>
        </View>

        <View style={styles.heroBlock}>
          <Text variant="eyebrow" color={colors.fgMuted}>
            B U S C A · A T L E T A S
          </Text>
          <Text variant="displayMd" color={colors.fg}>
            {livres} atletas{'\n'}esperando você.
          </Text>
        </View>

        <TextField
          placeholder="Nome, posição, clube..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}>
        <Chip label="Todas" selected={!position} onPress={() => setPosition(undefined)} />
        {POSITIONS.map((p) => (
          <Chip
            key={p.value}
            label={p.short ?? p.label}
            selected={position === p.value}
            onPress={() => setPosition(p.value)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : failed ? (
        <EmptyState
          icon="lock"
          title="Exclusivo para clubes e agentes"
          message="A vitrine de atletas é liberada para contas de clube ou agente."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text variant="monoLabel" color={colors.fgMuted}>
            {filtered.length} {filtered.length === 1 ? 'atleta' : 'atletas'}
          </Text>
          {filtered.length === 0 ? (
            <EmptyState
              icon="search"
              title="Nenhum atleta encontrado.."
              message="Ajuste a busca ou os filtros."
            />
          ) : (
            filtered.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                onPress={() => router.push(`/athletes/${athlete.id}`)}
              />
            ))
          )}
        </ScrollView>
      )}
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
    gap: spacing.lg,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  heroBlock: {
    gap: spacing.sm,
  },
  chips: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: 0,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
