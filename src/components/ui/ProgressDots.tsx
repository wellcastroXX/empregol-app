import { StyleSheet, View } from 'react-native';

import { colors, palette, radii } from '@/theme';

export type ProgressDotsProps = {
  total: number;
  /** Zero-based index of the current step. */
  current: number;
};

/** Step indicator — completed steps fill ink, the rest stay osso. */
export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={styles.wrapper}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[styles.bar, index <= current ? styles.active : styles.inactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    gap: 4,
  },
  bar: {
    flex: 1,
    height: 3,
    borderRadius: radii.none,
  },
  active: {
    backgroundColor: palette.tinta,
  },
  inactive: {
    backgroundColor: colors.rule,
  },
});
