import { describe, expect, it } from 'vitest';

import type { ColorSchemeName } from '@/src/theme/tokens';

function resolveScheme(
  colorMode: 'system' | 'light' | 'dark',
  system: ColorSchemeName,
): ColorSchemeName {
  if (colorMode === 'light' || colorMode === 'dark') return colorMode;
  return system;
}

describe('color scheme resolution', () => {
  it('forces light or dark when explicitly chosen', () => {
    expect(resolveScheme('light', 'dark')).toBe('light');
    expect(resolveScheme('dark', 'light')).toBe('dark');
  });

  it('follows the device for system mode', () => {
    expect(resolveScheme('system', 'light')).toBe('light');
    expect(resolveScheme('system', 'dark')).toBe('dark');
  });
});
