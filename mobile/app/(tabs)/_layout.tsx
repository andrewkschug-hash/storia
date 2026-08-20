import { Tabs, usePathname } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import { AppSymbol } from '@/src/components/AppSymbol';
import { navLog } from '@/src/navigation/diagnostics';
import { useTheme } from '@/src/theme/useTheme';

const WEB_TAB_BAR_HEIGHT = 62;

const TAB_ROUTE_NAMES = ['home', 'stories', 'vocabulary', 'profile'] as const;

function tabFromPathname(pathname: string): string {
  for (const name of TAB_ROUTE_NAMES) {
    if (pathname.includes(name)) return name;
  }
  return pathname;
}

export default function TabLayout() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const compactTabs = width < 360;
  const pathname = usePathname();
  const previousTab = useRef<string | null>(null);

  useEffect(() => {
    const next = tabFromPathname(pathname);
    if (previousTab.current && previousTab.current !== next) {
      navLog(`activeTab changing: ${previousTab.current} → ${next}`);
    } else if (!previousTab.current) {
      navLog(`activeTab initial: ${next}`);
    }
    previousTab.current = next;
  }, [pathname]);

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: colors.backgroundElevated,
      borderTopColor: colors.border,
      minHeight: Platform.OS === 'web' ? 56 : undefined,
      paddingBottom: Platform.OS === 'web' ? 6 : undefined,
    }),
    [colors.backgroundElevated, colors.border],
  );

  const screenListeners = useMemo(
    () => ({
      tabPress: (event: { target?: string }) => {
        navLog(`click: ${event.target ?? 'tab'}`, { pathname });
      },
    }),
    [pathname],
  );

  return (
    <Tabs
      screenListeners={screenListeners}
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
        // Mount tabs on first visit only — avoids thundering-herd init that blocked the main thread.
        lazy: true,
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
