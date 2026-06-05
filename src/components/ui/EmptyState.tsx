import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { IconTile } from './IconTile';
import { Text } from './Text';

export type EmptyStateProps = {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  message?: string;
};

/** Centered empty state — square tile + title + optional message. */
export function EmptyState({ icon = 'inbox', title, message }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <IconTile icon={icon} tone="bone" size={48} />
      <Text variant="h3" color={colors.fg} center>
        {title}
      </Text>
      {!!message && (
        <Text variant="sm" color={colors.fgMuted} center>
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
