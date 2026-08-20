import type { ReactNode } from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

export type AppSymbolName =
  | string
  | {
      ios?: string;
      android?: string;
      web?: string;
    };

export type AppSymbolProps = {
  name: AppSymbolName;
  size?: number;
  tintColor?: ColorValue;
  fallback?: ReactNode;
  style?: StyleProp<ViewStyle>;
  weight?: 'regular' | 'unspecified' | 'ultraLight' | 'thin' | 'light' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
};

export function webIconName(name: AppSymbolName): string | null {
  if (typeof name === 'string') return null;
  return name.web ?? name.android ?? null;
}

export function webColor(tintColor: ColorValue | undefined): string | undefined {
  return typeof tintColor === 'string' ? tintColor : undefined;
}
