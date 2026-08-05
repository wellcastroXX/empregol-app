import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, fontFamily, palette, radii, spacing } from "@/theme";
import { Logo } from "./Logo";
import { Text } from "./Text";

export type VideoThumbProps = {
  /** Card title, e.g. "Gols 2024 · Vitória". */
  title: string;
  /** Athlete profile photo used as the card background; black when absent. */
  photoUrl?: string;
  /** Jersey number painted large at the bottom-left. */
  jerseyNumber?: number;
  /** Category label shown as a green tag (e.g. "Gols" → "• GOLS"). */
  category?: string;
  /** Game/date line under the card, e.g. "Vitória 2×1 ABC · 14/10/24". */
  gameInfo?: string;
  /** Duration label bottom-right, e.g. "2:18". */
  duration?: string;
  /** Card width (carousel item). */
  width?: number;
  onPress?: () => void;
};

/**
 * Empregol media card — the vitrine video thumbnail (matches the brand layout):
 * photo background (or black), wordmark + category tag, centered play, jersey +
 * duration, with the title and game info below the frame.
 */
export function VideoThumb({
  title,
  photoUrl,
  jerseyNumber,
  category,
  gameInfo,
  duration,
  width = 300,
  onPress,
}: VideoThumbProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [{ width }, pressed && styles.pressed]}
    >
      {/* Frame */}
      <View style={[styles.frame, { height: width * 0.62 }]}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : null}
        {/* Scrims for legibility over the photo */}
        <View style={styles.scrimTop} />
        <View style={styles.scrimBottom} />

        {/* Top row: wordmark + category */}
        <View style={styles.topRow}>
          <Logo size={16} tone="creme" />
          {!!category && (
            <View style={styles.tag}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText} color={colors.accentFg}>
                {category.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Center: play button */}
        <View style={styles.playWrap} pointerEvents="none">
          <View style={styles.playCircle}>
            <View style={styles.playTriangle} />
          </View>
        </View>

        {/* Bottom row: jersey + duration */}
        <View style={styles.bottomRow}>
          {jerseyNumber != null ? (
            <Text style={styles.jersey} color={palette.giz}>
              {String(jerseyNumber).padStart(2, "0")}
            </Text>
          ) : (
            <View />
          )}
          {!!duration && (
            <View style={styles.duration}>
              <Text style={styles.durationText} color={palette.giz}>
                {duration}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Caption */}
      <Text style={styles.title} color={colors.fg} numberOfLines={1}>
        {title}
      </Text>
      {!!gameInfo && (
        <Text style={styles.gameInfo} color={colors.fgMuted} numberOfLines={1}>
          {gameInfo.toUpperCase()}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  frame: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: palette.tinta,
    overflow: "hidden",
    justifyContent: "center",
  },
  scrimTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  scrimBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  topRow: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.gramado,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: palette.giz,
  },
  tagText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 11,
    letterSpacing: 1,
  },
  playWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderTopWidth: 11,
    borderBottomWidth: 11,
    borderLeftWidth: 18,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: palette.giz,
  },
  bottomRow: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  jersey: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    lineHeight: 22,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  duration: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  durationText: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  title: {
    marginTop: spacing.md,
    fontFamily: fontFamily.display,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  gameInfo: {
    marginTop: 2,
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
