import { describe, expect, it } from 'vitest';

import {
  Breakpoints,
  contentMaxWidth,
  contentPaddingHorizontal,
  layoutSizeForWidth,
} from '@/src/theme/layout';
import { Spacing } from '@/src/theme/tokens';

describe('responsive layout helpers', () => {
  it('classifies phone, tablet, and desktop widths', () => {
    expect(layoutSizeForWidth(375)).toBe('phone');
    expect(layoutSizeForWidth(Breakpoints.tablet)).toBe('tablet');
    expect(layoutSizeForWidth(768)).toBe('tablet');
    expect(layoutSizeForWidth(Breakpoints.desktop)).toBe('desktop');
    expect(layoutSizeForWidth(1200)).toBe('desktop');
  });

  it('returns comfortable content max widths', () => {
    expect(contentMaxWidth('phone')).toBe(560);
    expect(contentMaxWidth('tablet')).toBe(640);
    expect(contentMaxWidth('desktop')).toBe(720);
  });

  it('tightens horizontal padding on very narrow phones', () => {
    expect(contentPaddingHorizontal(320, 'phone')).toBe(Spacing.md);
    expect(contentPaddingHorizontal(390, 'phone')).toBe(Spacing.lg);
    expect(contentPaddingHorizontal(768, 'tablet')).toBe(Spacing.lg);
    expect(contentPaddingHorizontal(1024, 'desktop')).toBe(Spacing.xl);
  });
});
