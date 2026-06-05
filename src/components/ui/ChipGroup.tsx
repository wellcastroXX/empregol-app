import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import { Chip, type ChipSize } from './Chip';

export type ChipOption<T extends string> = { value: T; label: string };

export type ChipGroupProps<T extends string> = {
  options: ChipOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  size?: ChipSize;
  /** Chips grow to fill each row (equal width), wrapping to a grid. */
  grow?: boolean;
};

/** Single-select row of chips (wraps). Mirrors the brand's ChipRow. */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  size,
  grow,
}: ChipGroupProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          size={size}
          selected={value === opt.value}
          onPress={() => onChange(opt.value)}
          style={grow ? styles.grow : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  grow: {
    flexGrow: 1,
    flexBasis: 40,
    paddingHorizontal: 4,
  },
});
