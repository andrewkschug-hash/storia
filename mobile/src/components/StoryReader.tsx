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
  showCompletionCta?: boolean;
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
  showCompletionCta,
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
          <Text style={[type.caption, { color: colors.textMuted }]}>Finished reading?</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue"
            onPress={onContinueFromChapter}
            style={({ pressed }) => [
              styles.continueBtn,
              { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1, minHeight: minTouchTarget },
            ]}>
            <Text style={[type.button, { color: colors.onTint, fontSize: type.button.fontSize }]}>Continue</Text>
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
