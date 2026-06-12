import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, fontSize, palette, radii, spacing } from '@/theme';

export type TagVariant = 'default' | 'live' | 'ink' | 'inkElev' | 'ghost' | 'ghostLight' | 'empregado' | 'warn';

export type TagProps = {
  label: string;
  variant?: TagVariant;
  /** Show a small leading status dot in the foreground color. */
  dot?: boolean;
};

const VARIANTS: Record<TagVariant, { bg: string; fg: string; border?: string }> = {
  default: { bg: palette.osso, fg: palette.tinta },
  live: { bg: palette.gramado, fg: palette.giz },
  ink: { bg: palette.tinta, fg: palette.giz },
  inkElev: { bg: palette.tintaElev, fg: palette.giz, border: palette.ruleOnDark },
  ghost: { bg: 'transparent', fg: palette.tinta, border: palette.tinta },
  ghostLight: { bg: 'transparent', fg: palette.giz, border: palette.giz },
  empregado: { bg: palette.empregado, fg: palette.giz },
  warn: { bg: 'transparent', fg: palette.warn, border: palette.warn },
};

/** The brand's flat capsule — POSIÇÃO · STATUS · MÉTRICA. Mono, ALL CAPS, 2px radius. */
export function Tag({ label, variant = 'default', dot }: TagProps) {
  const tone = VARIANTS[variant];
  return (
    <View
      style={[
        styles.tag,
        { backgroundColor: tone.bg },
        tone.border != null && { borderColor: tone.border, borderWidth: 1 },
      ]}>
      {dot && <View style={[styles.dot, { backgroundColor: tone.fg }]} />}
      <Text style={[styles.label, { color: tone.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: spacing.xs,
    borderRadius: radii.xs,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  label: {
    fontFamily: fontFamily.monoMedium,
    fontSize: fontSize.tag,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
