import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { GlobalLanguageHeader } from '@/src/components/GlobalLanguageHeader';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenContent } from '@/src/components/ScreenContent';
import {
  GrammarInsightsCarousel,
  NotebookTabs,
  PhrasesSpotlightCarousel,
  VerbDetailCard,
  type NotebookTab,
  type VerbTense,
} from '@/src/components/notebook';
import { getContentBundle, LUCA_STORY_ID } from '@/src/content';
import { grammarNoteForBatch, type GrammarNote } from '@/src/content/lessonBatches';
import { readerHref } from '@/src/content/storyHrefs';
import { navLog } from '@/src/navigation/diagnostics';
import { usePeekProgress } from '@/src/progress/usePeekProgress';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useLayout } from '@/src/theme/useLayout';
import { useTheme } from '@/src/theme/useTheme';
import { browseVocabulary, type VocabBrowseItem } from '@/src/vocabulary/catalog';
import {
  getNarrativeAnnotation,
  NOTEBOOK_GRAMMAR_INSIGHTS,
  NOTEBOOK_PHRASES,
  type NotebookPhrase,
} from '@/src/vocabulary/notebookData';
import {
  NOTEBOOK_VERB_PATTERNS,
  type NotebookVerbPattern,
} from '@/src/vocabulary/notebookVerbs';
import { findExamplesForLemma } from '@/src/vocabulary/storyExamples';
import { useVocabulary } from '@/src/vocabulary/useVocabulary';
import { useYourItalian } from '@/src/vocabulary/useYourItalian';
import { getVocabularyService } from '@/src/vocabulary';
import { speakItalian } from '@/src/walkthrough/speakItalian';

type StatusFilter = 'all' | 'saved' | 'learning' | 'familiar' | 'mastered';
type PhraseSpeakerFilter = 'ALL' | 'Luca' | 'Marco' | 'Giulia' | 'Signora Maria' | 'SAVED';

const GRAMMAR_BATCH_RANGES = [
  { start: 1, end: 5, level: 'A1' },
  { start: 6, end: 10, level: 'A1' },
  { start: 11, end: 15, level: 'A1' },
  { start: 16, end: 20, level: 'A1' },
  { start: 21, end: 25, level: 'A2' },
  { start: 26, end: 30, level: 'A2' },
  { start: 31, end: 35, level: 'A2' },
  { start: 36, end: 40, level: 'A2' },
  { start: 41, end: 45, level: 'A2' },
  { start: 46, end: 50, level: 'A2' },
  { start: 51, end: 55, level: 'A2' },
  { start: 56, end: 60, level: 'B1+' },
  { start: 61, end: 65, level: 'B1+' },
  { start: 66, end: 70, level: 'B1+' },
] as const;

function chapterIdForNumber(n: number): string {
  return n < 10 ? `luca-a-roma-0${n}` : `luca-a-roma-${n}`;
}

export default function VocabularyScreen() {
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { progress, refresh: refreshProgress } = usePeekProgress();
  const { summary, practiceItems, loading: italianLoading, refresh: refreshItalian } =
    useYourItalian(progress);
  const { state: vocabState, refresh: refreshVocab } = useVocabulary(progress);

  const [activeTab, setActiveTab] = useState<NotebookTab>('vocabulary');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Vocabulary Tab State
  const [vocabSearch, setVocabSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [vocabPageSize, setVocabPageSize] = useState(30);

  // Phrases Tab State
  const [phraseSearch, setPhraseSearch] = useState('');
  const [phraseSpeaker, setPhraseSpeaker] = useState<PhraseSpeakerFilter>('ALL');

  // Grammar Tab State
  const [grammarLevel, setGrammarLevel] = useState<'ALL' | 'A1' | 'A2' | 'B1+'>('ALL');
  const [grammarSearch, setGrammarSearch] = useState('');
  const [expandedGrammarId, setExpandedGrammarId] = useState<string | null>('1-5');

  // Verbs Tab State
  const [verbSearch, setVerbSearch] = useState('');
  const [selectedVerbId, setSelectedVerbId] = useState<string>(
    NOTEBOOK_VERB_PATTERNS[0]?.lemmaId ?? 'risolvere',
  );
  const [selectedTense, setSelectedTense] = useState<VerbTense>('presente');

  // Local optimistic saved tracking
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

  const encountered = summary?.encountered ?? 0;
  const practiceCount = practiceItems.length;
  const familiar = summary?.familiar ?? 0;
  const mastered = summary?.mastered ?? 0;
  const progressRatio = encountered > 0 ? (familiar + mastered) / encountered : 0;
  const percentRecognized = Math.round(progressRatio * 100);

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
    // Deduplicate items
    const seen = new Set<string>();
    const unique: VocabBrowseItem[] = [];
    for (const item of combined) {
      const key = `${item.kind}:${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    return unique;
  }, [bundle, vocabState]);

  // Filtered vocabulary list
  const filteredVocabulary = useMemo(() => {
    let list = catalogItems;

    // Filter by status
    if (statusFilter === 'saved') {
      list = list.filter((item) => {
        const isOpt = optimisticSaved[`${item.kind}:${item.id}`];
        return isOpt !== undefined ? isOpt : item.saved;
      });
    } else if (statusFilter !== 'all') {
      list = list.filter((item) => item.status === statusFilter);
    }

    // Filter by search query
    const q = vocabSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (item) =>
          item.italian.toLowerCase().includes(q) ||
          item.english.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q),
      );
    }

    return list;
  }, [catalogItems, statusFilter, vocabSearch, optimisticSaved]);

  // Starter preview words if learner is brand new
  const starterWords = useMemo(() => {
    if (catalogItems.length > 0) return [];
    return bundle.lexicon.slice(0, 10).map((l) => ({
      kind: 'lemma' as const,
      id: l.lemmaId,
      italian: l.italian,
      english: l.english,
      status: 'learning' as const,
      saved: false,
      encounterCount: 0,
      chaptersEncountered: [chapterIdForNumber(l.introducedChapter ?? 1)],
      partOfSpeech: l.partOfSpeech,
      cefrLevel: l.cefrLevel,
      introducedChapter: l.introducedChapter ?? 1,
    }));
  }, [bundle.lexicon, catalogItems.length]);

  // Filtered phrases
  const filteredPhrases = useMemo(() => {
    let list = NOTEBOOK_PHRASES;

    // Filter by speaker / saved
    if (phraseSpeaker === 'SAVED') {
      list = list.filter((p) => optimisticSaved[`phrase:${p.id}`] ?? false);
    } else if (phraseSpeaker !== 'ALL') {
      list = list.filter((p) => p.speaker === phraseSpeaker);
    }

    const q = phraseSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.textIt.toLowerCase().includes(q) ||
        p.textEn.toLowerCase().includes(q) ||
        p.speaker.toLowerCase().includes(q) ||
        p.whyMemorable.toLowerCase().includes(q),
    );
  }, [phraseSearch, phraseSpeaker, optimisticSaved]);

  // All structured grammar notes
  const allGrammarNotes = useMemo(() => {
    const notes: (GrammarNote & { level: string; start: number; end: number })[] = [];
    for (const batch of GRAMMAR_BATCH_RANGES) {
      const note = grammarNoteForBatch(batch.start, batch.end, LUCA_STORY_ID);
      if (note) {
        notes.push({ ...note, level: batch.level, start: batch.start, end: batch.end });
      }
    }
    return notes;
  }, []);

  // Filtered grammar notes
  const filteredGrammarNotes = useMemo(() => {
    let list = allGrammarNotes;
    if (grammarLevel !== 'ALL') {
      list = list.filter((g) => g.level === grammarLevel);
    }
    const q = grammarSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.intro.toLowerCase().includes(q) ||
          g.steps.some(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.rule.toLowerCase().includes(q) ||
              s.explanation.toLowerCase().includes(q),
          ),
      );
    }
    return list;
  }, [allGrammarNotes, grammarLevel, grammarSearch]);

  // Filtered verbs list
  const filteredVerbs = useMemo(() => {
    const q = verbSearch.trim().toLowerCase();
    if (!q) return NOTEBOOK_VERB_PATTERNS;
    return NOTEBOOK_VERB_PATTERNS.filter(
      (v) =>
        v.infinitive.toLowerCase().includes(q) ||
        v.english.toLowerCase().includes(q) ||
        v.regularGroup.toLowerCase().includes(q),
    );
  }, [verbSearch]);

  const selectedVerb = useMemo(() => {
    return (
      filteredVerbs.find((v) => v.lemmaId === selectedVerbId) ??
      filteredVerbs[0] ??
      NOTEBOOK_VERB_PATTERNS[0]
    );
  }, [filteredVerbs, selectedVerbId]);

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
          <GlobalLanguageHeader breadcrumb="Notebook" />

          {/* HEADER */}
          <View style={styles.header}>
            <Text
              style={[
                type.heroTitle,
                {
                  color: colors.text,
                  fontSize: layout.isPhone ? 26 : 32,
                  lineHeight: layout.isPhone ? 32 : 40,
                },
              ]}>
              📖 My Notebook
            </Text>
            <Text style={[type.caption, { color: colors.textSecondary, marginTop: 2, fontSize: 14 }]}>
              Your Italian word bank, memorable story lines, grammar guide, and verb conjugator.
            </Text>
          </View>

          {/* REVIEW CTA BANNER (COMPACT ON MOBILE) */}
          {practiceCount > 0 ? (
            <View
              style={[
                styles.reviewBanner,
                { backgroundColor: colors.backgroundElevated, borderColor: colors.tintSoft },
              ]}>
              <View style={styles.reviewBannerContent}>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.1 }]}>
                    Spaced Repetition
                  </Text>
                  <Text style={[type.heroTitle, { color: colors.text, fontSize: 16, marginTop: 1 }]}>
                    🎯 {practiceCount} {practiceCount === 1 ? 'word' : 'words'} ready for review
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/practice' as Href)}
                  accessibilityRole="button"
                  accessibilityLabel="Start Vocabulary Practice"
                  style={({ pressed }) => [
                    styles.primaryCtaBtn,
                    {
                      backgroundColor: colors.buttonPrimary,
                      opacity: pressed ? 0.85 : 1,
                      minHeight: Math.max(34, minTouchTarget - 10),
                    },
                  ]}>
                  <Text style={[type.button, { color: colors.onButtonPrimary, fontSize: 13 }]}>
                    Start Review →
                  </Text>
                </Pressable>
              </View>

              {/* HORIZONTAL SCROLL FOR PRACTICE PREVIEW CHIPS */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.practiceScrollRow}>
                {practiceItems.slice(0, 6).map((item) => (
                  <View
                    key={`${item.kind}:${item.id}`}
                    style={[styles.practiceChip, { backgroundColor: colors.backgroundHigher }]}>
                    <Text style={[type.body, { color: colors.text, fontFamily: 'Literata_600SemiBold', fontSize: 12 }]}>
                      {item.italian}
                    </Text>
                    {item.english ? (
                      <Text style={[type.caption, { color: colors.textMuted, fontSize: 11 }]}>
                        · {item.english}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : encountered > 0 ? (
            <View
              style={[
                styles.progressCard,
                { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
              ]}>
              <View style={styles.progressCardHeader}>
                <Text style={[type.body, { color: colors.text, fontFamily: 'Literata_600SemiBold', fontSize: 14 }]}>
                  🌿 Vocabulary Growth
                </Text>
                <Text style={[type.caption, { color: colors.textSecondary, fontSize: 12 }]}>
                  {percentRecognized}% recognized ({familiar + mastered} of {encountered} words)
                </Text>
              </View>
              <View style={{ marginTop: Spacing.xs }}>
                <ProgressBar progress={progressRatio} />
              </View>
            </View>
          ) : null}

          {/* MAIN CAROUSEL TAB SHELF */}
          <NotebookTabs
            active={activeTab}
            onChange={setActiveTab}
            counts={{
              vocabulary: catalogItems.length || starterWords.length,
              phrases: NOTEBOOK_PHRASES.length,
              grammar: allGrammarNotes.length,
              verbs: filteredVerbs.length,
            }}
          />

          {italianLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.tint} size="large" />
              <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
                Loading notebook…
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: Spacing.xs }}>
              {/* ============================================================ */}
              {/* TAB 1: VOCABULARY WORD BANK */}
              {/* ============================================================ */}
              {activeTab === 'vocabulary' && (
                <View style={{ gap: Spacing.md }}>
                  {/* SEARCH & STATUS FILTERS BAR */}
                  <View style={styles.searchContainer}>
                    <View
                      style={[
                        styles.searchInputWrapper,
                        { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                      ]}>
                      <Text style={{ fontSize: 14, marginRight: 6 }}>🔍</Text>
                      <TextInput
                        value={vocabSearch}
                        onChangeText={setVocabSearch}
                        placeholder="Search words in Italian or English…"
                        placeholderTextColor={colors.textMuted}
                        style={[
                          type.body,
                          styles.searchInput,
                          { color: colors.text, minHeight: Math.max(38, minTouchTarget - 8) },
                        ]}
                      />
                      {vocabSearch ? (
                        <Pressable
                          onPress={() => setVocabSearch('')}
                          accessibilityRole="button"
                          accessibilityLabel="Clear search"
                          style={{ padding: 4 }}>
                          <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
                        </Pressable>
                      ) : null}
                    </View>

                    {/* STATUS FILTER PILLS */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: Spacing.xs, paddingVertical: 2 }}>
                      {(
                        [
                          { id: 'all', label: `All (${catalogItems.length})` },
                          { id: 'saved', label: '⭐ Saved' },
                          { id: 'learning', label: '🟡 Learning' },
                          { id: 'familiar', label: '🔵 Familiar' },
                          { id: 'mastered', label: '🟢 Mastered' },
                        ] as const
                      ).map((f) => {
                        const active = statusFilter === f.id;
                        return (
                          <Pressable
                            key={f.id}
                            onPress={() => setStatusFilter(f.id)}
                            accessibilityRole="button"
                            style={({ pressed }) => [
                              styles.filterPill,
                              {
                                backgroundColor: active ? colors.tint : colors.backgroundElevated,
                                borderColor: active ? colors.tint : colors.border,
                                opacity: pressed ? 0.8 : 1,
                                minHeight: Math.max(32, minTouchTarget - 12),
                              },
                            ]}>
                            <Text
                              style={[
                                type.caption,
                                {
                                  color: active ? colors.onTint : colors.textSecondary,
                                  fontFamily: active ? 'Literata_600SemiBold' : 'Literata_400Regular',
                                  fontSize: 12,
                                },
                              ]}>
                              {f.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* EMPTY ENCOUNTERED STATE WITH STARTER PREVIEW */}
                  {catalogItems.length === 0 ? (
                    <View
                      style={[
                        styles.emptyStateCard,
                        { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                      ]}>
                      <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: Spacing.xs }}>
                        📚
                      </Text>
                      <Text style={[type.heroTitle, { color: colors.text, fontSize: 18, textAlign: 'center' }]}>
                        Your Italian Word Bank
                      </Text>
                      <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, fontSize: 14 }]}>
                        Words you discover while reading *Luca a Roma* will be automatically collected here for review, lookup, and audio practice.
                      </Text>

                      <Pressable
                        onPress={() => router.push(readerHref(LUCA_STORY_ID, 'luca-a-roma-01'))}
                        accessibilityRole="button"
                        style={({ pressed }) => [
                          styles.starterActionBtn,
                          { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.85 : 1 },
                        ]}>
                        <Text style={[type.button, { color: colors.onButtonPrimary, fontSize: 14 }]}>
                          Start Reading Chapter 1 →
                        </Text>
                      </Pressable>

                      <Text
                        style={[
                          Typography.chapterEyebrow,
                          { color: colors.tint, letterSpacing: 1.2, marginTop: Spacing.lg },
                        ]}>
                        Core Starter Vocabulary (Preview)
                      </Text>
                      <View style={{ gap: Spacing.xs, marginTop: Spacing.xs }}>
                        {starterWords.map((item) => (
                          <WordCard
                            key={item.id}
                            item={item}
                            bundle={bundle}
                            colors={colors}
                            type={type}
                            minTouchTarget={minTouchTarget}
                            speakingId={speakingId}
                            isSaved={false}
                            onPlayAudio={handlePlayAudio}
                            onToggleSave={handleToggleSave}
                            onNavigateChapter={handleNavigateChapter}
                          />
                        ))}
                      </View>
                    </View>
                  ) : filteredVocabulary.length === 0 ? (
                    <View
                      style={[
                        styles.emptyStateCard,
                        { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                      ]}>
                      <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                        No vocabulary matching &ldquo;{vocabSearch}&rdquo; in this filter.
                      </Text>
                    </View>
                  ) : (
                    <View style={{ gap: Spacing.sm }}>
                      {filteredVocabulary.slice(0, vocabPageSize).map((item) => {
                        const optKey = `${item.kind}:${item.id}`;
                        const isSaved =
                          optimisticSaved[optKey] !== undefined
                            ? optimisticSaved[optKey]
                            : item.saved;

                        return (
                          <WordCard
                            key={`${item.kind}:${item.id}`}
                            item={item}
                            bundle={bundle}
                            colors={colors}
                            type={type}
                            minTouchTarget={minTouchTarget}
                            speakingId={speakingId}
                            isSaved={isSaved}
                            onPlayAudio={handlePlayAudio}
                            onToggleSave={handleToggleSave}
                            onNavigateChapter={handleNavigateChapter}
                          />
                        );
                      })}

                      {filteredVocabulary.length > vocabPageSize && (
                        <Pressable
                          onPress={() => setVocabPageSize((prev) => prev + 30)}
                          accessibilityRole="button"
                          style={({ pressed }) => [
                            styles.loadMoreBtn,
                            {
                              backgroundColor: colors.backgroundElevated,
                              borderColor: colors.border,
                              opacity: pressed ? 0.7 : 1,
                            },
                          ]}>
                          <Text style={[type.body, { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 14 }]}>
                            Show {filteredVocabulary.length - vocabPageSize} More Words ↓
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* ============================================================ */}
              {/* TAB 2: PHRASES & IDIOMS */}
              {/* ============================================================ */}
              {activeTab === 'phrases' && (
                <View style={{ gap: Spacing.md }}>
                  {/* SPOTLIGHT PHRASES CAROUSEL */}
                  <PhrasesSpotlightCarousel
                    phrases={NOTEBOOK_PHRASES}
                    speakingId={speakingId}
                    optimisticSaved={optimisticSaved}
                    onPlayAudio={handlePlayAudio}
                    onToggleSave={handleToggleSave}
                    onNavigateChapter={handleNavigateChapter}
                  />

                  {/* SPEAKER FILTER PILLS */}
                  <View style={{ gap: Spacing.xs }}>
                    <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.2 }]}>
                      Phrasebook by Character & Theme
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: Spacing.xs, paddingVertical: 2 }}>
                      {(
                        [
                          { id: 'ALL', label: `All (${NOTEBOOK_PHRASES.length})` },
                          { id: 'SAVED', label: '⭐ Saved' },
                          { id: 'Luca', label: '🗣️ Luca' },
                          { id: 'Marco', label: '🗣️ Marco' },
                          { id: 'Giulia', label: '🗣️ Giulia' },
                          { id: 'Signora Maria', label: '🗣️ Signora Maria' },
                        ] as const
                      ).map((sp) => {
                        const active = phraseSpeaker === sp.id;
                        return (
                          <Pressable
                            key={sp.id}
                            onPress={() => setPhraseSpeaker(sp.id)}
                            accessibilityRole="button"
                            style={({ pressed }) => [
                              styles.filterPill,
                              {
                                backgroundColor: active ? colors.tint : colors.backgroundElevated,
                                borderColor: active ? colors.tint : colors.border,
                                opacity: pressed ? 0.8 : 1,
                                minHeight: Math.max(32, minTouchTarget - 12),
                              },
                            ]}>
                            <Text
                              style={[
                                type.caption,
                                {
                                  color: active ? colors.onTint : colors.textSecondary,
                                  fontFamily: active ? 'Literata_600SemiBold' : 'Literata_400Regular',
                                  fontSize: 12,
                                },
                              ]}>
                              {sp.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* SEARCH INPUT */}
                  <View
                    style={[
                      styles.searchInputWrapper,
                      { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                    ]}>
                    <Text style={{ fontSize: 14, marginRight: 6 }}>🔍</Text>
                    <TextInput
                      value={phraseSearch}
                      onChangeText={setPhraseSearch}
                      placeholder="Search memorable phrases & idioms…"
                      placeholderTextColor={colors.textMuted}
                      style={[
                        type.body,
                        styles.searchInput,
                        { color: colors.text, minHeight: Math.max(38, minTouchTarget - 8) },
                      ]}
                    />
                    {phraseSearch ? (
                      <Pressable
                        onPress={() => setPhraseSearch('')}
                        accessibilityRole="button"
                        accessibilityLabel="Clear search"
                        style={{ padding: 4 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  {filteredPhrases.length === 0 ? (
                    <View
                      style={[
                        styles.emptyStateCard,
                        { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                      ]}>
                      <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                        No phrases match this filter.
                      </Text>
                    </View>
                  ) : (
                    filteredPhrases.map((phrase) => {
                      const isSpeaking = speakingId === phrase.id;
                      const optKey = `phrase:${phrase.id}`;
                      const isSaved = optimisticSaved[optKey] ?? false;

                      return (
                        <View
                          key={phrase.id}
                          style={[
                            styles.phraseCard,
                            { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                          ]}>
                          <View style={styles.phraseHeader}>
                            <View style={styles.speakerBadgeRow}>
                              <Text style={[styles.speakerPill, { backgroundColor: colors.backgroundHigher, color: colors.tint }]}>
                                🗣️ {phrase.speaker}
                              </Text>
                              <Text style={[type.caption, { color: colors.textMuted, fontSize: 12 }]}>
                                · Chapter {phrase.chapterNumber}
                              </Text>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                              <Pressable
                                onPress={() => handleToggleSave('phrase', phrase.id, isSaved)}
                                accessibilityRole="button"
                                accessibilityLabel={isSaved ? 'Unsave phrase' : 'Save phrase'}
                                style={({ pressed }) => [
                                  styles.iconActionBtn,
                                  {
                                    backgroundColor: colors.backgroundHigher,
                                    borderColor: colors.border,
                                    opacity: pressed ? 0.7 : 1,
                                  },
                                ]}>
                                <Text style={{ fontSize: 14 }}>{isSaved ? '⭐' : '☆'}</Text>
                              </Pressable>

                              <Pressable
                                onPress={() => handlePlayAudio(phrase.id, phrase.textIt)}
                                accessibilityRole="button"
                                accessibilityLabel={`Listen to: ${phrase.textIt}`}
                                style={({ pressed }) => [
                                  styles.audioActionBtn,
                                  {
                                    backgroundColor: isSpeaking ? colors.accentSoft : colors.backgroundHigher,
                                    borderColor: colors.border,
                                    opacity: pressed ? 0.7 : 1,
                                    minHeight: Math.max(34, minTouchTarget - 10),
                                  },
                                ]}>
                                <Text style={[type.caption, { color: colors.text, fontSize: 12 }]}>
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
                                fontSize: 17,
                                lineHeight: 24,
                                fontStyle: 'italic',
                                marginTop: Spacing.xs,
                              },
                            ]}>
                            &ldquo;{phrase.textIt}&rdquo;
                          </Text>
                          <Text style={[type.body, { color: colors.textSecondary, fontSize: 14, marginTop: 3 }]}>
                            {phrase.textEn}
                          </Text>

                          <View style={[styles.phraseFooter, { borderTopColor: colors.divider }]}>
                            <Text style={[type.caption, { color: colors.textMuted, flex: 1, fontSize: 12 }]}>
                              💡 {phrase.whyMemorable}
                            </Text>
                            <Pressable
                              onPress={() => handleNavigateChapter(phrase.chapterNumber)}
                              accessibilityRole="button"
                              accessibilityLabel={`Read in Chapter ${phrase.chapterNumber}`}
                              style={{ minHeight: minTouchTarget - 10, justifyContent: 'center' }}>
                              <Text style={[type.caption, { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 12 }]}>
                                Read Scene →
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              )}

              {/* ============================================================ */}
              {/* TAB 3: GRAMMAR GUIDE */}
              {/* ============================================================ */}
              {activeTab === 'grammar' && (
                <View style={{ gap: Spacing.md }}>
                  {/* LEVEL FILTER PILLS */}
                  <View style={styles.grammarFilterRow}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: Spacing.xs, paddingVertical: 2 }}>
                      {(
                        [
                          { id: 'ALL', label: 'All Levels (1–70)' },
                          { id: 'A1', label: 'A1 (Ch 1–20)' },
                          { id: 'A2', label: 'A2 (Ch 21–55)' },
                          { id: 'B1+', label: 'B1+ (Ch 56–70)' },
                        ] as const
                      ).map((lvl) => {
                        const active = grammarLevel === lvl.id;
                        return (
                          <Pressable
                            key={lvl.id}
                            onPress={() => setGrammarLevel(lvl.id)}
                            accessibilityRole="button"
                            style={({ pressed }) => [
                              styles.filterPill,
                              {
                                backgroundColor: active ? colors.tint : colors.backgroundElevated,
                                borderColor: active ? colors.tint : colors.border,
                                opacity: pressed ? 0.8 : 1,
                                minHeight: Math.max(32, minTouchTarget - 12),
                              },
                            ]}>
                            <Text
                              style={[
                                type.caption,
                                {
                                  color: active ? colors.onTint : colors.textSecondary,
                                  fontFamily: active ? 'Literata_600SemiBold' : 'Literata_400Regular',
                                  fontSize: 12,
                                },
                              ]}>
                              {lvl.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* SEARCH INPUT */}
                  <View
                    style={[
                      styles.searchInputWrapper,
                      { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                    ]}>
                    <Text style={{ fontSize: 14, marginRight: 6 }}>🔍</Text>
                    <TextInput
                      value={grammarSearch}
                      onChangeText={setGrammarSearch}
                      placeholder="Search grammar topics (e.g. essere, pronouns, imperfetto)…"
                      placeholderTextColor={colors.textMuted}
                      style={[
                        type.body,
                        styles.searchInput,
                        { color: colors.text, minHeight: Math.max(38, minTouchTarget - 8) },
                      ]}
                    />
                    {grammarSearch ? (
                      <Pressable
                        onPress={() => setGrammarSearch('')}
                        accessibilityRole="button"
                        style={{ padding: 4 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  {/* HORIZONTAL SWIPEABLE GRAMMAR SHIFT INSIGHTS CAROUSEL */}
                  <GrammarInsightsCarousel
                    insights={NOTEBOOK_GRAMMAR_INSIGHTS}
                    onNavigateChapter={handleNavigateChapter}
                  />

                  <Text
                    style={[
                      Typography.chapterEyebrow,
                      { color: colors.textMuted, letterSpacing: 1.2, marginTop: Spacing.xs },
                    ]}>
                    Comprehensive Chapter Lessons ({filteredGrammarNotes.length})
                  </Text>

                  {/* ACCORDION GRAMMAR BATCHES */}
                  {filteredGrammarNotes.map((note) => {
                    const isExpanded = expandedGrammarId === note.batchKey;

                    return (
                      <View
                        key={note.batchKey}
                        style={[
                          styles.grammarCard,
                          { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                        ]}>
                        <Pressable
                          onPress={() =>
                            setExpandedGrammarId((prev) => (prev === note.batchKey ? null : note.batchKey))
                          }
                          accessibilityRole="button"
                          accessibilityLabel={`Toggle grammar lesson: ${note.title}`}
                          style={styles.grammarCardHeader}>
                          <View style={{ flex: 1 }}>
                            <View style={styles.batchTagRow}>
                              <Text
                                style={[
                                  styles.batchTag,
                                  { backgroundColor: colors.backgroundHigher, color: colors.tint },
                                ]}>
                                {note.level} · Chapters {note.start}–{note.end}
                              </Text>
                            </View>
                            <Text
                              style={[
                                type.heroTitle,
                                { color: colors.text, fontSize: 17, marginTop: 4, lineHeight: 22 },
                              ]}>
                              {note.title}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 18, color: colors.textMuted, marginLeft: 8 }}>
                            {isExpanded ? '▲' : '▼'}
                          </Text>
                        </Pressable>

                        <Text style={[type.body, { color: colors.textSecondary, fontSize: 14, marginTop: 4 }]}>
                          {note.intro}
                        </Text>

                        {/* EXPANDED LESSON DETAILS */}
                        {isExpanded && (
                          <View style={{ gap: Spacing.md, marginTop: Spacing.md }}>
                            {note.steps.map((step, idx) => (
                              <View
                                key={step.title}
                                style={[
                                  styles.grammarStepBox,
                                  { backgroundColor: colors.backgroundHigher, borderColor: colors.border },
                                ]}>
                                <Text
                                  style={[
                                    type.body,
                                    { color: colors.text, fontFamily: 'Literata_600SemiBold', fontSize: 14 },
                                  ]}>
                                  {idx + 1}. {step.title}
                                </Text>

                                <View
                                  style={[
                                    styles.rulePill,
                                    { backgroundColor: colors.backgroundAtmosphereTop, borderLeftColor: colors.tint },
                                  ]}>
                                  <Text
                                    style={[
                                      type.caption,
                                      { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 12 },
                                    ]}>
                                    📌 Rule: {step.rule}
                                  </Text>
                                </View>

                                <Text
                                  style={[
                                    type.caption,
                                    { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 4 },
                                  ]}>
                                  {step.explanation}
                                </Text>

                                {/* EXAMPLES */}
                                {step.examples && step.examples.length > 0 ? (
                                  <View style={{ gap: 4, marginTop: 4 }}>
                                    {step.examples.map((ex) => (
                                      <View key={ex.italian} style={styles.grammarExampleRow}>
                                        <Text
                                          style={[
                                            type.body,
                                            { color: colors.text, fontStyle: 'italic', fontSize: 13 },
                                          ]}>
                                          &ldquo;{ex.italian}&rdquo;
                                        </Text>
                                        <Text style={[type.caption, { color: colors.textMuted, fontSize: 12 }]}>
                                          → {ex.english}
                                        </Text>
                                      </View>
                                    ))}
                                  </View>
                                ) : null}
                              </View>
                            ))}

                            <Pressable
                              onPress={() => handleNavigateChapter(note.start)}
                              accessibilityRole="button"
                              style={{ alignSelf: 'flex-end', minHeight: minTouchTarget - 10, justifyContent: 'center' }}>
                              <Text
                                style={[
                                  type.caption,
                                  { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 13 },
                                ]}>
                                Read in Chapter {note.start} →
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* ============================================================ */}
              {/* TAB 4: VERBS (REFERENCE & CONJUGATOR) */}
              {/* ============================================================ */}
              {activeTab === 'verbs' && (
                <View style={{ gap: Spacing.md }}>
                  {/* SEARCH VERBS */}
                  <View
                    style={[
                      styles.searchInputWrapper,
                      { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                    ]}>
                    <Text style={{ fontSize: 14, marginRight: 6 }}>🔍</Text>
                    <TextInput
                      value={verbSearch}
                      onChangeText={setVerbSearch}
                      placeholder="Search verbs (e.g. parlare, essere, risolvere)…"
                      placeholderTextColor={colors.textMuted}
                      style={[
                        type.body,
                        styles.searchInput,
                        { color: colors.text, minHeight: Math.max(38, minTouchTarget - 8) },
                      ]}
                    />
                    {verbSearch ? (
                      <Pressable
                        onPress={() => setVerbSearch('')}
                        accessibilityRole="button"
                        style={{ padding: 4 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  {/* VERB SELECTOR PILLS */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: Spacing.xs, paddingVertical: 2 }}>
                    {filteredVerbs.map((v) => {
                      const active = v.lemmaId === selectedVerb.lemmaId;
                      return (
                        <Pressable
                          key={v.lemmaId}
                          onPress={() => setSelectedVerbId(v.lemmaId)}
                          accessibilityRole="button"
                          style={({ pressed }) => [
                            styles.filterPill,
                            {
                              backgroundColor: active ? colors.tint : colors.backgroundElevated,
                              borderColor: active ? colors.tint : colors.border,
                              opacity: pressed ? 0.8 : 1,
                              minHeight: Math.max(32, minTouchTarget - 12),
                            },
                          ]}>
                          <Text
                            style={[
                              type.caption,
                              {
                                color: active ? colors.onTint : colors.text,
                                fontFamily: active ? 'Literata_600SemiBold' : 'Literata_400Regular',
                                fontSize: 13,
                              },
                            ]}>
                            {v.infinitive}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {/* STREAMLINED VERB DETAIL CARD WITH SEGMENTS & HORIZONTAL TENSE BAR */}
                  <VerbDetailCard
                    verb={selectedVerb}
                    selectedTense={selectedTense}
                    onSelectTense={setSelectedTense}
                    onPlayAudio={handlePlayAudio}
                    onNavigateChapter={handleNavigateChapter}
                  />
                </View>
              )}
            </View>
          )}
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

// ----------------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------------

function WordCard({
  item,
  bundle,
  colors,
  type,
  minTouchTarget,
  speakingId,
  isSaved,
  onPlayAudio,
  onToggleSave,
  onNavigateChapter,
}: {
  item: VocabBrowseItem;
  bundle: ReturnType<typeof getContentBundle>;
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
  minTouchTarget: number;
  speakingId: string | null;
  isSaved: boolean;
  onPlayAudio: (id: string, text: string) => void;
  onToggleSave: (kind: 'lemma' | 'phrase', id: string, currentSaved: boolean) => void;
  onNavigateChapter: (chapterNum: number) => void;
}) {
  const isSpeaking = speakingId === `word:${item.id}`;
  const narrative = getNarrativeAnnotation(item.id);
  const examples = useMemo(
    () => (item.kind === 'lemma' ? findExamplesForLemma(bundle, item.id, 1) : []),
    [bundle, item.id, item.kind],
  );
  const example = examples[0];

  return (
    <View
      style={[
        styles.vocabCard,
        { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
      ]}>
      <View style={styles.vocabCardHeader}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text style={[type.heroTitle, { color: colors.text, fontSize: 18, lineHeight: 22 }]}>
            {item.italian}
          </Text>

          {item.partOfSpeech && (
            <View style={[styles.posBadge, { backgroundColor: colors.backgroundHigher }]}>
              <Text style={[type.caption, { color: colors.textMuted, fontSize: 11 }]}>
                {item.partOfSpeech}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'mastered'
                    ? colors.statusMastered + '20'
                    : item.status === 'familiar'
                      ? colors.statusFamiliar + '20'
                      : colors.statusLearning + '20',
              },
            ]}>
            <Text
              style={[
                type.caption,
                {
                  fontSize: 10,
                  fontFamily: 'Literata_600SemiBold',
                  color:
                    item.status === 'mastered'
                      ? colors.statusMastered
                      : item.status === 'familiar'
                        ? colors.statusFamiliar
                        : colors.statusLearning,
                },
              ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Pressable
            onPress={() => onToggleSave(item.kind, item.id, isSaved)}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Unsave word' : 'Save word'}
            style={({ pressed }) => [
              styles.iconActionBtn,
              {
                backgroundColor: colors.backgroundHigher,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Text style={{ fontSize: 14 }}>{isSaved ? '⭐' : '☆'}</Text>
          </Pressable>

          <Pressable
            onPress={() => onPlayAudio(`word:${item.id}`, item.italian)}
            accessibilityRole="button"
            accessibilityLabel={`Pronounce ${item.italian}`}
            style={({ pressed }) => [
              styles.audioActionBtn,
              {
                backgroundColor: isSpeaking ? colors.accentSoft : colors.backgroundHigher,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
                minHeight: Math.max(34, minTouchTarget - 10),
              },
            ]}>
            <Text style={[type.caption, { color: colors.text, fontSize: 12 }]}>
              {isSpeaking ? '🔊 Playing…' : '🔊 Pronounce'}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={[type.body, { color: colors.textSecondary, fontSize: 14 }]}>
        {item.english}
      </Text>

      {/* STORY CONTEXT QUOTE */}
      {narrative ? (
        <View style={[styles.annotationBox, { borderLeftColor: colors.tint }]}>
          <Text style={[type.caption, { color: colors.text, fontSize: 13, lineHeight: 18 }]}>
            💡 {narrative.whyItMatters}
          </Text>
          <Text
            style={[
              type.caption,
              { color: colors.textSecondary, fontStyle: 'italic', marginTop: 2, fontSize: 12 },
            ]}>
            &ldquo;{narrative.storyAnchor.quoteIt}&rdquo;
          </Text>
          <Pressable
            onPress={() => onNavigateChapter(narrative.storyAnchor.chapterNumber)}
            accessibilityRole="button"
            style={{ alignSelf: 'flex-end', marginTop: 2 }}>
            <Text
              style={[
                type.caption,
                { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 11 },
              ]}>
              Chapter {narrative.storyAnchor.chapterNumber} →
            </Text>
          </Pressable>
        </View>
      ) : example ? (
        <View
          style={[
            styles.exampleBox,
            { backgroundColor: colors.backgroundHigher, borderColor: colors.border },
          ]}>
          <Text style={[type.caption, { color: colors.text, fontStyle: 'italic', fontSize: 12 }]}>
            &ldquo;{example.text}&rdquo;
          </Text>
          <Pressable
            onPress={() => onNavigateChapter(example.chapterNumber)}
            accessibilityRole="button"
            style={{ alignSelf: 'flex-end', marginTop: 2 }}>
            <Text
              style={[
                type.caption,
                { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 11 },
              ]}>
              Chapter {example.chapterNumber} →
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

// ----------------------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------------------

const styles = StyleSheet.create({
  header: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  reviewBanner: {
    padding: Spacing.sm + 2,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  reviewBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  primaryCtaBtn: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  practiceScrollRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs + 2,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  practiceChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 3,
    paddingHorizontal: Spacing.xs + 2,
    borderRadius: Radii.sm,
    gap: 4,
  },
  progressCard: {
    padding: Spacing.sm + 2,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    gap: Spacing.xs,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  filterPill: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateCard: {
    padding: Spacing.xl,
    borderRadius: Radii.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  starterActionBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.sm,
  },
  vocabCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  vocabCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  posBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radii.sm,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radii.sm,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: Radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  annotationBox: {
    borderLeftWidth: 2.5,
    paddingLeft: Spacing.sm,
    marginTop: 4,
  },
  exampleBox: {
    padding: Spacing.xs + 2,
    borderRadius: Radii.sm,
    borderWidth: 1,
    marginTop: 4,
  },
  loadMoreBtn: {
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
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
  speakerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakerPill: {
    fontSize: 12,
    fontFamily: 'Literata_600SemiBold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radii.sm,
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
  grammarFilterRow: {
    flexDirection: 'row',
  },
  grammarCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  grammarCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  batchTagRow: {
    flexDirection: 'row',
  },
  batchTag: {
    fontSize: 11,
    fontFamily: 'Literata_600SemiBold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radii.sm,
  },
  grammarStepBox: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
    gap: 4,
  },
  rulePill: {
    borderLeftWidth: 2.5,
    paddingLeft: Spacing.xs + 2,
    paddingVertical: 2,
    marginTop: 2,
  },
  grammarExampleRow: {
    marginTop: 2,
  },
});
