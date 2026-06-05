import { Platform, type ViewStyle } from 'react-native';

/**
 * Empregol Design System — shadows are minimal; the brand is editorial, not
 * glossy. Cards are bordered, not shadowed (use `none`). A single low-contrast
 * lift (`sm`) is allowed for elevated app cards; `md` for popovers/sheets.
 */
function shadow(offsetHeight: number, radius: number, opacity: number, elevation: number): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#141413',
      shadowOffset: { width: 0, height: offsetHeight },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;
}

export const shadows = {
  none: {} as ViewStyle,
  sm: shadow(1, 2, 0.12, 1), // --shadow-1: a single hairline lift
  md: shadow(4, 12, 0.12, 4), // --shadow-2: elevated cards / sheets
} as const;

export type Shadow = keyof typeof shadows;
