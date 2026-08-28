import { useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { useAccessibility } from '@/src/accessibility/AccessibilityProvider';
import { ReaderSentence } from '@/src/components/ReaderSentence';
import type { Chapter, Sentence, Token } from '@/src/content/schemas';
import { useLayout } from '@/src/theme/useLayout';
import { Spacing } from '@/src/theme/tokens';

type Props = {
  chapter: Chapter;
  highlightedSentenceId?: string | null;
  initialScrollOffset?: number | null;
  activeSentenceId?: string | null;
  activeTokenIndex?: number | null;
  activePhraseRange?: { start: number; end: number } | null;
  onPressToken?: (sentence: Sentence, token: Token, tokenIndex: number) => void;
  onPressSentenceBackground?: (sentence: Sentence) => void;
  onSentenceLayout?: (sentenceId: string, event: LayoutChangeEvent) => void;
  playingSentenceId?: string | null;
  hasAudio?: (sentence: Sentence) => boolean;
  onPlayAudio?: (sentence: Sentence) => void;
  onPlayHeader?: () => void;
  hasHeaderAudio?: boolean;
  showCompletionCta?: boolean;
  completionHint?: string;
  completionButtonLabel?: string;
  onContinueFromChapter?: () => void;
  onScrollProgress?: (progress: number) => void;
};

function SceneBreak() {
  const { colors } = useAccessibility();
  return (
    <View style={styles.sceneBreak} accessibilityRole="none">
      <View style={[styles.sceneHairline, { backgroundColor: colors.border }]} />
      <View style={[styles.sceneDot, { backgroundColor: colors.textMuted }]} />
      <View style={[styles.sceneHairline, { backgroundColor: colors.border }]} />
    </View>
  );
}

export function StoryReader({
  chapter,
  highlightedSentenceId,
  initialScrollOffset,
  activeSentenceId,
  activeTokenIndex,
  activePhraseRange,
  onPressToken,
  onPressSentenceBackground,
  onSentenceLayout,
  playingSentenceId,
  hasAudio,
  onPlayAudio,
  onPlayHeader,
  hasHeaderAudio,
  showCompletionCta,
  completionHint,
  completionButtonLabel = 'Continue',
  onContinueFromChapter,
  onScrollProgress,
}: Props) {
  const { colors, type, minTouchTarget } = useAccessibility();
  const layout = useLayout();
  const scrollRef = useRef<ScrollView>(null);
  const didRestore = useRef(false);
  const layoutH = useRef(0);
  const contentH = useRef(0);
  const offsetY = useRef(0);

  const isHeaderPlaying =
    playingSentenceId === 'header' ||
    playingSentenceId === `header:${chapter.id}` ||
    playingSentenceId === `header:${chapter.number}`;
  const isHeaderHighlighted =
    highlightedSentenceId === 'header' ||
    highlightedSentenceId === `header:${chapter.id}` ||
    highlightedSentenceId === `header:${chapter.number}` ||
    isHeaderPlaying;

  const emitProgress = () => {
    if (!onScrollProgress) return;
    const max = contentH.current - layoutH.current;
    if (max <= 0) {
      onScrollProgress(contentH.current > 0 ? 1 : 0);
      return;
    }
    onScrollProgress(Math.max(0, Math.min(1, offsetY.current / max)));
  };

  useEffect(() => {
    if (didRestore.current) return;
    if (initialScrollOffset == null) return;
    didRestore.current = true;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: initialScrollOffset, animated: false });
    });
  }, [initialScrollOffset]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetY.current = event.nativeEvent.contentOffset.y;
    contentH.current = event.nativeEvent.contentSize.height;
    layoutH.current = event.nativeEvent.layoutMeasurement.height;
    emitProgress();
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: colors.readerSurface }}
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal: layout.isPhone
            ? Math.max(Spacing.md, layout.paddingHorizontal)
            : Spacing.xl,
          maxWidth: layout.contentMaxWidth,
          width: '100%',
          alignSelf: 'center',
        },
      ]}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={onScroll}
      onContentSizeChange={(_w, h) => {
        contentH.current = h;
        emitProgress();
      }}
      onLayout={(event) => {
        layoutH.current = event.nativeEvent.layout.height;
        emitProgress();
      }}>
      <Pressable
        accessibilityRole={onPlayHeader ? 'button' : 'none'}
        accessibilityLabel={`Capitolo ${chapter.number}. ${chapter.titleIt}.${onPlayHeader ? (isHeaderPlaying ? ' Pause title audio.' : ' Play title audio.') : ''}`}
        onPress={onPlayHeader}
        style={[
          styles.headerBlock,
          isHeaderHighlighted && {
            backgroundColor: colors.sentenceHighlight,
            borderRadius: 8,
            padding: Spacing.sm,
            marginHorizontal: -Spacing.sm,
          },
        ]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
              Capitolo {chapter.number}
            </Text>
            <Text
              style={[
                type.chapterTitle,
                {
                  color: colors.text,
                  marginTop: Spacing.sm,
                },
              ]}>
              {chapter.titleIt}
            </Text>
          </View>
          {hasHeaderAudio || onPlayHeader ? (
            <View
              style={[
                styles.headerAudioBtn,
                {
                  backgroundColor: isHeaderPlaying ? colors.tint : colors.backgroundElevated,
                  borderColor: colors.border,
                },
              ]}>
              <Text
                style={[
                  type.caption,
                  {
                    color: isHeaderPlaying ? colors.background : colors.textMuted,
                    fontSize: 12,
                    lineHeight: 14,
                  },
                ]}>
                {isHeaderPlaying ? '❚❚' : '▶'}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.body}>
        {chapter.paragraphs.map((paragraph, index) => (
          <View key={paragraph.id}>
            {index > 0 ? <SceneBreak /> : null}
            <View style={styles.paragraph}>
              {paragraph.sentences.map((sentence) => (
                <View
                  key={sentence.id}
                  onLayout={(event) => onSentenceLayout?.(sentence.id, event)}>
                  <ReaderSentence
                    sentence={sentence}
                    highlighted={
                      highlightedSentenceId === sentence.id || playingSentenceId === sentence.id
                    }
                    activeTokenIndex={
                      activeSentenceId === sentence.id ? activeTokenIndex : null
                    }
                    phraseRange={
                      activeSentenceId === sentence.id ? activePhraseRange : null
                    }
                    onPressToken={onPressToken}
                    onPressSentenceBackground={onPressSentenceBackground}
                    hasAudio={hasAudio?.(sentence) ?? false}
                    isPlaying={playingSentenceId === sentence.id}
                    onPlayAudio={onPlayAudio}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {showCompletionCta ? (
        <View style={styles.completionCta}>
          <Text style={[type.caption, { color: colors.textMuted }]}>
            {completionHint ?? 'Finished reading?'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={completionButtonLabel}
            onPress={onContinueFromChapter}
            style={({ pressed }) => [
              styles.continueBtn,
              { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1, minHeight: minTouchTarget },
            ]}>
            <Text style={[type.button, { color: colors.onButtonPrimary, fontSize: type.button.fontSize }]}>
              {completionButtonLabel}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  headerBlock: {
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  headerAudioBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginTop: Spacing.xl,
  },
  paragraph: {
    marginBottom: 0,
  },
  sceneBreak: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  sceneHairline: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    maxWidth: 48,
  },
  sceneDot: {
    width: Spacing.xs,
    height: Spacing.xs,
    borderRadius: Spacing.xs / 2,
  },
  completionCta: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
    alignSelf: 'stretch',
  },
  continueBtn: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
});
