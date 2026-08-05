import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colors, fontFamily, palette, radii } from '@/theme';
import { initials as toInitials } from '@/utils';
import { Text } from './Text';

export type AvatarProps = {
  name: string;
  uri?: string;
  size?: number;
  /** `ink` = monogram tile (clubs/agents/users); `bone` = creme placeholder. */
  tone?: 'ink' | 'bone';
};

/**
 * Square monogram tile (the brand uses squares, never circles, never gradients).
 * Ink tile + chalk initials, like the "FL" scout badge.
 */
export function Avatar({ name, uri, size = 48, tone = 'ink' }: AvatarProps) {
  const box = { width: size, height: size, borderRadius: radii.sm };

  if (uri) {
    return <Image source={{ uri }} style={[box, styles.image]} contentFit="cover" />;
  }

  const isInk = tone === 'ink';
  return (
    <View
      style={[
        box,
        styles.tile,
        { backgroundColor: isInk ? palette.tinta : palette.osso },
      ]}>
      <Text
        style={[styles.initials, { fontSize: size * 0.42, lineHeight: size * 0.5 }]}
        color={isInk ? palette.giz : palette.tinta}>
        {toInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: colors.bgSunken,
  },
  initials: {
    fontFamily: fontFamily.displayBold,
    textAlign: 'center',
  },
});
