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

import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export type NotebookTab = 'vocabulary' | 'phrases' | 'grammar' | 'verbs';

export const NOTEBOOK_TABS: NotebookTab[] = ['vocabulary', 'phrases', 'grammar', 'verbs'];

export type NotebookTabCounts = {
  vocabulary?: number;
  phrases?: number;
  grammar?: number;
  verbs?: number;
};

export const NOTEBOOK_TAB_CONFIG: Record<
  NotebookTab,
  { label: string; icon: string; defaultSub: string }
> = {
  vocabulary: { label: 'Vocabulary', icon: '🔤', defaultSub: 'Word Bank' },
  phrases: { label: 'Phrases', icon: '💬', defaultSub: 'Expressions' },
  grammar: { label: 'Grammar', icon: '💡', defaultSub: '14 Lessons' },
  verbs: { label: 'Verbs', icon: '🔄', defaultSub: 'Conjugator' },
};

type Props = {
  active: NotebookTab;
  onChange: (tab: NotebookTab) => void;
  counts?: NotebookTabCounts;
};

export function NotebookTabs({ active, onChange, counts }: Props) {
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

  const scrollToTab = useCallback((tab: NotebookTab, animated = true) => {
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

  const handleTabLayout = (tab: NotebookTab, e: LayoutChangeEvent) => {
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

  const getSubLabel = (tab: NotebookTab): string => {
    const config = NOTEBOOK_TAB_CONFIG[tab];
    if (!counts) return config.defaultSub;
    const count = counts[tab];
    if (count === undefined) return config.defaultSub;
    if (tab === 'vocabulary') return `${count} words`;
    if (tab === 'phrases') return `${count} idioms`;
    if (tab === 'grammar') return `${count} topics`;
    if (tab === 'verbs') return `${count} verbs`;
    return config.defaultSub;
  };

  return (
    <View style={styles.wrap}>
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
        {NOTEBOOK_TABS.map((tab) => {
          const selected = tab === active;
          const info = NOTEBOOK_TAB_CONFIG[tab];
          const sub = getSubLabel(tab);

          return (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`${info.label}, ${sub}`}
              onLayout={(e) => handleTabLayout(tab, e)}
              onPress={() => {
                if (hasDraggedRef.current) return;
                onChange(tab);
              }}
              style={({ pressed }) => [
                styles.tab,
                {
                  backgroundColor: colors.backgroundElevated,
                  borderColor: selected ? colors.tint : colors.border,
                  borderBottomWidth: selected ? 2.5 : 1,
                  borderBottomColor: selected ? colors.tint : colors.border,
                  minHeight: minTouchTarget,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <View style={styles.tabContent}>
                <Text style={styles.tabIcon}>{info.icon}</Text>
                <View style={styles.textColumn}>
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
                        opacity: selected ? 1 : 0.75,
                      },
                    ]}>
                    {sub}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
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
    minWidth: 124,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabIcon: {
    fontSize: 18,
  },
  textColumn: {
    justifyContent: 'center',
  },
  tabLabel: {
    ...Typography.label,
    fontSize: 14,
    lineHeight: 18,
  },
  tabSub: {
    ...Typography.caption,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 1,
  },
});
