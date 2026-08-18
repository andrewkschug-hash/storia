/**
 * Design tokens — calm, literary Italian reader.
 * Avoids purple-gamified, cream+terracotta, and broadsheet looks.
 */

export const palette = {
  ink: '#1A2421',
  inkSoft: '#3D4A45',
  mist: '#E8EEF0',
  mistDeep: '#D5E0E4',
  paper: '#EEF2F1',
  paperElevated: '#F8FAFA',
  night: '#0A100E',
  nightElevated: '#141C19',
  nightSurface: '#1A2421',
  sage: '#78B6A3',
  sageBright: '#8FCEBA',
  sageDeep: '#4A8B73',
  olive: '#3F6B5C',
  oliveBright: '#5A8F7B',
  amber: '#D4B07A',
  amberSoft: '#E0C090',
  coralMute: '#C48678',
  lineLight: 'rgba(26, 36, 33, 0.1)',
  lineDark: 'rgba(120, 182, 163, 0.16)',
  highlight: 'rgba(120, 182, 163, 0.2)',
} as const;

export const Colors = {
  light: {
    text: palette.ink,
    textSecondary: palette.inkSoft,
    textMuted: '#6B7873',
    background: '#F7FAF9',
    backgroundElevated: '#FFFFFF',
    backgroundAtmosphereTop: '#EEF4F2',
    backgroundAtmosphereBottom: '#F7FAF9',
    tint: palette.sageDeep,
    tintSoft: palette.oliveBright,
    accent: palette.amber,
    tabIconDefault: '#8A9691',
    tabIconSelected: palette.sageDeep,
    border: palette.lineLight,
    progressTrack: palette.mistDeep,
    progressFill: palette.sageDeep,
    readerSurface: '#FAFCFC',
    sentenceHighlight: palette.highlight,
    danger: palette.coralMute,
    onTint: '#F7FAF9',
  },
  dark: {
    text: '#E8EEEC',
    textSecondary: '#A8B5AF',
    textMuted: '#6E7E78',
    background: palette.night,
    backgroundElevated: palette.nightElevated,
    backgroundAtmosphereTop: '#0E1613',
    backgroundAtmosphereBottom: palette.night,
    tint: palette.sage,
    tintSoft: palette.sageBright,
    accent: palette.amberSoft,
    tabIconDefault: '#5A6862',
    tabIconSelected: palette.sage,
    border: palette.lineDark,
    progressTrack: '#24302C',
    progressFill: palette.sage,
    readerSurface: palette.nightSurface,
    sentenceHighlight: 'rgba(120, 182, 163, 0.28)',
    danger: palette.coralMute,
    onTint: '#0A100E',
  },
} as const;

/** WCAG-oriented palettes; used only when high-contrast is on. */
export const HighContrastColors = {
  light: {
    text: '#000000',
    textSecondary: '#1A1A1A',
    textMuted: '#2E2E2E',
    background: '#FFFFFF',
    backgroundElevated: '#FFFFFF',
    backgroundAtmosphereTop: '#FFFFFF',
    backgroundAtmosphereBottom: '#FFFFFF',
    tint: '#0A5C3C',
    tintSoft: '#0A5C3C',
    accent: '#7A4E00',
    tabIconDefault: '#333333',
    tabIconSelected: '#0A5C3C',
    border: '#000000',
    progressTrack: '#D0D0D0',
    progressFill: '#0A5C3C',
    readerSurface: '#FFFFFF',
    sentenceHighlight: '#C8F0DC',
    danger: '#9B1C1C',
    onTint: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#F2F2F2',
    textMuted: '#E0E0E0',
    background: '#000000',
    backgroundElevated: '#000000',
    backgroundAtmosphereTop: '#000000',
    backgroundAtmosphereBottom: '#000000',
    tint: '#5EE0A8',
    tintSoft: '#5EE0A8',
    accent: '#F5C16C',
    tabIconDefault: '#CCCCCC',
    tabIconSelected: '#5EE0A8',
    border: '#FFFFFF',
    progressTrack: '#333333',
    progressFill: '#5EE0A8',
    readerSurface: '#000000',
    sentenceHighlight: '#0A4A32',
    danger: '#FF8A8A',
    onTint: '#000000',
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

export const MinTouchTarget = 44;
