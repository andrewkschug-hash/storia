import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  loadAccessibilitySettings,
  saveAccessibilitySettings,
} from '@/src/accessibility/storage';
import { scaleTypography, type ScaledTypography } from '@/src/accessibility/scaleTypography';
import {
  DEFAULT_ACCESSIBILITY_SETTINGS,
  minTouchTarget,
  type AccessibilitySettings,
} from '@/src/accessibility/types';
import { Colors, HighContrastColors, type ColorSchemeName, type ThemeColors } from '@/src/theme/tokens';
import { useSystemColorScheme } from '@/src/theme/useSystemColorScheme';

type AccessibilityContextValue = {
  ready: boolean;
  settings: AccessibilitySettings;
  scheme: ColorSchemeName;
  colors: ThemeColors;
  type: ScaledTypography;
  minTouchTarget: number;
  updateSettings: (patch: Partial<AccessibilitySettings>) => Promise<void>;
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function resolveScheme(colorMode: AccessibilitySettings['colorMode'], system: ColorSchemeName): ColorSchemeName {
  if (colorMode === 'light' || colorMode === 'dark') return colorMode;
  return system;
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const system = useSystemColorScheme();
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadAccessibilitySettings().then((next) => {
      setSettings(next);
      setReady(true);
    });
  }, []);

  const updateSettings = useCallback(async (patch: Partial<AccessibilitySettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await saveAccessibilitySettings(next);
  }, [settings]);

  const value = useMemo<AccessibilityContextValue>(() => {
    const scheme = resolveScheme(settings.colorMode, system);
    const palette = settings.highContrast ? HighContrastColors[scheme] : Colors[scheme];
    return {
      ready,
      settings,
      scheme,
      colors: palette,
      type: scaleTypography(settings.textSize, settings.lineSpacing),
      minTouchTarget: minTouchTarget(settings.textSize),
      updateSettings,
    };
  }, [ready, settings, system, updateSettings]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

const FALLBACK: AccessibilityContextValue = {
  ready: true,
  settings: DEFAULT_ACCESSIBILITY_SETTINGS,
  scheme: 'dark',
  colors: Colors.dark,
  type: scaleTypography('default', 'default'),
  minTouchTarget: 44,
  updateSettings: async () => undefined,
};

export function useAccessibility(): AccessibilityContextValue {
  return useContext(AccessibilityContext) ?? FALLBACK;
}
