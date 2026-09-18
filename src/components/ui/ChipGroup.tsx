import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';
import { Chip, type ChipSize } from './Chip';

export type ChipOption<T extends string> = { value: T; label: string };

type BaseProps<T extends string> = {
  options: ChipOption<T>[];
  size?: ChipSize;
  /** Chips grow to fill each row (equal width), wrapping to a grid. */
  grow?: boolean;
  /** Dark canvas variant (contractor env). */
  dark?: boolean;
};

type SingleProps<T extends string> = BaseProps<T> & {
  multiple?: false;
  value?: T;
  onChange: (value: T) => void;
};

type MultiProps<T extends string> = BaseProps<T> & {
  multiple: true;
  /** Currently selected values. */
  values: T[];
  /** Toggle a value on/off. */
  onToggle: (value: T) => void;
  /** Max selectable; extra taps on unselected chips are ignored at the cap. */
  max?: number;
};

export type ChipGroupProps<T extends string> = SingleProps<T> | MultiProps<T>;

/**
 * Row of chips (wraps). Single-select by default; pass `multiple` for a
 * multi-select group with an optional `max` cap.
 */
export function ChipGroup<T extends string>(props: ChipGroupProps<T>) {
  const { options, size, grow, dark } = props;

  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const selected = props.multiple
          ? props.values.includes(opt.value)
          : props.value === opt.value;

        const atCap =
          props.multiple &&
          !selected &&
          props.max != null &&
          props.values.length >= props.max;

        return (
          <Chip
            key={opt.value}
            label={opt.label}
            size={size}
            dark={dark}
            selected={selected}
            disabled={atCap || undefined}
            onPress={() =>
              props.multiple ? props.onToggle(opt.value) : props.onChange(opt.value)
            }
            style={grow ? styles.grow : undefined}
          />
        );
      })}
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
