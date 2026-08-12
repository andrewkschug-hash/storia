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
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/src/theme/tokens';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
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

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const navigationTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
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
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack>
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
          name="review"
          options={{
            title: 'A little review',
            headerBackTitle: 'Back',
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
        <Stack.Screen
          name="adaptive-debug"
          options={{
            title: 'Adaptive debug',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="voice-lab"
          options={{
            title: 'Voice Lab',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="audio-studio"
          options={{
            title: 'Audio studio',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="cefr-audit"
          options={{
            title: 'CEFR audit',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
