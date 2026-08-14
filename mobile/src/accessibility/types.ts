export type ColorMode = 'system' | 'light' | 'dark';
export type TextSize = 'small' | 'default' | 'large' | 'xlarge';
export type LineSpacing = 'tight' | 'default' | 'relaxed';

export type AccessibilitySettings = {
  colorMode: ColorMode;
  highContrast: boolean;
  textSize: TextSize;
  lineSpacing: LineSpacing;
  comfortableWidth: boolean;
  reducedMotion: boolean;
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  colorMode: 'system',
  highContrast: false,
  textSize: 'default',
  lineSpacing: 'default',
  comfortableWidth: true,
  reducedMotion: false,
};

export const TEXT_SIZE_SCALE: Record<TextSize, number> = {
  small: 0.9,
  default: 1,
  large: 1.15,
  xlarge: 1.32,
};

export const LINE_SPACING_SCALE: Record<LineSpacing, number> = {
  tight: 0.92,
  default: 1,
  relaxed: 1.18,
};

export function minTouchTarget(textSize: TextSize): number {
  if (textSize === 'xlarge') return 52;
  if (textSize === 'large') return 48;
  return 44;
}
