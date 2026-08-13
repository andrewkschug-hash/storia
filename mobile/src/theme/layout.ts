import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { Spacing } from '@/src/theme/tokens';

/** Phone-first breakpoints for web + tablet layouts. */
export const Breakpoints = {
  /** Compact phones and narrow web panes */
  phone: 0,
  /** Large phones / small tablets in portrait */
  tablet: 600,
  /** Tablets landscape / small desktop split */
  desktop: 900,
} as const;

export type LayoutSize = 'phone' | 'tablet' | 'desktop';

export function layoutSizeForWidth(width: number): LayoutSize {
  if (width >= Breakpoints.desktop) return 'desktop';
  if (width >= Breakpoints.tablet) return 'tablet';
  return 'phone';
}

/** Comfortable reading / form column widths by size. */
export function contentMaxWidth(size: LayoutSize): number {
  switch (size) {
    case 'desktop':
      return 720;
    case 'tablet':
      return 640;
    default:
      return 560;
  }
}

/** Horizontal page padding that scales down on narrow phones. */
export function contentPaddingHorizontal(width: number, size: LayoutSize): number {
  if (width < 360) return Spacing.md;
  if (size === 'desktop') return Spacing.xl;
  if (size === 'tablet') return Spacing.lg;
  return Spacing.lg;
}

export function useLayout() {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const size = layoutSizeForWidth(width);
    return {
      width,
      height,
      size,
      isPhone: size === 'phone',
      isTablet: size === 'tablet',
      isDesktop: size === 'desktop',
      isCompactHeight: height < 700,
      contentMaxWidth: contentMaxWidth(size),
      paddingHorizontal: contentPaddingHorizontal(width, size),
    };
  }, [width, height]);
}
