import { useAccessibility } from '@/src/accessibility/AccessibilityProvider';
import type { ScaledTypography } from '@/src/accessibility/scaleTypography';
import type { ColorSchemeName, ThemeColors } from '@/src/theme/tokens';

export function useTheme(): {
  scheme: ColorSchemeName;
  colors: ThemeColors;
  type: ScaledTypography;
  minTouchTarget: number;
} {
  const { scheme, colors, type, minTouchTarget } = useAccessibility();
  return { scheme, colors, type, minTouchTarget };
}
