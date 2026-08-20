import {
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Literata_400Regular,
  Literata_400Regular_Italic,
  Literata_500Medium,
  Literata_600SemiBold,
} from '@expo-google-fonts/literata';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { getAccount } from '@/src/account/storage';
import { AccessibilityProvider, useAccessibility } from '@/src/accessibility/AccessibilityProvider';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    CormorantGaramond_600SemiBold,
    Literata_400Regular,
    Literata_400Regular_Italic,
    Literata_500Medium,
    Literata_600SemiBold,
  });
  const [accountReady, setAccountReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded) return;
    void getAccount().finally(() => {
      setAccountReady(true);
      void SplashScreen.hideAsync();
    });
  }, [loaded]);

  if (!loaded || !accountReady) {
    return null;
  }

  return (
    <AccessibilityProvider>
      <RootLayoutNav />
    </AccessibilityProvider>
  );
}

function RootLayoutNav() {
  const { scheme, colors } = useAccessibility();
  const palette = colors;

  const navigationTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: palette.tint,
      background: palette.background,
      card: palette.backgroundElevated,
      text: palette.text,
      border: palette.border,
      notification: palette.accent,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="privacy"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="terms"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="walkthrough"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="account"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="level-readiness"
          options={{
            title: 'Next stories',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="reader/[chapterId]"
          options={{
            title: 'Reading',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="recap/[chapterId]"
          options={{
            title: 'Recap',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="comprehension/[chapterId]"
          options={{
            title: 'Understanding',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="grammar-note"
          options={{
            title: 'A little grammar',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="batch-recap"
          options={{
            title: 'Word recap',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="speak-scene"
          options={{
            title: 'Speak the scene',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="review"
          options={{
            title: 'A little review',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="practice"
          options={{
            title: 'Practice',
            headerBackTitle: 'Italian',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="vocab/[kind]/[id]"
          options={{
            title: 'Word',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        {typeof __DEV__ !== 'undefined' && __DEV__ ? (
          <Stack.Screen
            name="adaptive-debug"
            options={{
              title: 'Adaptive debug',
              headerBackTitle: 'Back',
              headerShadowVisible: false,
            }}
          />
        ) : null}
        {typeof __DEV__ !== 'undefined' && __DEV__ ? (
          <Stack.Screen
            name="voice-lab"
            options={{
              title: 'Voice Lab',
              headerBackTitle: 'Back',
              headerShadowVisible: false,
            }}
          />
        ) : null}
        {typeof __DEV__ !== 'undefined' && __DEV__ ? (
          <Stack.Screen
            name="audio-studio"
            options={{
              title: 'Audio studio',
              headerBackTitle: 'Back',
              headerShadowVisible: false,
            }}
          />
        ) : null}
        {typeof __DEV__ !== 'undefined' && __DEV__ ? (
          <Stack.Screen
            name="cefr-audit"
            options={{
              title: 'CEFR audit',
              headerBackTitle: 'Back',
              headerShadowVisible: false,
            }}
          />
        ) : null}
      </Stack>
    </ThemeProvider>
  );
}
