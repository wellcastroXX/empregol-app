import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, palette, spacing } from '@/theme';
import { IconTile } from './IconTile';
import { Text } from './Text';

export type EmptyStateProps = {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  message?: string;
  /** Dark canvas (contractor environment). */
  dark?: boolean;
};

/** Centered empty state — square tile + title + optional message. */
export function EmptyState({ icon = 'inbox', title, message, dark }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <IconTile icon={icon} tone="bone" size={48} />
      <Text variant="h3" color={dark ? palette.giz : colors.fg} center>
        {title}
      </Text>
      {!!message && (
        <Text variant="sm" color={dark ? palette.cinzaOnDark : colors.fgMuted} center>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
  },
});
