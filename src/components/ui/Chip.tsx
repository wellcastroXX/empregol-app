import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fontFamily, fontSize, palette, radii } from '@/theme';
import { Text } from './Text';

export type ChipSize = 'sm' | 'lg';

export type ChipProps = {
  label: string;
  selected?: boolean;
  size?: ChipSize;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Filter chip — mono ALL CAPS. Active = ink fill; inactive = osso outline. */
export function Chip({ label, selected, size = 'sm', onPress, style }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.chip,
        size === 'lg' && styles.lg,
        selected ? styles.selected : styles.unselected,
        style,
      ]}>
      <Text style={styles.label} numberOfLines={1} color={selected ? palette.giz : palette.tinta}>
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
  label: {
    fontFamily: fontFamily.monoMedium,
    fontSize: fontSize.eyebrow,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
