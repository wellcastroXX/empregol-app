import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Button, GoogleLogo, Text } from '@/components/ui';
import { colors, palette, spacing } from '@/theme';

export type SocialAuthButtonsProps = {
  /** Disable both buttons (e.g. until a profile type is chosen). */
  disabled?: boolean;
  onApple?: () => void;
  onGoogle?: () => void;
};

/** "OU" divider + Apple/Google auth buttons, shared by Login and Cadastro. */
export function SocialAuthButtons({ disabled, onApple, onGoogle }: SocialAuthButtonsProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.divider}>
        <View style={styles.rule} />
        <Text variant="eyebrow" color={colors.fgMuted}>
          O U
        </Text>
        <View style={styles.rule} />
      </View>

      <Button
        label="Entrar com Apple"
        variant="ink"
        fullWidth
        disabled={disabled}
        leading={<FontAwesome name="apple" size={18} color={palette.giz} />}
        onPress={onApple}
      />
      <Button
        label="Continuar com Google"
        variant="soft"
        fullWidth
        disabled={disabled}
        leading={<GoogleLogo size={18} />}
        onPress={onGoogle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.rule,
  },
});
