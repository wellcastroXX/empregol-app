import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors, fontFamily, palette, radii, spacing } from '@/theme';
import { initials as toInitials, timeAgoShort } from '@/utils';
import { Text } from './Text';

export type SpotlightClub = {
  id: string;
  name: string;
  companyName?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
};

const ROTATE_MS = 10000;

/**
 * "Destaques da semana" — global vertical-rotating spotlight of the latest
 * clubs that joined the platform. Crest when available, initials otherwise.
 */
export function ClubSpotlight({ clubs }: { clubs: SpotlightClub[] }) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (clubs.length <= 1) return;
    const timer = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
        setIndex((i) => (i + 1) % clubs.length);
        translateY.setValue(16);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]).start();
      });
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [clubs.length, opacity, translateY]);

  if (clubs.length === 0) return null;
  const club = clubs[Math.min(index, clubs.length - 1)];
  const label = club.companyName ?? club.name;

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <Text style={styles.eyebrow} color={palette.cinzaOnDark}>
          D E S T A Q U E S · D A · S E M A N A
        </Text>

        <Animated.View style={[styles.center, { opacity, transform: [{ translateY }] }]}>
          {club.avatarUrl ? (
            <Image source={{ uri: club.avatarUrl }} style={styles.crest} contentFit="contain" />
          ) : (
            <View style={styles.crestFallback}>
              <Text style={styles.crestInitials} color={palette.giz}>
                {toInitials(label)}
              </Text>
            </View>
          )}
          <Text style={styles.name} color={palette.giz} numberOfLines={2}>
            {label.toUpperCase()}
          </Text>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText} color={palette.cinzaOnDark}>
            {club.createdAt ? 'Entrou ' : 'Novo na plataforma'}
            {club.createdAt && (
              <Text style={styles.footerStrong} color={colors.accent}>
                há {timeAgoShort(club.createdAt)}
              </Text>
            )}
          </Text>
          <Text style={styles.footerText} color={palette.cinzaOnDark}>
            Está agora na <Text style={styles.brand} color={palette.giz}>empregol.</Text>
          </Text>
        </View>
      </View>

      {/* Vertical pagination dots */}
      {clubs.length > 1 && (
        <View style={styles.dots}>
          {clubs.map((c, i) => (
            <View key={c.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: palette.tinta,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.ruleOnDark,
    paddingVertical: spacing.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    minHeight: 188,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  eyebrow: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 11,
    letterSpacing: 1,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  crest: {
    width: 56,
    height: 56,
  },
  crestFallback: {
    width: 56,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: palette.tintaElev,
    borderWidth: 1,
    borderColor: palette.ruleOnDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestInitials: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
  },
  name: {
    flex: 1,
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  footerText: {
    fontFamily: fontFamily.text,
    fontSize: 13,
  },
  footerStrong: {
    fontFamily: fontFamily.textSemibold,
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.ruleOnDark,
  },
  dotActive: {
    backgroundColor: palette.gramado,
  },
});
