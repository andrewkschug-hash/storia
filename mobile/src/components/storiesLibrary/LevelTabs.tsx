import { useEffect, useRef } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import type { LibraryTab } from '@/src/components/storiesLibrary/types';
import { LIBRARY_TABS } from '@/src/components/storiesLibrary/buildStoryRows';
import { Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  active: LibraryTab;
  onChange: (tab: LibraryTab) => void;
};

export function LevelTabs({ active, onChange }: Props) {
  const { colors, minTouchTarget } = useTheme();
  const fade = useRef(new Animated.Value(1)).current;
  const tabLayouts = useRef<Partial<Record<LibraryTab, { x: number; width: number }>>>({});
  const indicatorInitialized = useRef(false);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0.92);
    Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const layout = tabLayouts.current[active];
    if (layout) {
      Animated.parallel([
        Animated.timing(indicatorX, { toValue: layout.x, duration: 180, useNativeDriver: false }),
        Animated.timing(indicatorW, { toValue: layout.width, duration: 180, useNativeDriver: false }),
      ]).start();
    }
  }, [active, fade, indicatorW, indicatorX]);

  const onTabLayout = (tab: LibraryTab) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    tabLayouts.current[tab] = { x, width };
    if (tab === active && !indicatorInitialized.current) {
      indicatorX.setValue(x);
      indicatorW.setValue(width);
      indicatorInitialized.current = true;
    }
  };

  const trackBorder = 'rgba(120, 182, 163, 0.18)';

  return (
    <Animated.View style={{ opacity: fade, marginBottom: 32 }}>
      <View style={[styles.track, { borderColor: trackBorder, backgroundColor: 'rgba(255,255,255,0.03)' }]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              backgroundColor: colors.tint,
              opacity: 0.22,
              left: indicatorX,
              width: indicatorW,
            },
          ]}
        />
        {LIBRARY_TABS.map((tab) => {
          const selected = tab === active;
          return (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onLayout={onTabLayout(tab)}
              onPress={() => onChange(tab)}
              style={({ pressed }) => [
                styles.tab,
                { minHeight: minTouchTarget, opacity: pressed ? 0.85 : 1 },
              ]}>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: selected ? colors.text : colors.textMuted,
                    fontFamily: selected ? 'Literata_600SemiBold' : 'Literata_400Regular',
                  },
                ]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 999,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    zIndex: 1,
  },
  tabLabel: {
    ...Typography.label,
    fontSize: 14,
  },
});
