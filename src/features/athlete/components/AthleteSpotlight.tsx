import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { fontFamily, palette, radii, spacing } from '@/theme';
import { initials as toInitials, timeAgoShort } from '@/utils';

export type SpotlightAthlete = {
  id: string;
  nome: string;
  fotoUrl?: string;
  naturalidade?: string;
  criadoEm?: string;
};

const ROTATE_MS = 10000;

/**
 * "Destaques da semana" (view do agente) — carrossel vertical automático dos
 * atletas recém-chegados. Card verde com borda; dots FORA do card, à direita.
 * Mostra a foto do atleta ou as iniciais.
 */
export function AthleteSpotlight({ athletes }: { athletes: SpotlightAthlete[] }) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (athletes.length <= 1) return;
    const timer = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        setIndex((i) => (i + 1) % athletes.length);
        translateY.setValue(16);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]).start();
      });
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [athletes.length, opacity, translateY]);

  if (athletes.length === 0) return null;
  const a = athletes[Math.min(index, athletes.length - 1)];

  return (
    <View style={styles.wrap}>
      <View style={styles.frame}>
        <View style={styles.card}>
        <Text style={styles.eyebrow} color={MUTED}>
          D E S T A Q U E S · D A · S E M A N A
        </Text>

        <Animated.View style={[styles.body, { opacity, transform: [{ translateY }] }]}>
          <View style={styles.row}>
            {a.fotoUrl ? (
              <Image source={{ uri: a.fotoUrl }} style={styles.photo} contentFit="cover" />
            ) : (
              <View style={[styles.photo, styles.photoFallback]}>
                <Text style={styles.initials} color={palette.giz}>
                  {toInitials(a.nome)}
                </Text>
              </View>
            )}
            <Text style={styles.name} color={palette.giz} numberOfLines={2}>
              {a.nome.toUpperCase()}
            </Text>
          </View>

          {!!a.naturalidade && (
            <Text style={styles.state} color={MUTED}>
              {a.naturalidade.toUpperCase()}
            </Text>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText} color={palette.giz}>
              {a.criadoEm ? `Entrou há ${timeAgoShort(a.criadoEm)}` : 'Novo na plataforma'}
            </Text>
            <Text style={styles.footerText} color={MUTED}>
              Está agora na <Text style={styles.brand} color={palette.giz}>empregol</Text>
            </Text>
          </View>
        </Animated.View>
        </View>
      </View>

      {/* Dots — fora do card, à direita */}
      {athletes.length > 1 && (
        <View style={styles.dots}>
          {athletes.map((x, i) => (
            <View key={x.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const MUTED = 'rgba(251,250,245,0.7)';

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  frame: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: palette.gramado,
    borderRadius: radii.lg + 5,
    padding: 5,
  },
  card: {
    backgroundColor: palette.gramado,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 2,
    textAlign: 'center',
  },
  body: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: palette.tinta,
  },
  photoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
  },
  name: {
    flex: 1,
    fontFamily: fontFamily.displayBold,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  state: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 11,
    letterSpacing: 1.4,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  footerText: {
    fontFamily: fontFamily.text,
    fontSize: 13,
  },
  brand: {
    fontFamily: fontFamily.displayBold,
    fontSize: 13,
  },
  dots: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: palette.ruleOnDark,
  },
  dotActive: {
    backgroundColor: palette.gramado,
  },
});
