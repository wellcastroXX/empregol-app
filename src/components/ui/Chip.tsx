import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fontFamily, fontSize, palette, radii } from '@/theme';
import { Text } from './Text';

export type ChipSize = 'sm' | 'lg';

export type ChipProps = {
  label: string;
  selected?: boolean;
  size?: ChipSize;
  /** Dark canvas variant (contractor env): light fill when active, cream outline when not. */
  dark?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Filter chip — mono ALL CAPS. Active = ink fill; inactive = osso outline. */
export function Chip({ label, selected, size = 'sm', dark, onPress, style }: ChipProps) {
  const variant = dark
    ? selected
      ? styles.selectedDark
      : styles.unselectedDark
    : selected
      ? styles.selected
      : styles.unselected;
  const fg = dark
    ? selected
      ? palette.tinta
      : palette.giz
    : selected
      ? palette.giz
      : palette.tinta;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, size === 'lg' && styles.lg, variant, style]}>
      <Text style={styles.label} numberOfLines={1} color={fg}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radii.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: {
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selected: {
    backgroundColor: palette.tinta,
    borderColor: palette.tinta,
  },
  unselected: {
    backgroundColor: 'transparent',
    borderColor: colors.rule,
  },
  selectedDark: {
    backgroundColor: palette.giz,
    borderColor: palette.giz,
  },
  unselectedDark: {
    backgroundColor: 'transparent',
    borderColor: palette.cinzaOnDark,
  },
  label: {
    fontFamily: fontFamily.monoMedium,
    fontSize: fontSize.eyebrow,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
