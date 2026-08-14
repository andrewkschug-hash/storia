import { LINE_SPACING_SCALE, TEXT_SIZE_SCALE, type LineSpacing, type TextSize } from '@/src/accessibility/types';
import { Typography } from '@/src/theme/tokens';

export type ScaledTypography = {
  [K in keyof typeof Typography]: (typeof Typography)[K] & { fontSize: number; lineHeight: number };
};

export function scaleTypography(
  textSize: TextSize = 'default',
  lineSpacing: LineSpacing = 'default',
): ScaledTypography {
  const size = TEXT_SIZE_SCALE[textSize];
  const space = LINE_SPACING_SCALE[lineSpacing];
  const next = {} as ScaledTypography;
  for (const key of Object.keys(Typography) as (keyof typeof Typography)[]) {
    const style = Typography[key];
    next[key] = {
      ...style,
      fontSize: Math.round(style.fontSize * size),
      lineHeight: Math.round(style.lineHeight * size * space),
    };
  }
  return next;
}
