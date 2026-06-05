import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { IconTile } from './IconTile';
import { Text } from './Text';

export type DataRowProps = {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  meta?: string;
  /** Right-aligned value (rendered mono — numbers are typography). */
  value?: string;
  onPress?: () => void;
  /** Show the brand's forward chevron `›`. */
  chevron?: boolean;
};

/** Empregol list row: `icon | title + meta | value | ›`, hairline-separated. */
export function DataRow({ icon, title, meta, value, onPress, chevron }: DataRowProps) {
  const Container = onPress ? Pressable : View;
  return (
    <Container
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={styles.row}>
      {icon && <IconTile icon={icon} tone="bone" size={36} />}
      <View style={styles.body}>
        <Text variant="smMedium" color={colors.fg} numberOfLines={1}>
          {title}
        </Text>
        {!!meta && (
          <Text variant="xs" color={colors.fgMuted} numberOfLines={1}>
            {meta}
          </Text>
        )}
      </View>
      {!!value && (
        <Text variant="mono" color={colors.fg}>
          {value}
        </Text>
      )}
      {chevron && (
        <Text variant="body" color={colors.fg} style={styles.chevron}>
          ›
        </Text>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  chevron: {
    paddingRight: spacing.xs,
  },
});
