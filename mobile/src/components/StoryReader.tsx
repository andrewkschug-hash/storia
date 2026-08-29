import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
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
import { calculateReaderScrollTarget, isHeaderTarget } from '@/src/reader/readerScroll';
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
  const { colors, type, minTouchTarget, settings } = useAccessibility();
  const layout = useLayout();
  const scrollRef = useRef<ScrollView>(null);
  const didRestore = useRef(false);
  const layoutH = useRef(0);
  const contentH = useRef(0);
  const offsetY = useRef(0);

  const bodyLayoutY = useRef(0);
  const paragraphLayoutY = useRef<Record<string, number>>({});
  const sentenceLayoutY = useRef<Record<string, number>>({});
  const sentenceHeights = useRef<Record<string, number>>({});
  const lastAutoScrolledTarget = useRef<string | null>(null);

  const isHeaderPlaying = isHeaderTarget(playingSentenceId, chapter);
  const isHeaderHighlighted =
    isHeaderTarget(highlightedSentenceId, chapter) || isHeaderPlaying;

  const emitProgress = () => {
    if (!onScrollProgress) return;
    const max = contentH.current - layoutH.current;
    if (max <= 0) {
      onScrollProgress(contentH.current > 0 ? 1 : 0);
      return;
    }
    onScrollProgress(Math.max(0, Math.min(1, offsetY.current / max)));
  };

  const scrollToTarget = useCallback(
    (targetId: string, animated: boolean = true) => {
      const targetY = calculateReaderScrollTarget({
        targetId,
        chapter,
        bodyY: bodyLayoutY.current,
        paragraphY: paragraphLayoutY.current,
        sentenceY: sentenceLayoutY.current,
        viewportHeight: layoutH.current,
      });

      if (targetY != null && scrollRef.current) {
        scrollRef.current.scrollTo({
          y: targetY,
          animated: settings.reducedMotion ? false : animated,
        });
      }
    },
    [chapter, settings.reducedMotion],
  );

  // Auto-scroll when listening/playing moves from sentence to sentence
  useEffect(() => {
    if (!playingSentenceId) {
      lastAutoScrolledTarget.current = null;
      return;
    }
    if (lastAutoScrolledTarget.current === playingSentenceId) return;
    lastAutoScrolledTarget.current = playingSentenceId;
    scrollToTarget(playingSentenceId, true);
  }, [playingSentenceId, scrollToTarget]);

  // Initial scroll position restoration on chapter open
  useEffect(() => {
    if (didRestore.current) return;
    if (initialScrollOffset != null) {
      didRestore.current = true;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: initialScrollOffset, animated: false });
      });
    } else if (highlightedSentenceId && !playingSentenceId) {
      const targetY = calculateReaderScrollTarget({
        targetId: highlightedSentenceId,
        chapter,
        bodyY: bodyLayoutY.current,
        paragraphY: paragraphLayoutY.current,
        sentenceY: sentenceLayoutY.current,
        viewportHeight: layoutH.current,
      });
      if (targetY != null) {
        didRestore.current = true;
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ y: targetY, animated: false });
        });
      }
    }
  }, [initialScrollOffset, highlightedSentenceId, playingSentenceId, chapter]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetY.current = event.nativeEvent.contentOffset.y;
    contentH.current = event.nativeEvent.contentSize.height;
    layoutH.current = event.nativeEvent.layoutMeasurement.height;
    emitProgress();
  };

  const onBodyLayout = (event: LayoutChangeEvent) => {
    bodyLayoutY.current = event.nativeEvent.layout.y;
    if (playingSentenceId) {
      scrollToTarget(playingSentenceId, true);
    }
  };

  const onParagraphLayout = (paragraphId: string, event: LayoutChangeEvent) => {
    paragraphLayoutY.current[paragraphId] = event.nativeEvent.layout.y;
    if (playingSentenceId) {
      const currentParagraph = chapter.paragraphs.find((p) =>
        p.sentences.some((s) => s.id === playingSentenceId),
      );
      if (currentParagraph?.id === paragraphId) {
        scrollToTarget(playingSentenceId, true);
      }
    }
  };

  const handleSentenceLayout = (sentenceId: string, event: LayoutChangeEvent) => {
    sentenceLayoutY.current[sentenceId] = event.nativeEvent.layout.y;
    sentenceHeights.current[sentenceId] = event.nativeEvent.layout.height;
    onSentenceLayout?.(sentenceId, event);
    if (playingSentenceId === sentenceId) {
      scrollToTarget(sentenceId, true);
    }
  };

  const [showTitleTranslation, setShowTitleTranslation] = useState(false);

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
        if (playingSentenceId) {
          scrollToTarget(playingSentenceId, true);
        }
      }}>
      <View
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Chapter ${chapter.number}: ${chapter.titleIt}.${chapter.title ? (showTitleTranslation ? ` English: ${chapter.title}. Tap to hide translation.` : ' Tap to reveal English translation.') : ''}`}
            onPress={() => setShowTitleTranslation((v) => !v)}
            style={({ pressed }) => [{ flex: 1, opacity: pressed ? 0.8 : 1 }]}>
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
            {chapter.title ? (
              showTitleTranslation ? (
                <Text
                  style={[
                    type.body,
                    {
                      color: colors.textSecondary,
                      marginTop: Spacing.xs,
                      fontStyle: 'italic',
                    },
                  ]}>
                  {chapter.title}
                </Text>
              ) : (
                <Text
                  style={[
                    type.caption,
                    {
                      color: colors.textMuted,
                      marginTop: Spacing.xs,
                    },
                  ]}>
                  ▸ English
                </Text>
              )
            ) : null}
          </Pressable>
          {hasHeaderAudio || onPlayHeader ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isHeaderPlaying
                  ? 'Pause chapter audio'
                  : `Play chapter ${chapter.number} audio`
              }
              onPress={onPlayHeader}
              hitSlop={8}
              style={({ pressed }) => [
                styles.headerAudioBtn,
                {
                  backgroundColor: isHeaderPlaying ? colors.tint : colors.backgroundElevated,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                  minWidth: Math.max(36, minTouchTarget),
                  minHeight: Math.max(36, minTouchTarget),
                },
              ]}>
              <Text
                style={[
                  type.caption,
                  {
                    color: isHeaderPlaying ? colors.background : colors.textMuted,
                    fontSize: 14,
                    lineHeight: 16,
                  },
                ]}>
                {isHeaderPlaying ? '❚❚' : '▶'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.body} onLayout={onBodyLayout}>
        {chapter.paragraphs.map((paragraph, index) => (
          <Fragment key={paragraph.id}>
            {index > 0 ? <SceneBreak /> : null}
            <View
              style={styles.paragraph}
              onLayout={(e) => onParagraphLayout(paragraph.id, e)}>
              {paragraph.sentences.map((sentence) => (
                <View
                  key={sentence.id}
                  onLayout={(event) => handleSentenceLayout(sentence.id, event)}>
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
          </Fragment>
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
    paddingBottom: Spacing.xxl * 2,
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
