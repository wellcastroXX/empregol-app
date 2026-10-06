import { FontAwesome } from "@expo/vector-icons";
import {
    Pressable,
    StyleSheet,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { colors, palette } from "@/theme";

export type FavoriteButtonProps = {
  favorited: boolean;
  disabled?: boolean;
  size?: number;
  inactiveColor?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
};

export function FavoriteButton({
  favorited,
  disabled = false,
  size = 20,
  inactiveColor = colors.fgMuted,
  accessibilityLabel,
  style,
  onPress,
}: FavoriteButtonProps) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ??
        (favorited ? "Remover dos favoritos" : "Favoritar")
      }
      accessibilityState={{ disabled }}
      style={[styles.button, style]}
    >
      <FontAwesome
        name={favorited ? "star" : "star-o"}
        size={size}
        color={favorited ? palette.empregado : inactiveColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
