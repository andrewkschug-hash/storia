import type { TextStyle } from 'react-native';

import { LINE_SPACING_SCALE, TEXT_SIZE_SCALE, type LineSpacing, type TextSize } from '@/src/accessibility/types';
import { Typography } from '@/src/theme/tokens';

type TypographyKey = keyof typeof Typography;

/** Typography tokens scaled for accessibility settings — values are valid TextStyle objects. */
export type ScaledTypography = Record<TypographyKey, TextStyle>;

export function scaleTypography(
  textSize: TextSize = 'default',
  lineSpacing: LineSpacing = 'default',
): ScaledTypography {
  const size = TEXT_SIZE_SCALE[textSize];
  const space = LINE_SPACING_SCALE[lineSpacing];
  const scaled = {} as ScaledTypography;
  for (const key of Object.keys(Typography) as TypographyKey[]) {
    const style = Typography[key];
    scaled[key] = {
      ...style,
      fontSize: Math.round(style.fontSize * size),
      lineHeight: Math.round(style.lineHeight * size * space),
    };
  }
  return scaled;
}
