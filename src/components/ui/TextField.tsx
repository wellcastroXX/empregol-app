import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fontFamily, fontSize, palette, radii, spacing } from '@/theme';
import { Text } from './Text';

export type TextFieldProps = TextInputProps & {
  /** Mono spaced-caps label (brand convention). */
  label?: string;
  /** Marks the label with a red asterisk. */
  required?: boolean;
  error?: string;
  /** Small helper shown at the top-right of the label row. */
  hint?: string;
  /** Mono trailing unit shown inside the field (e.g. "BR", "M", "KG", "BRL"). */
  suffix?: string;
  /** Render the input value in the mono typeface (numbers, IDs). */
  mono?: boolean;
  /** Renders a mono VER/OCULTAR toggle for password fields. */
  secure?: boolean;
};

/** Empregol input: giz surface, osso border, focus → tinta border. Mono label. */
export function TextField({
  label,
  required,
  error,
  hint,
  suffix,
  mono,
  secure,
  style,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.wrapper}>
      {!!label && (
        <View style={styles.labelRow}>
          <Text variant="eyebrow" color={colors.fg} numberOfLines={1} style={styles.label}>
            {label}
            {required && (
              <Text variant="eyebrow" color={colors.statusEmpregado}>
                {' '}
                *
              </Text>
            )}
          </Text>
          {!!hint && (
            <Text variant="xs" color={colors.fgMuted}>
              {hint}
            </Text>
          )}
        </View>
      )}

      <View style={[styles.field, focused && styles.fieldFocused, !!error && styles.fieldError]}>
        <TextInput
          style={[styles.input, mono && styles.inputMono, style]}
          placeholderTextColor={colors.fgMuted}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {secure && (
          <Pressable
            hitSlop={8}
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}>
            <Text variant="monoLabel" color={colors.fgMuted}>
              {hidden ? 'Ver' : 'Ocultar'}
            </Text>
          </Pressable>
        )}
        {!secure && !!suffix && (
          <Text variant="monoLabel" color={colors.fgMuted}>
            {suffix}
          </Text>
        )}
      </View>

      {!!error && (
        <Text variant="xs" color={colors.statusEmpregado}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    flexShrink: 1,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.sm,
    backgroundColor: palette.giz,
  },
  fieldFocused: {
    borderColor: colors.ruleStrong,
  },
  fieldError: {
    borderColor: colors.statusEmpregado,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.text,
    fontSize: fontSize.body,
    color: colors.fg,
    paddingVertical: spacing.md,
  },
  inputMono: {
    fontFamily: fontFamily.monoMedium,
  },
});
