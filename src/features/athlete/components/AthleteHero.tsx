import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Tag, Text } from '@/components/ui';
import { fontFamily, jerseySize, palette, radii, spacing } from '@/theme';
import type { AthleteProfile } from '@/types';
import { initials as toInitials } from '@/utils';
import { agencyTag, availabilityTag, levelTag } from '../badges';

const PHOTO_W = 120;
const PHOTO_H = 162; // 3:4 portrait

/** Full-width dark hero banner — portrait photo left, identity right. */
export function AthleteHero({ athlete }: { athlete: AthleteProfile }) {
  const isVerified = athlete.verificacao === 'verified';
  const daysActive = Math.max(0, Math.floor((Date.now() - new Date(athlete.criadoEm).getTime()) / 86400000));
  const verifiedLine = isVerified ? `✓  VERIFICADO · ${daysActive}D` : '⏳  AGUARDANDO VERIFICAÇÃO';
  const availability = availabilityTag(athlete.disponibilidade);
  const level = levelTag(athlete.nivel);
  const agency = agencyTag(athlete.agenciamento);

  return (
    <View style={styles.banner}>
      {/* Photo + jersey overlay */}
      <View style={styles.photoWrap}>
        {athlete.fotoUrl ? (
          <Image source={{ uri: athlete.fotoUrl }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <Text style={styles.initials} color={palette.giz}>
              {toInitials(athlete.nome)}
            </Text>
          </View>
        )}
        {athlete.numero != null && (
          <Text style={styles.jersey}>{String(athlete.numero).padStart(2, '0')}</Text>
        )}
      </View>

      {/* Identity column */}
      <View style={styles.info}>
        <Text variant="eyebrow" color={palette.cinzaOnDark}>
          {isVerified ? 'V E R I F I C A D O' : 'P E N D E N T E'}
        </Text>
        <Text variant="h2" color={palette.giz} numberOfLines={3} style={styles.name}>
          {athlete.nome}
        </Text>
        <Text variant="monoLabel" color={isVerified ? palette.gramado : palette.warn}>
          {verifiedLine}
        </Text>
        <View style={styles.tags}>
          <Tag
            label={availability.label}
            variant={athlete.disponibilidade === 'livre' ? 'live' : 'empregado'}
            dot={athlete.disponibilidade === 'livre'}
          />
          <Tag label={level.label} variant="ghostLight" />
          <Tag label={agency.label} variant="ghostLight" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: palette.tinta,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
    paddingHorizontal: '5%',
    gap: spacing.md,
    minHeight: PHOTO_H + spacing['2xl'] + spacing.lg,
  },
  photoWrap: {
    position: 'relative',
  },
  photo: {
    width: PHOTO_W,
    height: PHOTO_H,
    borderRadius: radii.sm,
  },
  photoFallback: {
    backgroundColor: palette.tintaElev,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fontFamily.displayBold,
    fontSize: PHOTO_W * 0.36,
    includeFontPadding: false,
  },
  jersey: {
    position: 'absolute',
    bottom: -8,
    left: -6,
    fontFamily: fontFamily.monoMedium,
    fontSize: jerseySize.md,
    lineHeight: jerseySize.md,
    color: 'rgba(251, 250, 245, 0.25)',
    letterSpacing: -4,
    fontVariant: ['tabular-nums'] as const,
  },
  info: {
    flex: 1,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  name: {
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
