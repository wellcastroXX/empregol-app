import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export type DividerProps = {
  /** Editorial 1.5px ink rule instead of the osso hairline. */
  strong?: boolean;
  /** Override the rule color (e.g. ruleOnDark for the contractor env). */
  color?: string;
};

/** Hairline divider (osso); `strong` draws the 1.5px ink editorial rule. */
export function Divider({ strong, color }: DividerProps) {
  return (
    <View style={[strong ? styles.strong : styles.hairline, color != null && { backgroundColor: color }]} />
  );
}

const styles = StyleSheet.create({
  hairline: {
    height: 1,
    backgroundColor: colors.rule,
  },
  strong: {
    height: 1.5,
    backgroundColor: colors.ruleStrong,
  },
});
