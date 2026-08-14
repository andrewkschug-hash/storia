import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  type AccessibilitySettings,
  type ColorMode,
  type LineSpacing,
  type TextSize,
} from '@/src/accessibility/types';

const KEY = 'storia:accessibility';

function isColorMode(value: unknown): value is ColorMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

function isTextSize(value: unknown): value is TextSize {
  return value === 'small' || value === 'default' || value === 'large' || value === 'xlarge';
}

function isLineSpacing(value: unknown): value is LineSpacing {
  return value === 'tight' || value === 'default' || value === 'relaxed';
}

export function parseAccessibilitySettings(raw: unknown): AccessibilitySettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
  const row = raw as Record<string, unknown>;
  return {
    colorMode: isColorMode(row.colorMode) ? row.colorMode : DEFAULT_ACCESSIBILITY_SETTINGS.colorMode,
    highContrast: typeof row.highContrast === 'boolean' ? row.highContrast : false,
    textSize: isTextSize(row.textSize) ? row.textSize : 'default',
    lineSpacing: isLineSpacing(row.lineSpacing) ? row.lineSpacing : 'default',
    comfortableWidth: typeof row.comfortableWidth === 'boolean' ? row.comfortableWidth : true,
    reducedMotion: typeof row.reducedMotion === 'boolean' ? row.reducedMotion : false,
  };
}

export async function loadAccessibilitySettings(): Promise<AccessibilitySettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
    return parseAccessibilitySettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_ACCESSIBILITY_SETTINGS };
  }
}

export async function saveAccessibilitySettings(settings: AccessibilitySettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
}
