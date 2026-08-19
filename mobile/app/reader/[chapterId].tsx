import { Stack, router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { DictionarySheet } from '@/src/components/DictionarySheet';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ReaderAudioBar } from '@/src/components/ReaderAudioBar';
import { ReaderPassBanner } from '@/src/components/ReaderPassBanner';
import {
  ReaderListenComplete,
  ReaderReadToListenTransition,
} from '@/src/components/ReaderPassTransition';
import { StoryReader } from '@/src/components/StoryReader';
import { getAdaptiveService } from '@/src/adaptive';
import { getAudioCatalog, getAudioService } from '@/src/audio';
import { refreshCatalogFromGateway } from '@/src/audio/AudioService';
import { findStoryIdForChapter, getChapter } from '@/src/content';
import { comprehensionHref } from '@/src/content/storyHrefs';
import type { Chapter, Sentence, Token } from '@/src/content/schemas';
import { getProgressService } from '@/src/progress';
import type { ReaderPassGuidance, ReaderPassMode } from '@/src/progress/chapterPass';
import { isListenPassComplete, shouldUseDetailedPassInstructions } from '@/src/progress/chapterPass';
import type { ReadingProgressRecord } from '@/src/progress/types';
import {
  listenCompleteCopy,
  passInstructionCopy,
  readToListenTransitionCopy,
} from '@/src/reader/readerPassCopy';
import { hasSeenReaderTip, markReaderTipSeen } from '@/src/reader/storage';
import { trackChapterWordsRead } from '@/src/telemetry/chapterExposure';
import { trackReadingEvent } from '@/src/telemetry/ReadingEventStore';
import { getVocabularyService } from '@/src/vocabulary';
import type { DictionaryLookup } from '@/src/vocabulary/types';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

function goToStories() {
  if (router.canDismiss()) {
    router.dismissTo('/(tabs)/stories' as Href);
    return;
  }
  router.replace('/(tabs)/stories' as Href);
}

/** Guided chapter flow steps beyond read/listen mode. */
type GuidedStep = 'content' | 'read-transition' | 'listen-complete';

export default function ReaderScreen() {
  const { chapterId, listen, replay, story } = useLocalSearchParams<{
    chapterId: string;
    listen?: string;
    story?: string;
    replay?: string;
  }>();
  const storyId =
    (typeof story === 'string' && story) || findStoryIdForChapter(chapterId) || undefined;
  const { colors, type, minTouchTarget } = useTheme();
  const authored = storyId ? getChapter(chapterId, storyId) : undefined;
  const [chapter, setChapter] = useState<Chapter | undefined>(authored);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookup, setLookup] = useState<DictionaryLookup | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [activeTokenIndex, setActiveTokenIndex] = useState<number | null>(null);
  const openedAt = useRef(Date.now());
  const yBySentence = useRef<Record<string, number>>({});
  const [scrollToY, setScrollToY] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<'normal' | 'slow' | 'faster'>('normal');
  const [isPlaying, setIsPlaying] = useState(false);
  const [chapterPlayback, setChapterPlayback] = useState<{ current: number; total: number } | null>(
    null,
  );
  const [audioCatalogVersion, setAudioCatalogVersion] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showReaderTip, setShowReaderTip] = useState(false);
  const [progressRecord, setProgressRecord] = useState<ReadingProgressRecord | null>(null);
  const [readerPass, setReaderPass] = useState<ReaderPassMode>('read');
  const [passGuidance, setPassGuidance] = useState<ReaderPassGuidance>('guided');
  const [guidedStep, setGuidedStep] = useState<GuidedStep>('content');
  const listenRequested = listen === '1';
  const replayMode = replay === '1';
  const autoplayRequested = useRef(false);
  const replayCountBySentence = useRef<Record<string, number>>({});
  const chapterAudioRunActive = useRef(false);
  const manualChapterStop = useRef(false);
  const prevChapterMode = useRef(false);
  const audio = getAudioService();
  const isChapterMode = audio.isChapterMode();

  const syncCatalog = useCallback(async () => {
    await refreshCatalogFromGateway(getAudioCatalog());
    setAudioCatalogVersion((v) => v + 1);
  }, []);

  const syncAudioUi = () => {
    setPlayingId(audio.getPlayingId());
    setAudioSpeed(audio.getSpeed());
    setIsPlaying(audio.isPlaying());
    setChapterPlayback(audio.getChapterPlaybackProgress());
  };

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setChapter(authored);
    async function boot() {
      if (!authored) return;
      try {
        const service = getProgressService(storyId ?? authored.storyId);
        const progress = await service.openChapter(authored.id);
        const resolved = service.resolveReaderPassForChapter(progress, authored.id, {
          listenRequested,
          replay: replayMode,
        });
        setProgressRecord(progress);
        setReaderPass(resolved.pass);
        setPassGuidance(resolved.guidance);
        setGuidedStep('content');
        autoplayRequested.current =
          listenRequested && resolved.pass === 'listen' && resolved.guidance === 'free';
        const adapted = await getAdaptiveService().resolveChapter(authored, progress);
        audio.setChapterContext(authored.id);
        void syncCatalog();
        await audio.loadSpeed();
        const tipSeen = await hasSeenReaderTip();
        if (cancelled) return;
        setChapter(adapted);
        setHighlightId(progress.lastSentenceId);
        setShowReaderTip(!tipSeen);
        audio.setOnChange(syncAudioUi);
        syncAudioUi();
        setReady(true);
        if (autoplayRequested.current) {
          autoplayRequested.current = false;
          const allSentences = adapted.paragraphs.flatMap((p) => p.sentences);
          manualChapterStop.current = false;
          chapterAudioRunActive.current = true;
          trackReadingEvent({
            type: 'audio_starts',
            storyId: storyId ?? adapted.storyId,
            chapterId: adapted.id,
            meta: { source: 'autoplay' },
          });
          void audio.playChapter(allSentences, adapted.id).then(() => syncAudioUi());
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    }
    void boot();
    openedAt.current = Date.now();
    return () => {
      cancelled = true;
      const elapsed = Date.now() - openedAt.current;
      if (storyId) void getProgressService(storyId).addReadingTime(elapsed);
      audio.stop();
      audio.setOnChange(null);
    };
  }, [authored, syncCatalog, listenRequested, replayMode]);

  useFocusEffect(
    useCallback(() => {
      if (!authored) return;
      audio.setChapterContext(authored.id);
      void syncCatalog().then(() => syncAudioUi());
    }, [authored, syncCatalog]),
  );

  useEffect(() => {
    if (!highlightId) return;
    const y = yBySentence.current[highlightId];
    if (typeof y === 'number') {
      setScrollToY(Math.max(0, y - 40));
    }
  }, [highlightId, ready]);

  useEffect(() => {
    if (!playingId) return;
    setHighlightId(playingId);
    const y = yBySentence.current[playingId];
    if (typeof y === 'number') {
      setScrollToY(Math.max(0, y - 40));
    }
  }, [playingId]);

  const sentences = useMemo(() => {
    if (!chapter) return [] as Sentence[];
    return chapter.paragraphs.flatMap((p) => p.sentences);
  }, [chapter]);

  const hasAudio = useMemo(() => {
    return sentences.some((s) => audio.sentenceAudio(s));
  }, [sentences, audioCatalogVersion]);

  const phraseRange =
    lookup?.kind === 'phrase'
      ? { start: lookup.tokenStart, end: lookup.tokenEnd }
      : lookup?.kind === 'sentence' && lookup.sentenceId
        ? (() => {
            const found = sentences.find((s) => s.id === lookup.sentenceId);
            if (!found || found.tokens.length === 0) return null;
            return { start: 0, end: found.tokens.length - 1 };
          })()
        : null;

  const onSentenceLayout = (sentenceId: string, event: LayoutChangeEvent) => {
    yBySentence.current[sentenceId] = event.nativeEvent.layout.y;
  };

  const closeLookup = () => {
    setLookup(null);
    setActiveSentenceId(null);
    setActiveTokenIndex(null);
    setSaved(false);
  };

  const dismissReaderTip = () => {
    setShowReaderTip(false);
    void markReaderTipSeen();
  };

  const onPressToken = async (sentence: Sentence, _token: Token, tokenIndex: number) => {
    if (!chapter) return;
    setHighlightId(sentence.id);
    setActiveSentenceId(sentence.id);
    setActiveTokenIndex(tokenIndex);
    await getProgressService(storyId ?? chapter.storyId).savePosition(chapter.id, sentence.id);

    const result = await getVocabularyService().openTap({
      sentence,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      tokenIndex,
    });
    setLookup(result);
    setSaved(await getVocabularyService().isSaved(result));
    const story = storyId ?? chapter.storyId;
    trackReadingEvent({ type: 'word_tapped', storyId: story, chapterId: chapter.id, sentenceId: sentence.id });
    trackReadingEvent({ type: 'dictionary_opened', storyId: story, chapterId: chapter.id, sentenceId: sentence.id });
    if (result.kind === 'phrase') {
      trackReadingEvent({
        type: 'phrase_lookup',
        storyId: story,
        chapterId: chapter.id,
        sentenceId: sentence.id,
        phraseId: result.phraseId,
      });
    } else if (result.kind === 'word') {
      trackReadingEvent({
        type: 'word_lookup',
        storyId: story,
        chapterId: chapter.id,
        sentenceId: sentence.id,
        lemmaId: result.lemmaId,
      });
    }
  };

  const detailedPassInstructions = progressRecord
    ? shouldUseDetailedPassInstructions(progressRecord)
    : true;
  const passCopy = passInstructionCopy(
    readerPass,
    chapter?.cefrTarget ?? 'A1',
    detailedPassInstructions,
  );
  const transitionCopy = readToListenTransitionCopy(detailedPassInstructions);
  const listenDoneCopy = listenCompleteCopy(detailedPassInstructions);
  const allowSentenceAudio = passGuidance === 'free' || readerPass === 'listen';

  const goToComprehension = async () => {
    if (!chapter) return;
    await getVocabularyService().recordChapterExposure(chapter);
    trackChapterWordsRead(chapter, storyId);
    router.push(comprehensionHref(storyId ?? chapter.storyId, chapter.id));
  };

  const finishListenPass = async () => {
    if (!chapter) return;
    const service = getProgressService(storyId ?? chapter.storyId);
    const passes = progressRecord?.passesByChapter?.[chapter.id] ?? {};
    if (!isListenPassComplete(passes)) {
      const nextProgress = await service.markListenPassComplete(chapter.id);
      setProgressRecord(nextProgress);
    }
    manualChapterStop.current = true;
    chapterAudioRunActive.current = false;
    audio.stop();
    syncAudioUi();
    setGuidedStep('listen-complete');
  };

  const finishReadPass = async () => {
    if (!chapter) return;
    const service = getProgressService(storyId ?? chapter.storyId);
    manualChapterStop.current = true;
    chapterAudioRunActive.current = false;
    audio.stop();
    syncAudioUi();
    const last = sentences[sentences.length - 1];
    if (last) {
      await service.savePosition(chapter.id, last.id);
    }
    const nextProgress = await service.markReadPassComplete(chapter.id);
    setProgressRecord(nextProgress);
    if (!hasAudio) {
      await service.markListenPassComplete(chapter.id);
      await goToComprehension();
      return;
    }
    if (detailedPassInstructions) {
      setGuidedStep('read-transition');
      return;
    }
    setReaderPass('listen');
    setScrollToY(0);
  };

  const startListenPass = () => {
    setReaderPass('listen');
    setGuidedStep('content');
    setScrollToY(0);
  };

  const continueFromChapter = async () => {
    if (!chapter) return;

    if (passGuidance === 'free') {
      const service = getProgressService(storyId ?? chapter.storyId);
      manualChapterStop.current = true;
      chapterAudioRunActive.current = false;
      audio.stop();
      syncAudioUi();
      const last = sentences[sentences.length - 1];
      if (last) {
        await service.savePosition(chapter.id, last.id);
      }
      await goToComprehension();
      return;
    }

    if (guidedStep === 'listen-complete') {
      await goToComprehension();
      return;
    }

    if (readerPass === 'read') {
      await finishReadPass();
      return;
    }

    await finishListenPass();
  };

  useEffect(() => {
    const chapterModeNow = audio.isChapterMode();
    const chapterJustCompleted =
      prevChapterMode.current &&
      !chapterModeNow &&
      !isPlaying &&
      chapterAudioRunActive.current &&
      !manualChapterStop.current;
    if (chapterJustCompleted) {
      trackReadingEvent({
        type: 'audio_completion',
        storyId: storyId ?? chapter?.storyId,
        chapterId: chapter?.id,
      });
      if (
        chapter?.id &&
        readerPass === 'listen' &&
        passGuidance === 'guided' &&
        guidedStep === 'content' &&
        storyId
      ) {
        void finishListenPass();
      }
      chapterAudioRunActive.current = false;
    }
    prevChapterMode.current = chapterModeNow;
  }, [isPlaying, chapterPlayback, chapter?.id, chapter?.storyId, readerPass, passGuidance, guidedStep, storyId]);

  const showAudioBar =
    guidedStep === 'content' && (passGuidance === 'free' || readerPass === 'listen');
  const showReadCompletionCta =
    guidedStep === 'content' && (passGuidance === 'free' || readerPass === 'read');
  const showPassBanner = guidedStep === 'content' && passGuidance === 'guided';

  if (!chapter) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Chapter', headerBackVisible: false }} />
        <Text style={[type.body, { color: colors.textSecondary }]}>
          This chapter is not available.
        </Text>
        <Pressable onPress={goToStories} style={{ marginTop: Spacing.md }}>
          <Text style={[type.label, { color: colors.tint }]}>Back to stories</Text>
        </Pressable>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Chapter' }} />
        <Text style={[type.body, { color: colors.danger }]}>{error}</Text>
        <Pressable onPress={goToStories} style={{ marginTop: Spacing.md }}>
          <Text style={[type.label, { color: colors.tint }]}>Back to stories</Text>
        </Pressable>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.readerSurface }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (passGuidance === 'guided' && guidedStep === 'read-transition') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.readerSurface }}>
        <Stack.Screen
          options={{
            title: `Capitolo ${chapter.number}`,
            headerBackVisible: false,
            headerStyle: { backgroundColor: colors.readerSurface },
            headerTintColor: colors.tint,
          }}
        />
        <ReaderReadToListenTransition
          phaseLabel={transitionCopy.phaseLabel}
          headline={transitionCopy.headline}
          body={transitionCopy.body}
          actionLabel={transitionCopy.actionLabel}
          onAction={startListenPass}
        />
      </View>
    );
  }

  if (passGuidance === 'guided' && guidedStep === 'listen-complete') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.readerSurface }}>
        <Stack.Screen
          options={{
            title: `Capitolo ${chapter.number}`,
            headerBackVisible: false,
            headerStyle: { backgroundColor: colors.readerSurface },
            headerTintColor: colors.tint,
          }}
        />
        <ReaderListenComplete
          phaseLabel={listenDoneCopy.phaseLabel}
          headline={listenDoneCopy.headline}
          body={listenDoneCopy.body}
          continueLabel={listenDoneCopy.continueLabel}
          onContinue={() => void continueFromChapter()}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.readerSurface }}>
      <Stack.Screen
        options={{
          title: `Capitolo ${chapter.number}`,
          headerBackVisible: false,
          headerStyle: { backgroundColor: colors.readerSurface },
          headerTintColor: colors.tint,
          headerTitleStyle: {
            fontFamily: 'Literata_500Medium',
            color: colors.text,
            fontSize: type.label.fontSize,
          },
          headerLeft: () => (
            <Pressable
              onPress={goToStories}
              accessibilityRole="button"
              accessibilityLabel="Back to stories"
              hitSlop={12}
              style={({ pressed }) => [
                styles.headerBack,
                { opacity: pressed ? 0.7 : 1, minHeight: minTouchTarget },
              ]}>
              <SymbolView
                name={{
                  ios: 'chevron.left',
                  android: 'arrow_back',
                  web: 'arrow_back',
                }}
                tintColor={colors.tint}
                size={22}
              />
              <Text style={[type.label, { color: colors.tint }]}>Stories</Text>
            </Pressable>
          ),
        }}
      />

      <ProgressBar progress={scrollProgress} height={3} />

      {showPassBanner ? (
        <ReaderPassBanner copy={passCopy} detailed={detailedPassInstructions} />
      ) : null}

      <StoryReader
        chapter={chapter}
        highlightedSentenceId={highlightId}
        initialScrollOffset={scrollToY}
        activeSentenceId={activeSentenceId}
        activeTokenIndex={activeTokenIndex}
        activePhraseRange={phraseRange}
        playingSentenceId={playingId}
        hasAudio={(sentence) => !!audio.sentenceAudio(sentence)}
        onPlayAudio={async (sentence) => {
          if (!allowSentenceAudio) return;
          if (playingId === sentence.id && audio.isPlaying()) {
            audio.pause();
            syncAudioUi();
            return;
          }
          const replay = playingId === sentence.id;
          if (replay) {
            const nextCount = (replayCountBySentence.current[sentence.id] ?? 0) + 1;
            replayCountBySentence.current[sentence.id] = nextCount;
            trackReadingEvent({
              type: 'sentence_replay_count',
              storyId: storyId ?? chapter.storyId,
              chapterId: chapter.id,
              sentenceId: sentence.id,
              meta: { count: nextCount, source: 'sentence' },
            });
          }
          setHighlightId(sentence.id);
          const result = await audio.playSentence(sentence);
          if (result.played) setHighlightId(sentence.id);
          syncAudioUi();
        }}
        onSentenceLayout={onSentenceLayout}
        onPressToken={onPressToken}
        onPressSentenceBackground={async (sentence) => {
          setHighlightId(sentence.id);
          setActiveSentenceId(sentence.id);
          setActiveTokenIndex(null);
          await getProgressService(storyId ?? chapter.storyId).savePosition(chapter.id, sentence.id);
          const result = getVocabularyService().lookupSentence(
            sentence,
            chapter.id,
            chapter.number,
          );
          setLookup(result);
          setSaved(false);
          trackReadingEvent({
            type: 'dictionary_opened',
            storyId: storyId ?? chapter.storyId,
            chapterId: chapter.id,
            sentenceId: sentence.id,
          });
        }}
        showCompletionCta={showReadCompletionCta}
        completionHint={
          passGuidance === 'guided' && readerPass === 'read'
            ? passCopy.body
            : 'Finished reading?'
        }
        completionButtonLabel={
          passGuidance === 'guided' && readerPass === 'read'
            ? passCopy.continueLabel
            : 'Continue'
        }
        onContinueFromChapter={() => void continueFromChapter()}
        onScrollProgress={setScrollProgress}
      />

      {showReaderTip && readerPass === 'read' ? (
        <View
          style={[
            styles.tip,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[type.caption, { color: colors.textSecondary, flex: 1 }]}>
            Tap a word for help · Tap a sentence for English
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss tip"
            onPress={dismissReaderTip}
            hitSlop={8}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <Text style={[type.label, { color: colors.tint }]}>Got it</Text>
          </Pressable>
        </View>
      ) : null}

      {showAudioBar ? (
      <ReaderAudioBar
        hasAudio={hasAudio}
        isPlaying={isPlaying}
        isChapterMode={isChapterMode}
        chapterProgress={chapterPlayback}
        speed={audioSpeed}
        continueLabel={
          passGuidance === 'guided' && readerPass === 'listen'
            ? passCopy.continueLabel
            : 'Continue'
        }
        onPlayPause={() => {
          if (!isPlaying) {
            manualChapterStop.current = false;
            chapterAudioRunActive.current = true;
            trackReadingEvent({
              type: 'audio_starts',
              storyId: storyId ?? chapter.storyId,
              chapterId: chapter.id,
              meta: { source: isChapterMode ? 'chapter_resume' : 'chapter_start' },
            });
          }
          void audio.playChapter(sentences, chapter.id).then(() => syncAudioUi());
        }}
        onStop={() => {
          manualChapterStop.current = true;
          chapterAudioRunActive.current = false;
          audio.stop();
          syncAudioUi();
        }}
        onRestart={() => {
          manualChapterStop.current = false;
          chapterAudioRunActive.current = true;
          trackReadingEvent({
            type: 'audio_starts',
            storyId: storyId ?? chapter.storyId,
            chapterId: chapter.id,
            meta: { source: 'chapter_restart' },
          });
          void audio.restartChapter(sentences, chapter.id).then(() => syncAudioUi());
        }}
        onSetSpeed={(next) => {
          if (next !== audioSpeed) {
            trackReadingEvent({
              type: 'speed_change',
              storyId: storyId ?? chapter.storyId,
              chapterId: chapter.id,
              meta: { fromSpeed: audioSpeed, toSpeed: next },
            });
          }
          void audio.setSpeed(next).then(() => syncAudioUi());
        }}
        onContinueFromChapter={() => void continueFromChapter()}
      />
      ) : null}

      <DictionarySheet
        lookup={lookup}
        saved={saved}
        canPronounce={
          !!lookup &&
          (lookup.kind === 'sentence'
            ? (() => {
                const spoken = sentences.find((s) => s.id === lookup.sentenceId);
                return !!spoken && !!audio.sentenceAudio(spoken);
              })()
            : !!(
                audio.wordAudio(lookup.surface) ||
                (lookup.kind === 'phrase' && audio.phraseAudio(lookup.surface))
              ))
        }
        onPronounce={() => {
          if (!lookup) return;
          trackReadingEvent({
            type: lookup.kind === 'sentence' ? 'sentence_replayed' : 'audio_played',
            storyId: storyId ?? chapter.storyId,
            chapterId: chapter.id,
            sentenceId: lookup.kind === 'sentence' ? lookup.sentenceId : undefined,
            meta: { source: 'dictionary', kind: lookup.kind },
          });
          if (lookup.kind === 'sentence') {
            const spoken = sentences.find((s) => s.id === lookup.sentenceId);
            if (spoken) void audio.playSentence(spoken);
            return;
          }
          if (lookup.kind === 'phrase') void audio.playPhrase(lookup.surface);
          else void audio.playWord(lookup.surface);
        }}
        onClose={closeLookup}
        onSave={async () => {
          if (!lookup) return;
          await getVocabularyService().saveLookup(lookup);
          setSaved(true);
          if (lookup.kind === 'phrase') {
            trackReadingEvent({
              type: 'phrase_saved',
              storyId: storyId ?? chapter.storyId,
              chapterId: chapter.id,
              phraseId: lookup.phraseId,
            });
          } else if (lookup.kind === 'word') {
            trackReadingEvent({
              type: 'word_saved',
              storyId: storyId ?? chapter.storyId,
              chapterId: chapter.id,
              lemmaId: lookup.lemmaId,
            });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingRight: Spacing.sm,
    minHeight: 44,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.readerHorizontal,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
