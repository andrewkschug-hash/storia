/**
 * Design tokens — calm, literary Italian reader.
 * Avoids purple-gamified, cream+terracotta, and broadsheet looks.
 */

export const palette = {
  ink: '#1A2421',
  inkSoft: '#3D4A45',
  mist: '#E8EEF0',
  mistDeep: '#D5E0E4',
  paper: '#F3F6F7',
  night: '#0F1614',
  nightElevated: '#1A2421',
  olive: '#3F6B5C',
  oliveBright: '#5A8F7B',
  amber: '#C4A574',
  amberSoft: '#D4BC94',
  coralMute: '#B87A6B',
  lineLight: 'rgba(26, 36, 33, 0.08)',
  lineDark: 'rgba(232, 238, 240, 0.12)',
  highlight: 'rgba(90, 143, 123, 0.18)',
} as const;

export const Colors = {
  light: {
    text: palette.ink,
    textSecondary: palette.inkSoft,
    textMuted: '#6B7873',
    background: palette.paper,
    backgroundElevated: '#FFFFFF',
    backgroundAtmosphereTop: '#E4EEF2',
    backgroundAtmosphereBottom: palette.paper,
    tint: palette.olive,
    tintSoft: palette.oliveBright,
    accent: palette.amber,
    tabIconDefault: '#8A9691',
    tabIconSelected: palette.olive,
    border: palette.lineLight,
    progressTrack: palette.mistDeep,
    progressFill: palette.olive,
    readerSurface: '#FAFCFC',
    sentenceHighlight: palette.highlight,
    danger: palette.coralMute,
  },
  dark: {
    text: '#E8EEEC',
    textSecondary: '#B8C4BF',
    textMuted: '#7A8A84',
    background: palette.night,
    backgroundElevated: palette.nightElevated,
    backgroundAtmosphereTop: '#15201C',
    backgroundAtmosphereBottom: palette.night,
    tint: palette.oliveBright,
    tintSoft: palette.olive,
    accent: palette.amberSoft,
    tabIconDefault: '#5A6862',
    tabIconSelected: palette.oliveBright,
    border: palette.lineDark,
    progressTrack: '#24302C',
    progressFill: palette.oliveBright,
    readerSurface: '#121A18',
    sentenceHighlight: 'rgba(90, 143, 123, 0.28)',
    danger: palette.coralMute,
  },
} as const;

export type ThemeColors = (typeof Colors)[keyof typeof Colors];
export type ColorSchemeName = keyof typeof Colors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  readerHorizontal: 22,
  readerVertical: 20,
} as const;

export const Radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const Typography = {
  brand: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0.2,
  },
  chapterEyebrow: {
    fontFamily: 'Literata_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
  },
  chapterTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
  },
  body: {
    fontFamily: 'Literata_400Regular',
    fontSize: 16,
    lineHeight: 26,
  },
  reader: {
    fontFamily: 'Literata_400Regular',
    fontSize: 22,
    lineHeight: 40,
  },
  readerDialogue: {
    fontFamily: 'Literata_400Regular_Italic',
    fontSize: 22,
    lineHeight: 40,
  },
  label: {
    fontFamily: 'Literata_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'Literata_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
  },
  stat: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    lineHeight: 32,
  },
} as const;
