import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { palette, radii } from '@/theme';

export type IconTileProps = {
  icon: keyof typeof Feather.glyphMap;
  /** `ink` = tinta tile + chalk icon; `bone` = osso tile + ink icon. */
  tone?: 'ink' | 'bone';
  size?: number;
};

/** Square icon tile (Lucide-style stroke). Used for the few UI affordances. */
export function IconTile({ icon, tone = 'bone', size = 40 }: IconTileProps) {
  const isInk = tone === 'ink';
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: radii.sm,
          backgroundColor: isInk ? palette.tinta : palette.osso,
        },
      ]}>
      <Feather name={icon} size={size * 0.46} color={isInk ? palette.giz : palette.tinta} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
