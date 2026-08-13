import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import {
  contentMaxWidth,
  contentPaddingHorizontal,
  layoutSizeForWidth,
} from '@/src/theme/layout';

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
