export const fontFamily = {
  display: 'DMSerifDisplay_400Regular',
  displayItalic: 'DMSerifDisplay_400Regular_Italic',
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  sansExtraBold: 'PlusJakartaSans_800ExtraBold',
};

export const typography = {
  fontFamily,
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
    '5xl': 48,
    '6xl': 56,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// Maps weight key → Plus Jakarta Sans font family string
export const jakartaByWeight: Record<string, string> = {
  regular: fontFamily.sans,
  medium: fontFamily.sansMedium,
  semibold: fontFamily.sansSemiBold,
  bold: fontFamily.sansBold,
};

const DISPLAY_VARIANTS = new Set(['h1', 'h2']);

export const textVariants = {
  h1: {
    fontSize: typography.fontSize['5xl'],
    lineHeight: typography.lineHeight['5xl'],
    fontWeight: '400' as const,
    fontFamily: fontFamily.displayItalic,
    letterSpacing: -1,
  },
  h2: {
    fontSize: typography.fontSize['4xl'],
    lineHeight: typography.lineHeight['4xl'],
    fontWeight: '400' as const,
    fontFamily: fontFamily.displayItalic,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    lineHeight: typography.lineHeight['2xl'],
    fontWeight: '800' as const,
    fontFamily: fontFamily.sansExtraBold,
    letterSpacing: -0.3,
  },
  h4: {
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: '700' as const,
    fontFamily: fontFamily.sansBold,
  },
  body: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    fontWeight: '400' as const,
    fontFamily: fontFamily.sans,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: '400' as const,
    fontFamily: fontFamily.sans,
  },
  caption: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: '400' as const,
    fontFamily: fontFamily.sans,
  },
  button: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    fontWeight: '600' as const,
    fontFamily: fontFamily.sansSemiBold,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: '700' as const,
    fontFamily: fontFamily.sansBold,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
};

export { DISPLAY_VARIANTS };
