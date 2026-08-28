import { useCallback, useRef, useState } from 'react';
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
import type { NotebookGrammarInsight } from '@/src/vocabulary/notebookData';

type Props = {
  insights: NotebookGrammarInsight[];
  onNavigateChapter: (chapterNum: number) => void;
};

export function GrammarInsightsCarousel({ insights, onNavigateChapter }: Props) {
  const { colors, minTouchTarget, type } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(300);
  const scrollRef = useRef<ScrollView>(null);

  // Mouse drag support for web desktop
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const currentScrollXRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      // Calculate responsive card width: on narrow mobile it's nearly full width, on wider it has peek
      setCardWidth(Math.min(width, 520));
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = e.nativeEvent.contentOffset.x;
    currentScrollXRef.current = scrollX;
    const itemFullWidth = cardWidth + Spacing.sm;
    if (itemFullWidth > 0) {
      const idx = Math.round(scrollX / itemFullWidth);
      setActiveIndex(Math.max(0, Math.min(idx, insights.length - 1)));
    }
  };

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      const targetIndex = Math.max(0, Math.min(index, insights.length - 1));
      const targetX = targetIndex * (cardWidth + Spacing.sm);
      scrollRef.current?.scrollTo({ x: targetX, animated });
      setActiveIndex(targetIndex);
    },
    [cardWidth, insights.length],
  );

  const handleMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX ?? e.nativeEvent?.pageX ?? 0;
    scrollStartRef.current = currentScrollXRef.current;
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
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 60);
  };

  if (!insights.length) return null;

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.2 }]}>
            Key Grammatical Shift Insights
          </Text>
          <Text style={[type.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Swipe across core grammatical patterns introduced in the story
          </Text>
        </View>

        {/* Prev / Next controls */}
        <View style={styles.arrowControls}>
          <Pressable
            onPress={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            accessibilityRole="button"
            accessibilityLabel="Previous grammar shift"
            style={({ pressed }) => [
              styles.arrowBtn,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.border,
                opacity: activeIndex === 0 ? 0.35 : pressed ? 0.7 : 1,
              },
            ]}>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }}>‹</Text>
          </Pressable>
          <Pressable
            onPress={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex >= insights.length - 1}
            accessibilityRole="button"
            accessibilityLabel="Next grammar shift"
            style={({ pressed }) => [
              styles.arrowBtn,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.border,
                opacity: activeIndex >= insights.length - 1 ? 0.35 : pressed ? 0.7 : 1,
              },
            ]}>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: 'bold' }}>›</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={cardWidth + Spacing.sm}
        contentContainerStyle={styles.scrollContent}
        style={[
          styles.scroll,
          Platform.OS === 'web'
            ? ({
                cursor: 'grab',
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
        {insights.map((insight, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <View
              key={insight.id}
              style={[
                styles.insightCard,
                {
                  width: cardWidth,
                  backgroundColor: colors.backgroundElevated,
                  borderColor: isCurrent ? colors.tint : colors.border,
                },
              ]}>
              <View style={styles.insightHeader}>
                <Text
                  style={[
                    type.heroTitle,
                    { color: colors.text, fontSize: 16, lineHeight: 20, flex: 1 },
                  ]}>
                  💡 {insight.titleIt}
                </Text>
                <View
                  style={[
                    styles.rangeTag,
                    { backgroundColor: colors.backgroundHigher, borderColor: colors.border },
                  ]}>
                  <Text
                    style={[
                      type.caption,
                      { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 11 },
                    ]}>
                    Ch {insight.chapterRange.start}–{insight.chapterRange.end}
                  </Text>
                </View>
              </View>

              <View style={[styles.formulaBox, { backgroundColor: colors.backgroundHigher }]}>
                <Text
                  style={[
                    type.caption,
                    { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 12 },
                  ]}>
                  📐 {insight.formula}
                </Text>
              </View>

              <View
                style={[
                  styles.exampleBox,
                  { backgroundColor: colors.backgroundAtmosphereTop, borderLeftColor: colors.tint },
                ]}>
                <Text
                  style={[
                    type.body,
                    {
                      color: colors.text,
                      fontFamily: 'Literata_500Medium',
                      fontSize: 13,
                      fontStyle: 'italic',
                    },
                  ]}>
                  &ldquo;{insight.exampleIt}&rdquo;
                </Text>
                <Text
                  style={[
                    type.caption,
                    { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
                  ]}>
                  {insight.exampleEn}
                </Text>
              </View>

              <Text
                style={[
                  type.caption,
                  { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 4 },
                ]}>
                {insight.explanation}
              </Text>

              <Pressable
                onPress={() => {
                  if (hasDraggedRef.current) return;
                  onNavigateChapter(insight.sampleChapterNumber);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Read in Chapter ${insight.sampleChapterNumber}`}
                style={{
                  alignSelf: 'flex-end',
                  minHeight: minTouchTarget - 10,
                  justifyContent: 'center',
                  marginTop: 4,
                }}>
                <Text
                  style={[
                    type.caption,
                    { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 12 },
                  ]}>
                  Read in Chapter {insight.sampleChapterNumber} →
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.paginationDots}>
        {insights.map((insight, idx) => (
          <Pressable
            key={insight.id}
            onPress={() => scrollToIndex(idx)}
            accessibilityRole="button"
            accessibilityLabel={`Go to slide ${idx + 1}`}
            style={[
              styles.dot,
              {
                backgroundColor: idx === activeIndex ? colors.tint : colors.textMuted,
                opacity: idx === activeIndex ? 1 : 0.35,
                width: idx === activeIndex ? 16 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  arrowControls: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: Radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 2,
    paddingRight: Spacing.md,
  },
  insightCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rangeTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  formulaBox: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.xs + 2,
    borderRadius: Radii.sm,
    alignSelf: 'flex-start',
  },
  exampleBox: {
    borderLeftWidth: 2.5,
    paddingLeft: Spacing.xs + 4,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    marginTop: 2,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.xs + 2,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
