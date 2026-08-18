import { useEffect, useState } from 'react';
import { Platform, useColorScheme as useRNColorScheme } from 'react-native';

import type { ColorSchemeName } from '@/src/theme/tokens';

function readWebScheme(): ColorSchemeName {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** OS appearance — independent of the app's forced light/dark preference. */
export function useSystemColorScheme(): ColorSchemeName {
  const rnScheme = useRNColorScheme();
  const [webScheme, setWebScheme] = useState<ColorSchemeName>(() =>
    Platform.OS === 'web' ? readWebScheme() : rnScheme === 'dark' ? 'dark' : 'light',
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => setWebScheme(media.matches ? 'dark' : 'light');
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  if (Platform.OS === 'web') return webScheme;
  return rnScheme === 'dark' ? 'dark' : 'light';
}
