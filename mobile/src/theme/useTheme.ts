import { Colors, type ColorSchemeName, type ThemeColors } from './tokens';
import { useColorScheme } from '@/components/useColorScheme';

export function useTheme(): { scheme: ColorSchemeName; colors: ThemeColors } {
  const scheme = (useColorScheme() ?? 'light') as ColorSchemeName;
  return { scheme, colors: Colors[scheme] };
}
