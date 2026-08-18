import { describe, expect, it } from 'vitest';

import { parseAccessibilitySettings } from '@/src/accessibility/storage';
import { scaleTypography } from '@/src/accessibility/scaleTypography';
import { DEFAULT_ACCESSIBILITY_SETTINGS } from '@/src/accessibility/types';
import { Typography } from '@/src/theme/tokens';

describe('accessibility settings', () => {
  it('falls back to defaults for junk input', () => {
    expect(parseAccessibilitySettings(null)).toEqual(DEFAULT_ACCESSIBILITY_SETTINGS);
    expect(parseAccessibilitySettings({ colorMode: 'neon', textSize: 'huge' }).colorMode).toBe('dark');
    expect(parseAccessibilitySettings({ colorMode: 'dark', highContrast: true }).highContrast).toBe(true);
  });

  it('scales reader type without clipping line height below font size', () => {
    const large = scaleTypography('xlarge', 'relaxed');
    expect(large.reader.fontSize).toBeGreaterThan(Typography.reader.fontSize);
    expect(large.reader.lineHeight).toBeGreaterThan(large.reader.fontSize);
    const small = scaleTypography('small', 'tight');
    expect(small.body.fontSize).toBeLessThan(Typography.body.fontSize);
  });
});
