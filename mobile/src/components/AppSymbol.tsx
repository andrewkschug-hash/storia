import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import type { AppSymbolProps } from '@/src/components/AppSymbol.types';

/** Native icons via SF Symbols (iOS) and Material Symbols (Android). */
export function AppSymbol({ name, size = 24, tintColor, fallback, style, weight }: AppSymbolProps) {
  return (
    <SymbolView
      name={name as SymbolViewProps['name']}
      size={size}
      tintColor={tintColor}
      fallback={fallback}
      style={style}
      weight={weight}
    />
  );
}
