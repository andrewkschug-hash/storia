import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { Radii, Spacing } from '@/src/theme/tokens';
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
  groupWordsByPartOfSpeech,
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
    groupBy: 'chronology',
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
    let maxChapter = 1;
    if (progress?.currentChapterId) {
      const match = progress.currentChapterId.match(/\d+$/);
      if (match) maxChapter = Math.max(maxChapter, parseInt(match[0], 10));
    }
    if (progress?.completedChapterIds) {
      for (const id of progress.completedChapterIds) {
        const match = id.match(/\d+$/);
        if (match) maxChapter = Math.max(maxChapter, parseInt(match[0], 10));
      }
    }
    return maxChapter;
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
    if (wordsFilter.groupBy === 'part_of_speech') {
      return groupWordsByPartOfSpeech(filteredWords);
    }
    return groupWordsByChronology(filteredWords);
  }, [filteredWords, wordsFilter.groupBy]);

  const availablePhrases = useMemo(() => {
    return NOTEBOOK_PHRASES.filter((p) => p.chapterNumber <= highestChapter);
  }, [highestChapter]);

  const availableGrammar = useMemo(() => {
    return NOTEBOOK_GRAMMAR_INSIGHTS.filter((g) => g.chapterRange.start <= highestChapter);
  }, [highestChapter]);

  const filteredPhrases = useMemo(() => {
    return filterNotebookPhrases(NOTEBOOK_PHRASES, phrasesFilter, optimisticSaved, highestChapter);
  }, [phrasesFilter, optimisticSaved, highestChapter]);

  const phraseSections = useMemo(() => {
    return groupPhrasesByChronology(filteredPhrases);
  }, [filteredPhrases]);

  const filteredGrammar = useMemo(() => {
    return filterNotebookGrammar(NOTEBOOK_GRAMMAR_INSIGHTS, grammarFilter, highestChapter);
  }, [grammarFilter, highestChapter]);

  // Check if active filters exist for the current lens
  const hasActiveFilters = useMemo(() => {
    if (activeTab === 'words') {
      return (
        wordsFilter.pos !== 'all' ||
        wordsFilter.status !== 'all' ||
        wordsFilter.chapterRange !== 'all' ||
        wordsFilter.savedOnly ||
        wordsFilter.groupBy !== 'chronology'
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
              phrases: availablePhrases.length,
              grammar: availableGrammar.length,
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
                  {/* QUICK POS & GROUPING BAR */}
                  {catalogItems.length > 0 ? (
                    <View style={styles.posPillBar}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.posPillContent}>
                        {(
                          [
                            { id: 'all', label: 'All' },
                            { id: 'verb', label: 'Verbs (Azioni)' },
                            { id: 'noun', label: 'Nouns (Sostantivi)' },
                            { id: 'adjective', label: 'Describing (Aggettivi)' },
                            { id: 'adverb', label: 'Adverbs (Avverbi)' },
                          ] as const
                        ).map((chip) => {
                          const isSelected = wordsFilter.pos === chip.id;
                          return (
                            <Pressable
                              key={chip.id}
                              onPress={() =>
                                setWordsFilter((prev) => ({ ...prev, pos: chip.id }))
                              }
                              style={[
                                styles.posPill,
                                {
                                  backgroundColor: isSelected
                                    ? colors.tint
                                    : colors.backgroundElevated,
                                  borderColor: isSelected ? colors.tint : colors.border,
                                },
                              ]}>
                              <Text
                                style={[
                                  styles.posPillText,
                                  { color: isSelected ? colors.onTint : colors.textSecondary },
                                ]}>
                                {chip.label}
                              </Text>
                            </Pressable>
                          );
                        })}

                        <View style={[styles.posPillDivider, { backgroundColor: colors.border }]} />

                        {/* Group By Toggle */}
                        <Pressable
                          onPress={() =>
                            setWordsFilter((prev) => ({
                              ...prev,
                              groupBy:
                                prev.groupBy === 'part_of_speech' ? 'chronology' : 'part_of_speech',
                            }))
                          }
                          style={[
                            styles.posPill,
                            styles.groupByPill,
                            {
                              backgroundColor:
                                wordsFilter.groupBy === 'part_of_speech'
                                  ? 'rgba(120, 182, 163, 0.15)'
                                  : colors.backgroundElevated,
                              borderColor:
                                wordsFilter.groupBy === 'part_of_speech'
                                  ? colors.tint
                                  : colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.posPillText,
                              {
                                color:
                                  wordsFilter.groupBy === 'part_of_speech'
                                    ? colors.tint
                                    : colors.textSecondary,
                                fontFamily: 'Literata_600SemiBold',
                              },
                            ]}>
                            {wordsFilter.groupBy === 'part_of_speech'
                              ? '📑 Grouped by Type'
                              : '⏱ Timeline'}
                          </Text>
                        </Pressable>
                      </ScrollView>
                    </View>
                  ) : null}

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
  posPillBar: {
    marginBottom: Spacing.md,
  },
  posPillContent: {
    gap: Spacing.xs + 2,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  posPill: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  posPillText: {
    fontFamily: 'Literata_500Medium',
    fontSize: 12,
  },
  posPillDivider: {
    width: 1,
    height: 18,
    marginHorizontal: Spacing.xs,
  },
  groupByPill: {
    borderWidth: 1.5,
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
