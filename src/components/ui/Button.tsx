import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fontFamily, fontSize, palette, radii, spacing } from '@/theme';

export type ButtonVariant = 'primary' | 'ink' | 'ghost' | 'ghostLight' | 'soft' | 'text';
export type ButtonSize = 'md' | 'sm';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  chevron?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANTS: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: palette.gramado, fg: palette.giz },
  ink: { bg: palette.tinta, fg: palette.giz },
  ghost: { bg: 'transparent', fg: palette.tinta, border: palette.tinta },
  ghostLight: { bg: 'transparent', fg: palette.giz, border: palette.giz },
  soft: { bg: palette.giz, fg: palette.tinta, border: palette.osso },
  text: { bg: 'transparent', fg: palette.tinta },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  chevron,
  leading,
  trailing,
  fullWidth,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const tone = VARIANTS[variant];
  const isDisabled = disabled || loading;
  const isText = variant === 'text';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        isText ? styles.textVariant : { backgroundColor: tone.bg },
        tone.border != null && { borderColor: tone.border, borderWidth: 1.5 },
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={tone.fg} size="small" />
      ) : (
        <View style={styles.content}>
          {leading}
          <Text
            style={[
              styles.label,
              size === 'sm' && styles.labelSm,
              { color: isDisabled ? colors.fgMuted : tone.fg },
            ]}>
            {label}
          </Text>
          {chevron && (
            <Text style={[styles.chevron, { color: isDisabled ? colors.fgMuted : tone.fg }]}>›</Text>
          )}
          {trailing}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    minHeight: 36,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  textVariant: {
    minHeight: 0,
    borderRadius: 0,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: 1.5,
    borderBottomColor: palette.tinta,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.textMedium,
    fontSize: fontSize.sm,
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: fontSize.xs,
  },
  chevron: {
    fontFamily: fontFamily.text,
    fontSize: fontSize.body,
    lineHeight: fontSize.body,
  },
  pressed: {
    transform: [{ translateY: 1 }],
  },
  disabled: {
    opacity: 1,
  },
});
