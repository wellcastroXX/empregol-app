import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Tag, Text } from '@/components/ui';
import { POSITIONS } from '@/constants/positions';
import { fontFamily, jerseySize, palette, radii, spacing } from '@/theme';
import type { AthleteProfile } from '@/types';
import { initials as toInitials } from '@/utils';

const PHOTO_W = 112;
const PHOTO_H = 150;

const FOOT_LABEL: Record<AthleteProfile['peDominante'], string> = {
  esquerdo: 'CANHOTO',
  direito: 'DESTRO',
  ambidestro: 'AMBIDESTRO',
};

/** Light editorial header for the AGENT/CLUB view of an athlete — matches the reference. */
export function ScoutAthleteHeader({ athlete }: { athlete: AthleteProfile }) {
  const isVerified = athlete.verificacao === 'verified';
  const isLivre = athlete.disponibilidade === 'livre';
  const daysActive = Math.max(0, Math.floor((Date.now() - new Date(athlete.criadoEm).getTime()) / 86400000));

  const pos = POSITIONS.find((p) => p.value === athlete.posicao);
  const positionLine = pos ? `${pos.short} · ${pos.label.toUpperCase()}` : athlete.posicao.toUpperCase();
  const alturaM = `${(athlete.alturaCm / 100).toFixed(2)}M`;
  const physical = `${athlete.idade} ANOS · ${alturaM}`;

  return (
    <View style={styles.wrapper}>
      {/* Hero — photo + identity */}
      <View style={styles.heroRow}>
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

        <View style={styles.info}>
          <Text variant="eyebrow" color={palette.cinzaOnDark}>
            {isVerified ? 'V E R I F I C A D O' : 'P E N D E N T E'}
          </Text>
          <Text variant="h2" color={palette.giz} numberOfLines={2} style={styles.name}>
            {athlete.nome}
          </Text>
          <View style={styles.verifiedRow}>
            <View style={[styles.checkDot, !isVerified && styles.checkDotPending]}>
              <Feather name={isVerified ? 'check' : 'clock'} size={13} color={palette.giz} />
            </View>
            <Text style={styles.verifiedText} color={palette.cinzaOnDark}>
              {isVerified ? `VERIFICADO · ${daysActive}D` : 'AGUARDANDO'}
            </Text>
          </View>
        </View>
      </View>

      {/* Status tags */}
      <View style={styles.tags}>
        <Tag label={isLivre ? 'LIVRE' : 'EMPREGADO'} variant={isLivre ? 'live' : 'empregado'} dot={isLivre} size="md" />
        <Tag label={athlete.nivel.toUpperCase()} variant="ghostLight" size="md" />
        <Tag label={athlete.agenciamento === 'nao_agenciado' ? 'NÃO AGENCIADO' : 'AGENCIADO'} variant="ghostLight" size="md" />
      </View>

      {/* Physical / position line */}
      <View style={styles.metaLines}>
        <Text style={styles.meta} color={palette.cinzaOnDark}>
          {positionLine}
          {'    '}
          {physical}
        </Text>
        <Text style={styles.meta} color={palette.cinzaOnDark}>
          {FOOT_LABEL[athlete.peDominante]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: '5%',
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  photoWrap: {
    width: PHOTO_W,
    height: PHOTO_H,
  },
  photo: {
    width: PHOTO_W,
    height: PHOTO_H,
    borderRadius: radii.sm,
    backgroundColor: palette.tinta,
  },
  photoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fontFamily.displayBold,
    fontSize: PHOTO_W * 0.34,
    lineHeight: PHOTO_W * 0.42,
    textAlign: 'center',
  },
  jersey: {
    position: 'absolute',
    left: -4,
    bottom: -12,
    fontFamily: fontFamily.monoMedium,
    fontSize: jerseySize.md,
    lineHeight: jerseySize.md,
    color: palette.empregado,
    letterSpacing: -4,
    fontVariant: ['tabular-nums'] as const,
    includeFontPadding: false,
  },
  info: {
    flex: 1,
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  name: {
    marginTop: 2,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  verifiedText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  checkDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.gramado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDotPending: {
    backgroundColor: palette.warn,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaLines: {
    gap: spacing.xs,
  },
  meta: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
