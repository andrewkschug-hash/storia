import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type StyleProp, type TextStyle } from 'react-native';

import {
  type AppSymbolProps,
  webColor,
  webIconName,
} from '@/src/components/AppSymbol.types';

/** Material Symbols (android/web names) use underscores; MaterialIcons uses hyphens. */
function materialIconName(symbolsName: string): keyof typeof MaterialIcons.glyphMap {
  const hyphenated = symbolsName.replace(/_/g, '-');
  if (hyphenated in MaterialIcons.glyphMap) {
    return hyphenated as keyof typeof MaterialIcons.glyphMap;
  }
  if (symbolsName in MaterialIcons.glyphMap) {
    return symbolsName as keyof typeof MaterialIcons.glyphMap;
  }
  return 'help-outline';
}

/** Web icons via vector icons — avoids expo-symbols Material font path on web. */
export function AppSymbol({ name, size = 24, tintColor, fallback, style }: AppSymbolProps) {
  const icon = webIconName(name);
  if (!icon) return <>{fallback ?? null}</>;
  return (
    <MaterialIcons
      name={materialIconName(icon)}
      size={size}
      color={webColor(tintColor)}
      style={style as StyleProp<TextStyle>}
    />
  );
}
