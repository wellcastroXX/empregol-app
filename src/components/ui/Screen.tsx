import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

export type ScreenProps = ScrollViewProps & {
  /** Wrap content in a ScrollView (default) or a static View. */
  scroll?: boolean;
  /** Horizontal+vertical content padding (default 16). */
  padded?: boolean;
  edges?: Edge[];
};

/**
 * App screen shell: gray-100 background + safe-area inset + optional scroll.
 * Keeps route files thin — screens render their content inside this.
 */
export function Screen({
  scroll = true,
  padded = true,
  edges = ['top', 'left', 'right'],
  children,
  contentContainerStyle,
  style,
  ...rest
}: ScreenProps) {
  const content = padded ? styles.padded : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...rest}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, content, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: '5%',
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
});
