import { MD3LightTheme } from 'react-native-paper';

// "Playful Tactile" design tokens — pulled from the ClumssyCat Stitch design
// (Cute yet Competent: warm coral + lilac + butter yellow on a cream canvas).

export const COLORS = {
  primary: '#FF6B4A', // coral / tangerine
  primaryShadow: '#E04E2C', // tactile bottom-shadow for coral buttons
  primaryTint: '#FFF0EB', // 5% coral tint, inactive pills/badges
  primarySoft: '#FFDAD2',

  secondary: '#8E7CFF', // soft lilac / electric lavender
  secondarySoft: '#F3F0FF',
  secondaryBorder: '#D8D0FC',
  secondaryText: '#6E57E8',

  tertiary: '#FCD34D', // sunny butter yellow
  tertiarySoft: '#FEF3C7',
  tertiaryText: '#B45309',

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

// Tactile "pressed 4px down" shadow used on primary pill buttons.
export const tactileShadow = (shadowColor = COLORS.primaryShadow) => ({
  shadowColor,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
});

export const softShadow = {
  shadowColor: '#26262B',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 2,
};

export const paperTheme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    onPrimary: COLORS.white,
    primaryContainer: COLORS.primarySoft,
    onPrimaryContainer: '#661000',
    secondary: COLORS.secondary,
    onSecondary: COLORS.white,
    secondaryContainer: '#E5DEFF',
    onSecondaryContainer: '#190064',
    tertiary: '#B45309',
    onTertiary: COLORS.white,
    tertiaryContainer: COLORS.tertiary,
    onTertiaryContainer: '#4E3E00',
    background: COLORS.background,
    onBackground: COLORS.textPrimary,
    surface: COLORS.surface,
    onSurface: COLORS.textPrimary,
    surfaceVariant: COLORS.surfaceSunken,
    onSurfaceVariant: COLORS.textSecondary,
    outline: COLORS.border,
    outlineVariant: COLORS.border,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    default: { ...MD3LightTheme.fonts.default, fontFamily: FONTS.regular },
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: FONTS.regular },
    bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: FONTS.regular },
    bodySmall: { ...MD3LightTheme.fonts.bodySmall, fontFamily: FONTS.regular },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: FONTS.semiBold },
    labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: FONTS.semiBold },
    labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontFamily: FONTS.bold },
    headlineLarge: { ...MD3LightTheme.fonts.headlineLarge, fontFamily: FONTS.extraBold },
    headlineMedium: { ...MD3LightTheme.fonts.headlineMedium, fontFamily: FONTS.bold },
    headlineSmall: { ...MD3LightTheme.fonts.headlineSmall, fontFamily: FONTS.bold },
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: FONTS.bold },
    titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontFamily: FONTS.semiBold },
    titleSmall: { ...MD3LightTheme.fonts.titleSmall, fontFamily: FONTS.semiBold },
  },
};
