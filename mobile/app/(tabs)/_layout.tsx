import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/src/theme/tokens';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontFamily: 'CormorantGaramond_600SemiBold',
          fontSize: 22,
          color: colors.text,
        },
        headerShadowVisible: false,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'book.fill',
                android: 'menu_book',
                web: 'menu_book',
              }}
              tintColor={color}
              size={26}
              weight={Platform.OS === 'ios' ? 'regular' : undefined}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'text.book.closed.fill',
                android: 'auto_stories',
                web: 'auto_stories',
              }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: 'Words',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'textformat.abc',
                android: 'translate',
                web: 'translate',
              }}
              tintColor={color}
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}
