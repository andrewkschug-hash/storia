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
import type { NotebookPhrase } from '@/src/vocabulary/notebookData';

type Props = {
  phrases: NotebookPhrase[];
  speakingId: string | null;
  optimisticSaved: Record<string, boolean>;
  onPlayAudio: (id: string, text: string) => void;
  onToggleSave: (kind: 'lemma' | 'phrase', id: string, currentSaved: boolean) => void;
  onNavigateChapter: (chapterNum: number) => void;
};

export function PhrasesSpotlightCarousel({
  phrases,
  speakingId,
  optimisticSaved,
  onPlayAudio,
  onToggleSave,
  onNavigateChapter,
}: Props) {
  const { colors, minTouchTarget, type } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(300);
  const scrollRef = useRef<ScrollView>(null);

  // Spotlight subset (first 6 memorable lines)
  const spotlightList = phrases.slice(0, 6);

  // Mouse drag support for web desktop
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const currentScrollXRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setCardWidth(Math.min(width, 520));
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = e.nativeEvent.contentOffset.x;
    currentScrollXRef.current = scrollX;
    const itemFullWidth = cardWidth + Spacing.sm;
    if (itemFullWidth > 0) {
      const idx = Math.round(scrollX / itemFullWidth);
      setActiveIndex(Math.max(0, Math.min(idx, spotlightList.length - 1)));
    }
  };

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      const targetIndex = Math.max(0, Math.min(index, spotlightList.length - 1));
      const targetX = targetIndex * (cardWidth + Spacing.sm);
      scrollRef.current?.scrollTo({ x: targetX, animated });
      setActiveIndex(targetIndex);
    },
    [cardWidth, spotlightList.length],
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

  if (!spotlightList.length) return null;

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.2 }]}>
            Spotlight Story Quotes
          </Text>
          <Text style={[type.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Key conversational lines from Rome
          </Text>
        </View>

        <View style={styles.arrowControls}>
          <Pressable
            onPress={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            accessibilityRole="button"
            accessibilityLabel="Previous spotlight quote"
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
            disabled={activeIndex >= spotlightList.length - 1}
            accessibilityRole="button"
            accessibilityLabel="Next spotlight quote"
            style={({ pressed }) => [
              styles.arrowBtn,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.border,
                opacity: activeIndex >= spotlightList.length - 1 ? 0.35 : pressed ? 0.7 : 1,
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
        {spotlightList.map((phrase, idx) => {
          const isCurrent = idx === activeIndex;
          const isSpeaking = speakingId === phrase.id;
          const isSaved = optimisticSaved[`phrase:${phrase.id}`] ?? false;

          return (
            <View
              key={phrase.id}
              style={[
                styles.phraseCard,
                {
                  width: cardWidth,
                  backgroundColor: colors.backgroundElevated,
                  borderColor: isCurrent ? colors.tint : colors.border,
                },
              ]}>
              <View style={styles.phraseHeader}>
                <View style={styles.speakerRow}>
                  <View style={[styles.speakerBadge, { backgroundColor: colors.backgroundHigher }]}>
                    <Text
                      style={[
                        type.caption,
                        { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 11 },
                      ]}>
                      🗣️ {phrase.speaker}
                    </Text>
                  </View>
                  <Text style={[type.caption, { color: colors.textMuted, fontSize: 11 }]}>
                    · Ch. {phrase.chapterNumber}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <Pressable
                    onPress={() => onToggleSave('phrase', phrase.id, isSaved)}
                    accessibilityRole="button"
                    accessibilityLabel={isSaved ? 'Unsave phrase' : 'Save phrase'}
                    style={({ pressed }) => [
                      styles.iconBtn,
                      {
                        backgroundColor: colors.backgroundHigher,
                        borderColor: colors.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}>
                    <Text style={{ fontSize: 13 }}>{isSaved ? '⭐' : '☆'}</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onPlayAudio(phrase.id, phrase.textIt)}
                    accessibilityRole="button"
                    accessibilityLabel={`Pronounce ${phrase.textIt}`}
                    style={({ pressed }) => [
                      styles.audioBtn,
                      {
                        backgroundColor: isSpeaking ? colors.accentSoft : colors.backgroundHigher,
                        borderColor: colors.border,
                        opacity: pressed ? 0.7 : 1,
                        minHeight: Math.max(32, minTouchTarget - 12),
                      },
                    ]}>
                    <Text style={[type.caption, { color: colors.text, fontSize: 11 }]}>
                      {isSpeaking ? '🔊 Playing…' : '🔊 Listen'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Text
                style={[
                  type.heroTitle,
                  {
                    color: colors.text,
                    fontSize: 16,
                    lineHeight: 22,
                    fontStyle: 'italic',
                    marginTop: 2,
                  },
                ]}>
                &ldquo;{phrase.textIt}&rdquo;
              </Text>
              <Text style={[type.body, { color: colors.textSecondary, fontSize: 13, marginTop: 2 }]}>
                {phrase.textEn}
              </Text>

              <View style={[styles.phraseFooter, { borderTopColor: colors.divider }]}>
                <Text
                  style={[
                    type.caption,
                    { color: colors.textMuted, flex: 1, fontSize: 11, lineHeight: 15 },
                  ]}
                  numberOfLines={2}>
                  💡 {phrase.whyMemorable}
                </Text>
                <Pressable
                  onPress={() => {
                    if (hasDraggedRef.current) return;
                    onNavigateChapter(phrase.chapterNumber);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Read in Chapter ${phrase.chapterNumber}`}
                  style={{ minHeight: minTouchTarget - 10, justifyContent: 'center' }}>
                  <Text
                    style={[
                      type.caption,
                      { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 11 },
                    ]}>
                    Read Scene →
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.paginationDots}>
        {spotlightList.map((phrase, idx) => (
          <Pressable
            key={phrase.id}
            onPress={() => scrollToIndex(idx)}
            accessibilityRole="button"
            accessibilityLabel={`Go to spotlight slide ${idx + 1}`}
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
  phraseCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  phraseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakerBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radii.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: Radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioBtn: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.xs + 2,
    borderRadius: Radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    gap: Spacing.sm,
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
