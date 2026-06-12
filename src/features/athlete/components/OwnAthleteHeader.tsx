import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Tag, Text } from '@/components/ui';
import { POSITIONS } from '@/constants/positions';
import { fontFamily, jerseySize, palette, radii, spacing } from '@/theme';
import type { AthleteProfile } from '@/types';
import { initials as toInitials } from '@/utils';
import { agencyTag, availabilityTag, levelTag } from '../badges';

const PHOTO_W = 138;
const PHOTO_H = 176;

const FOOT_LABEL: Record<AthleteProfile['peDominante'], string> = {
  esquerdo: 'CANHOTO',
  direito: 'DESTRO',
  ambidestro: 'AMBIDESTRO',
};

/** Camera glyph (stroke = cream), exactly per the reference spec. */
function CameraIcon({ color = palette.giz }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M14.625 4.875H3.375C2.54657 4.875 1.875 5.54657 1.875 6.375V13.125C1.875 13.9534 2.54657 14.625 3.375 14.625H14.625C15.4534 14.625 16.125 13.9534 16.125 13.125V6.375C16.125 5.54657 15.4534 4.875 14.625 4.875Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12.375C10.4497 12.375 11.625 11.1997 11.625 9.75C11.625 8.30025 10.4497 7.125 9 7.125C7.55025 7.125 6.375 8.30025 6.375 9.75C6.375 11.1997 7.55025 12.375 9 12.375Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M6 4.875L7.125 3.375H10.875L12 4.875" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Pencil/edit glyph (stroke = cream), exactly per the reference spec. */
function PencilIcon({ color = palette.giz }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M10.5 3L15 7.5L6.75 15.75H2.25V11.25L10.5 3Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ActionButton({
  label,
  icon,
  variant,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  variant: 'outline' | 'solid';
  onPress?: () => void;
}) {
  const solid = variant === 'solid';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        solid ? styles.btnSolid : styles.btnOutline,
        pressed && styles.btnPressed,
      ]}>
      <Text style={styles.btnLabel} color={palette.giz}>
        {label}
      </Text>
      {icon}
    </Pressable>
  );
}

export type OwnAthleteHeaderProps = {
  athlete: AthleteProfile;
  /** Top safe-area inset, so the dark block bleeds under the status bar. */
  insetsTop: number;
  onUpdatePhoto?: () => void;
  onUpdateData?: () => void;
  onShare?: () => void;
};

/** Dark editorial header for the athlete's OWN profile — matches the reference. */
export function OwnAthleteHeader({ athlete, insetsTop, onUpdatePhoto, onUpdateData, onShare }: OwnAthleteHeaderProps) {
  const isVerified = athlete.verificacao === 'verified';
  const daysActive = Math.max(0, Math.floor((Date.now() - new Date(athlete.criadoEm).getTime()) / 86400000));
  const availability = availabilityTag(athlete.disponibilidade);
  const level = levelTag(athlete.nivel);
  const agency = agencyTag(athlete.agenciamento);

  const pos = POSITIONS.find((p) => p.value === athlete.posicao);
  const positionTag = pos ? `${pos.short} · ${pos.label.toUpperCase()}` : athlete.posicao.toUpperCase();
  const heightMeters = `${(athlete.alturaCm / 100).toFixed(2)}M`;
  const physical = `${athlete.idade} ANOS · ${heightMeters}`;
  const footTag = FOOT_LABEL[athlete.peDominante];

  return (
    <View style={[styles.banner, { paddingTop: insetsTop + spacing.sm }]}>
      {/* Header row */}
      <View style={styles.topRow}>
        <Text variant="eyebrow" color={palette.giz}>
          P E R F I L
        </Text>
        <Pressable hitSlop={10} onPress={onShare} accessibilityRole="button" accessibilityLabel="Compartilhar">
          <Feather name="share-2" size={18} color={palette.giz} />
        </Pressable>
      </View>
      <View style={styles.rule} />

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
          <Text style={styles.name} color={palette.giz} numberOfLines={2}>
            {athlete.nome}
          </Text>

          <View style={styles.verifiedRow}>
            <View style={[styles.checkDot, !isVerified && styles.checkDotPending]}>
              <Feather name={isVerified ? 'check' : 'clock'} size={11} color={palette.giz} />
            </View>
            <Text variant="monoLabel" color={palette.cinzaOnDark}>
              {isVerified ? `VERIFICADO · ${daysActive}D` : 'AGUARDANDO'}
            </Text>
          </View>

          <View style={styles.statusTags}>
            <Tag label={availability.label} variant={athlete.disponibilidade === 'livre' ? 'live' : 'empregado'} dot={athlete.disponibilidade === 'livre'} />
            <Tag label={level.label} variant="ghostLight" />
            <Tag label={agency.label} variant="ghostLight" />
          </View>
        </View>
      </View>

      {/* Physical / position tiles */}
      <View style={styles.infoTags}>
        <Tag label={positionTag} variant="inkElev" />
        <Tag label={physical} variant="inkElev" />
        <Tag label={footTag} variant="inkElev" />
      </View>

      {/* Edit actions */}
      <View style={styles.buttons}>
        <ActionButton label="ATUALIZAR FOTO" icon={<CameraIcon />} variant="outline" onPress={onUpdatePhoto} />
        <ActionButton label="ATUALIZAR DADOS" icon={<PencilIcon />} variant="solid" onPress={onUpdateData} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: palette.tinta,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  rule: {
    height: 1,
    backgroundColor: palette.ruleOnDark,
    marginTop: -spacing.xs,
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
    backgroundColor: palette.tintaElev,
  },
  photoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fontFamily.displayBold,
    fontSize: PHOTO_W * 0.34,
    includeFontPadding: false,
  },
  jersey: {
    position: 'absolute',
    right: -2,
    bottom: -10,
    fontFamily: fontFamily.monoMedium,
    fontSize: jerseySize.md + 8,
    lineHeight: jerseySize.md + 8,
    color: palette.giz,
    letterSpacing: -4,
    fontVariant: ['tabular-nums'] as const,
    includeFontPadding: false,
  },
  info: {
    flex: 1,
    gap: spacing.sm,
  },
  name: {
    fontFamily: fontFamily.display,
    fontSize: 30,
    lineHeight: 30,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.gramado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDotPending: {
    backgroundColor: palette.warn,
  },
  statusTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  infoTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.giz64,
  },
  btnSolid: {
    backgroundColor: palette.gramado,
  },
  btnPressed: {
    opacity: 0.7,
  },
  btnLabel: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
