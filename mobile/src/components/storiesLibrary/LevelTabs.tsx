import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import type { LibraryTab } from '@/src/components/storiesLibrary/types';
import { LIBRARY_TABS } from '@/src/components/storiesLibrary/buildStoryRows';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  active: LibraryTab;
  onChange: (tab: LibraryTab) => void;
};

export const TAB_DESCRIPTIONS: Record<LibraryTab, { label: string; sub: string }> = {
  A1: { label: 'A1', sub: 'Arrivo' },
  'A1+': { label: 'A1+', sub: 'Appartenenza' },
  A2: { label: 'A2', sub: 'Responsabilità' },
  B1: { label: 'B1', sub: 'Due vite' },
  'B1+': { label: 'B1+', sub: 'La scelta' },
  'A2+': { label: 'A2+', sub: 'Percorsi' },
};

export function LevelTabs({ active, onChange }: Props) {
  const { colors, minTouchTarget } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const containerWidthRef = useRef<number>(0);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const currentScrollXRef = useRef<number>(0);

  // Mouse drag support for web desktop / browser preview
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isWebDragging, setIsWebDragging] = useState(false);

  const scrollToTab = useCallback((tab: LibraryTab, animated = true) => {
    const layout = tabLayouts.current[tab];
    if (!layout || !scrollRef.current) return;
    const containerWidth = containerWidthRef.current;
    const targetX = Math.max(
      0,
      layout.x - (containerWidth > 0 ? (containerWidth - layout.width) / 2 : 20),
    );
    scrollRef.current.scrollTo({ x: targetX, animated });
  }, []);

  useEffect(() => {
    scrollToTab(active, true);
  }, [active, scrollToTab]);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    containerWidthRef.current = e.nativeEvent.layout.width;
    scrollToTab(active, false);
  };

  const handleTabLayout = (tab: LibraryTab, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    tabLayouts.current[tab] = { x, width };
    if (tab === active) {
      scrollToTab(active, false);
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    currentScrollXRef.current = e.nativeEvent.contentOffset.x;
  };

  const handleMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX ?? e.nativeEvent?.pageX ?? 0;
    scrollStartRef.current = currentScrollXRef.current;
    setIsWebDragging(true);
  };

  const handleMouseMove = (e: any) => {
    if (Platform.OS !== 'web' || !isDraggingRef.current) return;
    const currentX = e.pageX ?? e.nativeEvent?.pageX ?? 0;
    const dx = currentX - startXRef.current;
    if (Math.abs(dx) > 5) {
      hasDraggedRef.current = true;
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: Math.max(0, scrollStartRef.current - dx),
        animated: false,
      });
    }
  };

  const handleMouseUp = () => {
    if (Platform.OS !== 'web') return;
    isDraggingRef.current = false;
    setIsWebDragging(false);
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 60);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.4, marginBottom: Spacing.sm }]}>
        Reading Pathway
      </Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={handleContainerLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.shelfRow}
        style={[
          styles.scroll,
          Platform.OS === 'web'
            ? ({
                cursor: isWebDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
              } as any)
            : undefined,
        ]}
        {...(Platform.OS === 'web'
          ? ({
              onMouseDown: handleMouseDown,
              onMouseMove: handleMouseMove,
              onMouseUp: handleMouseUp,
              onMouseLeave: handleMouseUp,
            } as any)
          : {})}>
        {LIBRARY_TABS.map((tab) => {
          const selected = tab === active;
          const info = TAB_DESCRIPTIONS[tab];
          return (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${info.label}, ${info.sub}`}
              onLayout={(e) => handleTabLayout(tab, e)}
              onPress={() => {
                if (hasDraggedRef.current) return;
                onChange(tab);
              }}
              style={({ pressed }) => [
                styles.tab,
                {
                  backgroundColor: selected
                    ? colors.backgroundElevated
                    : colors.backgroundElevated,
                  borderColor: selected ? colors.tint : colors.border,
                  borderBottomWidth: selected ? 2.5 : 1,
                  borderBottomColor: selected ? colors.tint : colors.border,
                  minHeight: minTouchTarget,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color: selected ? colors.text : colors.textMuted,
                    fontFamily: selected ? 'Literata_600SemiBold' : 'Literata_500Medium',
                  },
                ]}>
                {info.label}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.tabSub,
                  {
                    color: selected ? colors.tint : colors.textMuted,
                    opacity: selected ? 1 : 0.7,
                  },
                ]}>
                {info.sub}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.lg,
  },
  scroll: {
    flexGrow: 0,
  },
  shelfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
    paddingVertical: 2,
  },
  tab: {
    minWidth: 104,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  tabLabel: {
    ...Typography.label,
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  tabSub: {
    ...Typography.caption,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
    textAlign: 'center',
  },
});
