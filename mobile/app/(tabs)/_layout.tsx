import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import { AppSymbol } from '@/src/components/AppSymbol';
import { useTheme } from '@/src/theme/useTheme';

const WEB_TAB_BAR_HEIGHT = 62;

export default function TabLayout() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const compactTabs = width < 360;

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: colors.backgroundElevated,
      borderTopColor: colors.border,
      minHeight: Platform.OS === 'web' ? 56 : undefined,
      paddingBottom: Platform.OS === 'web' ? 6 : undefined,
    }),
    [colors.backgroundElevated, colors.border],
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle,
        tabBarLabelStyle: compactTabs ? { fontSize: 11 } : undefined,
        sceneStyle: Platform.OS === 'web' ? { paddingBottom: WEB_TAB_BAR_HEIGHT } : undefined,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontFamily: 'CormorantGaramond_600SemiBold',
          fontSize: 22,
          color: colors.text,
        },
        headerShadowVisible: false,
        headerShown: false,
        lazy: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <AppSymbol
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
            <AppSymbol
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
          title: 'Italian',
          tabBarIcon: ({ color }) => (
            <AppSymbol
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
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <AppSymbol
              name={{
                ios: 'person.fill',
                android: 'person',
                web: 'person',
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
