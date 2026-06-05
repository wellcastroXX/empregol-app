import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export type DividerProps = {
  /** Editorial 1.5px ink rule instead of the osso hairline. */
  strong?: boolean;
};

/** Hairline divider (osso); `strong` draws the 1.5px ink editorial rule. */
export function Divider({ strong }: DividerProps) {
  return <View style={strong ? styles.strong : styles.hairline} />;
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
