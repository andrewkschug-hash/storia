import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { GlobalLanguageHeader } from '@/src/components/GlobalLanguageHeader';
import { ScreenContent } from '@/src/components/ScreenContent';
import {
  GrammarDetailModal,
  GrammarEntry,
  NotebookEmptyState,
  NotebookFilterSheet,
  NotebookHeader,
  NotebookReviewStrip,
  NotebookTabs,
  NotebookToolbar,
  PhraseEntry,
  VerbDetailSheet,
  WordEntry,
  type NotebookTab,
} from '@/src/components/notebook';
import { getContentBundle, LUCA_STORY_ID } from '@/src/content';
import { grammarNoteForBatch, type GrammarNote } from '@/src/content/lessonBatches';
import { readerHref } from '@/src/content/storyHrefs';
import { navLog } from '@/src/navigation/diagnostics';
import { usePeekProgress } from '@/src/progress/usePeekProgress';
import { Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';
import { browseVocabulary } from '@/src/vocabulary/catalog';
import {
  NOTEBOOK_GRAMMAR_INSIGHTS,
  NOTEBOOK_PHRASES,
  type NotebookGrammarInsight,
} from '@/src/vocabulary/notebookData';
import {
  filterNotebookGrammar,
  filterNotebookPhrases,
  filterNotebookWords,
  getReadingFootprint,
  groupPhrasesByChronology,
  groupWordsByChronology,
  type GrammarFilterState,
  type PhrasesFilterState,
  type WordsFilterState,
} from '@/src/vocabulary/notebookSelectors';
import { getVerbPattern, type NotebookVerbPattern } from '@/src/vocabulary/notebookVerbs';
import { useVocabulary } from '@/src/vocabulary/useVocabulary';
import { useYourItalian } from '@/src/vocabulary/useYourItalian';
import { getVocabularyService } from '@/src/vocabulary';
import { speakItalian } from '@/src/walkthrough/speakItalian';

function chapterIdForNumber(n: number): string {
  return n < 10 ? `luca-a-roma-0${n}` : `luca-a-roma-${n}`;
}

export default function VocabularyScreen() {
  const { colors, type } = useTheme();
  const insets = useSafeAreaInsets();
  const { progress, refresh: refreshProgress } = usePeekProgress();
  const { practiceItems, loading: italianLoading, refresh: refreshItalian } =
    useYourItalian(progress);
  const { state: vocabState, refresh: refreshVocab } = useVocabulary(progress);

  // Active Notebook Lens: Words | Phrases | Grammar
  const [activeTab, setActiveTab] = useState<NotebookTab>('words');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Filter States per Lens
  const [wordsFilter, setWordsFilter] = useState<WordsFilterState>({
    search: '',
    pos: 'all',
    status: 'all',
    chapterRange: 'all',
    savedOnly: false,
  });

  const [phrasesFilter, setPhrasesFilter] = useState<PhrasesFilterState>({
    search: '',
    speaker: 'ALL',
    chapterRange: 'all',
    savedOnly: false,
  });

  const [grammarFilter, setGrammarFilter] = useState<GrammarFilterState>({
    search: '',
    level: 'all',
    chapterRange: 'all',
  });

  // Modal / Sheet States
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [selectedVerb, setSelectedVerb] = useState<NotebookVerbPattern | null>(null);
  const [selectedGrammar, setSelectedGrammar] = useState<{
    insight: NotebookGrammarInsight;
    note: GrammarNote | null;
  } | null>(null);

  // Optimistic saved map
  const [optimisticSaved, setOptimisticSaved] = useState<Record<string, boolean>>({});

  const bundle = useMemo(() => getContentBundle(LUCA_STORY_ID), []);

  useFocusEffect(
    useCallback(() => {
      navLog('notebook focus');
      void refreshProgress();
      void refreshItalian();
      void refreshVocab();
    }, [refreshItalian, refreshProgress, refreshVocab]),
  );

  useEffect(() => {
    navLog('notebook mount');
    return () => navLog('notebook unmount');
  }, []);

  const practiceCount = practiceItems.length;

  // Derive highest chapter reached
  const highestChapter = useMemo(() => {
    const match = progress?.currentChapterId?.match(/\d+$/);
    const fromProgress = match ? parseInt(match[0], 10) : 1;
    const completedCount = progress?.completedChapterIds?.length ?? 0;
    return Math.max(1, fromProgress, completedCount);
  }, [progress]);

  // Audio speech handler
  const handlePlayAudio = useCallback(async (id: string, text: string) => {
    try {
      setSpeakingId(id);
      await speakItalian(text);
    } catch {
      // Graceful fallback if speech synthesis is unavailable
    } finally {
      setSpeakingId(null);
    }
  }, []);

  // Toggle save handler
  const handleToggleSave = useCallback(
    async (kind: 'lemma' | 'phrase', id: string, currentSaved: boolean) => {
      const nextSaved = !currentSaved;
      setOptimisticSaved((prev) => ({ ...prev, [`${kind}:${id}`]: nextSaved }));
      try {
        await getVocabularyService().toggleSaved(kind, id);
        void refreshVocab();
      } catch (err) {
        console.error('Failed to toggle save', err);
        setOptimisticSaved((prev) => ({ ...prev, [`${kind}:${id}`]: currentSaved }));
      }
    },
    [refreshVocab],
  );

  // Reader chapter navigation handler
  const handleNavigateChapter = useCallback((chapterNum: number) => {
    const cid = chapterIdForNumber(chapterNum);
    router.push(readerHref(LUCA_STORY_ID, cid));
  }, []);

  // All catalog items derived from user vocabulary state
  const catalogItems = useMemo(() => {
    if (!vocabState) return [];
    const browsed = browseVocabulary(bundle, vocabState);
    const combined = [
      ...browsed.learning,
      ...browsed.familiar,
      ...browsed.mastered,
      ...browsed.saved,
    ];
    // Deduplicate
    const seen = new Set<string>();
    const unique: typeof combined = [];
    for (const item of combined) {
      const key = `${item.kind}:${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    return unique;
  }, [bundle, vocabState]);

  // Reading footprint milestone
  const footprint = useMemo(() => {
    return getReadingFootprint(catalogItems.length, highestChapter);
  }, [catalogItems.length, highestChapter]);

  // Filtered & grouped items
  const filteredWords = useMemo(() => {
    return filterNotebookWords(catalogItems, wordsFilter, optimisticSaved);
  }, [catalogItems, wordsFilter, optimisticSaved]);

  const wordSections = useMemo(() => {
    return groupWordsByChronology(filteredWords);
  }, [filteredWords]);

  const filteredPhrases = useMemo(() => {
    return filterNotebookPhrases(NOTEBOOK_PHRASES, phrasesFilter, optimisticSaved);
  }, [phrasesFilter, optimisticSaved]);

  const phraseSections = useMemo(() => {
    return groupPhrasesByChronology(filteredPhrases);
  }, [filteredPhrases]);

  const filteredGrammar = useMemo(() => {
    return filterNotebookGrammar(NOTEBOOK_GRAMMAR_INSIGHTS, grammarFilter);
  }, [grammarFilter]);

  // Check if active filters exist for the current lens
  const hasActiveFilters = useMemo(() => {
    if (activeTab === 'words') {
      return (
        wordsFilter.pos !== 'all' ||
        wordsFilter.status !== 'all' ||
        wordsFilter.chapterRange !== 'all' ||
        wordsFilter.savedOnly
      );
    }
    if (activeTab === 'phrases') {
      return (
        phrasesFilter.speaker !== 'ALL' ||
        phrasesFilter.chapterRange !== 'all' ||
        phrasesFilter.savedOnly
      );
    }
    if (activeTab === 'grammar') {
      return grammarFilter.level !== 'all' || grammarFilter.chapterRange !== 'all';
    }
    return false;
  }, [activeTab, wordsFilter, phrasesFilter, grammarFilter]);

  // Open verb detail sheet
  const handleOpenVerbDetail = useCallback((lemmaId: string) => {
    const pattern = getVerbPattern(lemmaId);
    if (pattern) {
      setSelectedVerb(pattern);
    }
  }, []);

  // Open grammar detail modal
  const handleOpenGrammarDetail = useCallback((insight: NotebookGrammarInsight) => {
    const note = grammarNoteForBatch(insight.chapterRange.start, insight.chapterRange.end, LUCA_STORY_ID);
    setSelectedGrammar({ insight, note });
  }, []);

  return (
    <AtmosphereBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: insets.bottom + Spacing.xl * 2,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={760}>
          <GlobalLanguageHeader breadcrumb="Italian · Notebook" />

          {/* PAGE IDENTITY */}
          <NotebookHeader footprintLabel={footprint.label} />

          {/* COMPACT REVIEW STRIP (CONDITIONAL) */}
          {practiceCount > 0 ? (
            <NotebookReviewStrip
              count={practiceCount}
              onPress={() => router.push('/practice' as Href)}
            />
          ) : null}

          {/* 3 LENSES TABS */}
          <NotebookTabs
            active={activeTab}
            onChange={setActiveTab}
            counts={{
              words: catalogItems.length,
              phrases: NOTEBOOK_PHRASES.length,
              grammar: NOTEBOOK_GRAMMAR_INSIGHTS.length,
            }}
          />

          {/* CONTEXTUAL TOOLBAR */}
          <NotebookToolbar
            search={
              activeTab === 'words'
                ? wordsFilter.search
                : activeTab === 'phrases'
                  ? phrasesFilter.search
                  : grammarFilter.search
            }
            onSearchChange={(text) => {
              if (activeTab === 'words') setWordsFilter((prev) => ({ ...prev, search: text }));
              else if (activeTab === 'phrases')
                setPhrasesFilter((prev) => ({ ...prev, search: text }));
              else setGrammarFilter((prev) => ({ ...prev, search: text }));
            }}
            placeholder={
              activeTab === 'words'
                ? 'Search words in Italian or English…'
                : activeTab === 'phrases'
                  ? 'Search memorable phrases…'
                  : 'Search grammar patterns…'
            }
            onOpenFilter={() => setFilterSheetVisible(true)}
            hasActiveFilters={hasActiveFilters}
            savedOnly={
              activeTab === 'words'
                ? wordsFilter.savedOnly
                : activeTab === 'phrases'
                  ? phrasesFilter.savedOnly
                  : undefined
            }
            onToggleSaved={
              activeTab === 'words'
                ? () => setWordsFilter((prev) => ({ ...prev, savedOnly: !prev.savedOnly }))
                : activeTab === 'phrases'
                  ? () => setPhrasesFilter((prev) => ({ ...prev, savedOnly: !prev.savedOnly }))
                  : undefined
            }
          />

          {/* FEED CONTENT */}
          {italianLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.tint} size="large" />
              <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
                Opening your notebook…
              </Text>
            </View>
          ) : (
            <View style={styles.feedContainer}>
              {/* ============================================================ */}
              {/* LENS 1: WORDS */}
              {/* ============================================================ */}
              {activeTab === 'words' && (
                <View>
                  {catalogItems.length === 0 ? (
                    <NotebookEmptyState
                      onStartReading={() =>
                        router.push(readerHref(LUCA_STORY_ID, 'luca-a-roma-01'))
                      }
                    />
                  ) : filteredWords.length === 0 ? (
                    <NotebookEmptyState
                      onStartReading={() =>
                        router.push(readerHref(LUCA_STORY_ID, 'luca-a-roma-01'))
                      }
                      filteredMessage={`No words matching "${wordsFilter.search}" in this filter.`}
                    />
                  ) : (
                    wordSections.map((sec) => (
                      <View key={sec.id} style={styles.sectionBlock}>
                        <Text style={[styles.sectionHeaderTitle, { color: colors.textMuted }]}>
                          {sec.title} ({sec.items.length})
                        </Text>
                        {sec.items.map((item) => {
                          const optKey = `${item.kind}:${item.id}`;
                          const isSaved =
                            optimisticSaved[optKey] !== undefined
                              ? optimisticSaved[optKey]
                              : item.saved;

                          return (
                            <WordEntry
                              key={`${item.kind}:${item.id}`}
                              item={item}
                              bundle={bundle}
                              isSaved={isSaved}
                              isSpeaking={speakingId === `word:${item.id}`}
                              onPlayAudio={handlePlayAudio}
                              onToggleSave={handleToggleSave}
                              onNavigateChapter={handleNavigateChapter}
                              onOpenVerbDetail={handleOpenVerbDetail}
                            />
                          );
                        })}
                      </View>
                    ))
                  )}
                </View>
              )}

              {/* ============================================================ */}
              {/* LENS 2: PHRASES */}
              {/* ============================================================ */}
              {activeTab === 'phrases' && (
                <View>
                  {filteredPhrases.length === 0 ? (
                    <NotebookEmptyState
                      onStartReading={() =>
                        router.push(readerHref(LUCA_STORY_ID, 'luca-a-roma-01'))
                      }
                      filteredMessage="No phrases matching this filter."
                    />
                  ) : (
                    phraseSections.map((sec) => (
                      <View key={sec.id} style={styles.sectionBlock}>
                        <Text style={[styles.sectionHeaderTitle, { color: colors.textMuted }]}>
                          {sec.title} ({sec.items.length})
                        </Text>
                        {sec.items.map((phrase) => {
                          const isSaved = optimisticSaved[`phrase:${phrase.id}`] ?? false;

                          return (
                            <PhraseEntry
                              key={phrase.id}
                              phrase={phrase}
                              isSaved={isSaved}
                              isSpeaking={speakingId === `phrase:${phrase.id}`}
                              onPlayAudio={handlePlayAudio}
                              onToggleSave={handleToggleSave}
                              onNavigateChapter={handleNavigateChapter}
                            />
                          );
                        })}
                      </View>
                    ))
                  )}
                </View>
              )}

              {/* ============================================================ */}
              {/* LENS 3: GRAMMAR */}
              {/* ============================================================ */}
              {activeTab === 'grammar' && (
                <View>
                  {filteredGrammar.length === 0 ? (
                    <NotebookEmptyState
                      onStartReading={() =>
                        router.push(readerHref(LUCA_STORY_ID, 'luca-a-roma-01'))
                      }
                      filteredMessage="No grammar patterns matching this filter."
                    />
                  ) : (
                    <View style={styles.sectionBlock}>
                      <Text style={[styles.sectionHeaderTitle, { color: colors.textMuted }]}>
                        GRAMMAR YOU&apos;VE NOTICED ({filteredGrammar.length})
                      </Text>
                      {filteredGrammar.map((insight) => (
                        <GrammarEntry
                          key={insight.id}
                          insight={insight}
                          onOpenDetail={handleOpenGrammarDetail}
                          onNavigateChapter={handleNavigateChapter}
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </ScreenContent>
      </ScrollView>

      {/* FILTER BOTTOM SHEET */}
      <NotebookFilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        lens={activeTab}
        wordsFilter={wordsFilter}
        onWordsFilterChange={setWordsFilter}
        phrasesFilter={phrasesFilter}
        onPhrasesFilterChange={setPhrasesFilter}
        grammarFilter={grammarFilter}
        onGrammarFilterChange={setGrammarFilter}
      />

      {/* VERB CONJUGATION DETAIL SHEET */}
      <VerbDetailSheet
        verb={selectedVerb}
        visible={selectedVerb !== null}
        onClose={() => setSelectedVerb(null)}
        onPlayAudio={handlePlayAudio}
        onNavigateChapter={handleNavigateChapter}
      />

      {/* GRAMMAR LESSON DETAIL MODAL */}
      <GrammarDetailModal
        insight={selectedGrammar?.insight ?? null}
        note={selectedGrammar?.note ?? null}
        visible={selectedGrammar !== null}
        onClose={() => setSelectedGrammar(null)}
        onNavigateChapter={handleNavigateChapter}
      />
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedContainer: {
    marginTop: Spacing.xs,
  },
  sectionBlock: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontFamily: 'Literata_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
});
