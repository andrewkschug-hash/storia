import { Stack, router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
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
import { StoryReader } from '@/src/components/StoryReader';
import { getAdaptiveService } from '@/src/adaptive';
import { getAudioCatalog, getAudioService } from '@/src/audio';
import { refreshCatalogFromGateway } from '@/src/audio/AudioService';
import { getChapter, getContentBundle } from '@/src/content';
import { buildChapterRecap } from '@/src/content/chapterRecap';
import type { Chapter, Sentence, Token } from '@/src/content/schemas';
import { getProgressService } from '@/src/progress';
import { hasSeenReaderTip, markReaderTipSeen } from '@/src/reader/storage';
import { getVocabularyService } from '@/src/vocabulary';
import type { DictionaryLookup } from '@/src/vocabulary/types';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function ReaderScreen() {
  const { chapterId, listen } = useLocalSearchParams<{ chapterId: string; listen?: string }>();
  const { colors } = useTheme();
  const authored = getChapter(chapterId);
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
  const [audioSpeed, setAudioSpeed] = useState<'normal' | 'slow'>('normal');
  const [isPlaying, setIsPlaying] = useState(false);
  const [chapterPlayback, setChapterPlayback] = useState<{ current: number; total: number } | null>(
    null,
  );
  const [audioCatalogVersion, setAudioCatalogVersion] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showReaderTip, setShowReaderTip] = useState(false);
  const autoplayRequested = useRef(listen === '1');
  const audio = getAudioService();

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
        const service = getProgressService();
        const progress = await service.openChapter(authored.id);
        const adapted = await getAdaptiveService().resolveChapter(authored, progress);
        audio.setChapterContext(authored.id);
        await syncCatalog();
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
      void getProgressService().addReadingTime(elapsed);
      audio.stop();
      audio.setOnChange(null);
    };
  }, [authored, syncCatalog]);

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

  const sentences = useMemo(() => {
    if (!chapter) return [] as Sentence[];
    return chapter.paragraphs.flatMap((p) => p.sentences);
  }, [chapter]);

  const hasAudio = useMemo(() => {
    return sentences.some((s) => audio.sentenceAudio(s));
  }, [sentences, audioCatalogVersion]);

  const chapterRecap = useMemo(() => {
    if (!chapter) return null;
    return buildChapterRecap(chapter, getContentBundle().lexiconById);
  }, [chapter]);

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
    await getProgressService().savePosition(chapter.id, sentence.id);

    const result = await getVocabularyService().openTap({
      sentence,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      tokenIndex,
    });
    setLookup(result);
    setSaved(await getVocabularyService().isSaved(result));
  };

  const lastSentenceId = sentences[sentences.length - 1]?.id ?? null;
  const atChapterEnd = Boolean(highlightId && lastSentenceId && highlightId === lastSentenceId);

  const openRecap = async () => {
    if (!chapter) return;
    audio.stop();
    syncAudioUi();
    const last = sentences[sentences.length - 1];
    if (last) {
      await getProgressService().savePosition(chapter.id, last.id);
    }
    router.push(`/recap/${chapter.id}` as Href);
  };

  if (!chapter) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Chapter' }} />
        <Text style={[Typography.body, { color: colors.textSecondary }]}>
          This chapter is not available.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Chapter' }} />
        <Text style={[Typography.body, { color: colors.danger }]}>{error}</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: Spacing.md }}>
          <Text style={[Typography.label, { color: colors.tint }]}>Go back</Text>
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.readerSurface }}>
      <Stack.Screen
        options={{
          title: `Capitolo ${chapter.number}`,
          headerStyle: { backgroundColor: colors.readerSurface },
          headerTintColor: colors.tint,
          headerTitleStyle: {
            fontFamily: 'Literata_500Medium',
            color: colors.text,
            fontSize: 16,
          },
        }}
      />

      <ProgressBar progress={scrollProgress} height={3} />

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
          if (playingId === sentence.id && audio.isPlaying()) {
            audio.pause();
            syncAudioUi();
            return;
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
          await getProgressService().savePosition(chapter.id, sentence.id);
          const result = getVocabularyService().lookupSentence(
            sentence,
            chapter.id,
            chapter.number,
          );
          setLookup(result);
          setSaved(false);
        }}
        chapterRecap={chapterRecap}
        showCompletionCta={atChapterEnd}
        onOpenRecap={() => void openRecap()}
        onScrollProgress={setScrollProgress}
      />

      {showReaderTip ? (
        <View
          style={[
            styles.tip,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
            Tap a word for help · Tap a sentence for English
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss tip"
            onPress={dismissReaderTip}
            hitSlop={8}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <Text style={[Typography.label, { color: colors.tint }]}>Got it</Text>
          </Pressable>
        </View>
      ) : null}

      <ReaderAudioBar
        hasAudio={hasAudio}
        isPlaying={isPlaying}
        isChapterMode={audio.isChapterMode()}
        chapterProgress={chapterPlayback}
        speed={audioSpeed}
        onPlayPause={() => {
          void audio.playChapter(sentences, chapter.id).then(() => syncAudioUi());
        }}
        onStop={() => {
          audio.stop();
          syncAudioUi();
        }}
        onSetSpeed={(next) => {
          void audio.setSpeed(next).then(() => syncAudioUi());
        }}
        onOpenRecap={() => void openRecap()}
      />

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
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
