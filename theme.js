import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// "Playful Tactile" design tokens — pulled from the ClumssyCat Stitch design
// (Cute yet Competent: warm coral + lilac + butter yellow), with a dark
// variant for the Profile > Dark Theme toggle. Same key set in both so
// every screen can just read `colors.xxx` without caring which mode is on.

const LIGHT_COLORS = {
  primary: '#FF6B4A', // coral / tangerine
  primaryShadow: '#E04E2C', // tactile bottom-shadow for coral buttons
  primaryTint: '#FFF0EB', // 5% coral tint, inactive pills/badges
  primarySoft: '#FFDAD2',

  secondary: '#8E7CFF', // soft lilac / electric lavender
  secondarySoft: '#F3F0FF',
  secondaryBorder: '#D8D0FC',
  secondaryText: '#6E57E8',
  secondaryContainer: '#E5DEFF',
  onSecondaryContainer: '#442cb1',

  tertiary: '#FCD34D', // sunny butter yellow
  tertiarySoft: '#FEF3C7',
  tertiaryText: '#B45309',
  onTertiaryContainer: '#4E3E00',

  success: '#10B981',

  background: '#FAF7F2', // warm ivory cream canvas
  surface: '#FFFFFF',
  surfaceSunken: '#F5F2EC',

  textPrimary: '#26262B', // warm charcoal, not pure black
  textSecondary: '#4B4B52',
  textMuted: '#8E8E98',

  border: '#E8E4DC',
  white: '#FFFFFF',
};

const DARK_COLORS = {
  primary: '#FF7A5C',
  primaryShadow: '#B23F22',
  primaryTint: '#3A241E',
  primarySoft: '#5A2C1E',

  secondary: '#A79BFF',
  secondarySoft: '#2C2750',
  secondaryBorder: '#4B4380',
  secondaryText: '#C9C2FF',
  secondaryContainer: '#332B5C',
  onSecondaryContainer: '#D9D2FF',

  tertiary: '#FCD34D',
  tertiarySoft: '#4A3B12',
  tertiaryText: '#FCD34D',
  onTertiaryContainer: '#4E3E00',

  success: '#34D399',

  background: '#1C1B1F', // warm dark charcoal canvas, not pure black
  surface: '#242229',
  surfaceSunken: '#2C2A31',

  textPrimary: '#F5F2EC',
  textSecondary: '#C7C4CC',
  textMuted: '#9A98A3',

  border: '#37343C',
  white: '#FFFFFF',
};

// Kept for anything that hasn't been switched over to the theme context —
// this is always the light palette. Prefer `useAppTheme().colors` in
// screens so they actually respond to the dark-mode toggle.
export const COLORS = LIGHT_COLORS;

export function getColors(mode) {
  return mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

export const RADIUS = {
  pill: 9999,
  card: 24,
  input: 16,
  chip: 14,
};

export const FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

// Tactile "pressed 4px down" shadow used on primary pill buttons. Pass the
// current theme's `colors.primaryShadow`.
export const tactileShadow = (shadowColor) => ({
  shadowColor,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
});

export function getPaperTheme(mode) {
  const colors = getColors(mode);
  const base = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    roundness: 3,
    colors: {
      ...base.colors,
      primary: colors.primary,
      onPrimary: colors.white,
      primaryContainer: colors.primarySoft,
      onPrimaryContainer: mode === 'dark' ? colors.textPrimary : '#661000',
      secondary: colors.secondary,
      onSecondary: colors.white,
      secondaryContainer: colors.secondaryContainer,
      onSecondaryContainer: colors.onSecondaryContainer,
      tertiary: colors.tertiaryText,
      onTertiary: colors.white,
      tertiaryContainer: colors.tertiary,
      onTertiaryContainer: colors.onTertiaryContainer,
      background: colors.background,
      onBackground: colors.textPrimary,
      surface: colors.surface,
      onSurface: colors.textPrimary,
      surfaceVariant: colors.surfaceSunken,
      onSurfaceVariant: colors.textSecondary,
      outline: colors.border,
      outlineVariant: colors.border,
    },
    fonts: {
      ...base.fonts,
      default: { ...base.fonts.default, fontFamily: FONTS.regular },
      bodyLarge: { ...base.fonts.bodyLarge, fontFamily: FONTS.regular },
      bodyMedium: { ...base.fonts.bodyMedium, fontFamily: FONTS.regular },
      bodySmall: { ...base.fonts.bodySmall, fontFamily: FONTS.regular },
      labelLarge: { ...base.fonts.labelLarge, fontFamily: FONTS.semiBold },
      labelMedium: { ...base.fonts.labelMedium, fontFamily: FONTS.semiBold },
      labelSmall: { ...base.fonts.labelSmall, fontFamily: FONTS.bold },
      headlineLarge: { ...base.fonts.headlineLarge, fontFamily: FONTS.extraBold },
      headlineMedium: { ...base.fonts.headlineMedium, fontFamily: FONTS.bold },
      headlineSmall: { ...base.fonts.headlineSmall, fontFamily: FONTS.bold },
      titleLarge: { ...base.fonts.titleLarge, fontFamily: FONTS.bold },
      titleMedium: { ...base.fonts.titleMedium, fontFamily: FONTS.semiBold },
      titleSmall: { ...base.fonts.titleSmall, fontFamily: FONTS.semiBold },
    },
  };
}

// Kept for anything that hasn't been switched over yet — always the light
// paper theme.
export const paperTheme = getPaperTheme('light');
