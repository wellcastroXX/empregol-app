import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { Option } from '@/constants/positions';
import { colors, palette, radii, shadows, spacing } from '@/theme';
import { Text } from './Text';

export type SelectFieldProps<T extends string> = {
  label: string;
  options: Option<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
};

/** Empregol select: a tappable field that opens a bottom-sheet option list. */
export function SelectField<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione',
  error,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrapper}>
      <Text variant="eyebrow" color={colors.fgMuted}>
        {label}
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[styles.field, !!error && styles.fieldError]}>
        <Text variant="body" color={selected ? colors.fg : colors.fgMuted} style={styles.value}>
          {selected?.label ?? placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.fgMuted} />
      </Pressable>

      {!!error && (
        <Text variant="xs" color={colors.statusEmpregado}>
          {error}
        </Text>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text variant="eyebrow" color={colors.fgMuted} style={styles.sheetTitle}>
              {label}
            </Text>
            <ScrollView bounces={false}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    style={styles.option}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}>
                    <Text variant={isSelected ? 'bodyMedium' : 'body'} color={colors.fg}>
                      {option.label}
                    </Text>
                    {isSelected && <Feather name="check" size={18} color={palette.gramado} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.sm,
    backgroundColor: palette.giz,
  },
  fieldError: {
    borderColor: colors.statusEmpregado,
  },
  value: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: palette.tinta64,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopWidth: 1.5,
    borderTopColor: colors.ruleStrong,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
    maxHeight: '70%',
    ...shadows.md,
  },
  sheetTitle: {
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
});
