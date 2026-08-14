import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { useAccessibility } from '@/src/accessibility/AccessibilityProvider';
import {
  contentMaxWidth,
  contentPaddingHorizontal,
  layoutSizeForWidth,
} from '@/src/theme/layout';

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const { settings } = useAccessibility();
  return useMemo(() => {
    const size = layoutSizeForWidth(width);
    const baseMax = contentMaxWidth(size);
    return {
      width,
      height,
      size,
      isPhone: size === 'phone',
      isTablet: size === 'tablet',
      isDesktop: size === 'desktop',
      isCompactHeight: height < 700,
      contentMaxWidth: settings.comfortableWidth ? Math.min(baseMax, 560) : baseMax,
      paddingHorizontal: contentPaddingHorizontal(width, size),
    };
  }, [width, height, settings.comfortableWidth]);
}
