import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { GlobalLanguageHeader } from '@/src/components/GlobalLanguageHeader';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenContent } from '@/src/components/ScreenContent';
import { LUCA_STORY_ID } from '@/src/content';
import { readerHref } from '@/src/content/storyHrefs';
import { navLog } from '@/src/navigation/diagnostics';
import { usePeekProgress } from '@/src/progress/usePeekProgress';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useLayout } from '@/src/theme/useLayout';
import { useTheme } from '@/src/theme/useTheme';
import {
  getNarrativeAnnotation,
  NOTEBOOK_GRAMMAR_INSIGHTS,
  NOTEBOOK_MOMENTS,
  NOTEBOOK_PHRASES,
  type NotebookGrammarInsight,
  type NotebookMoment,
  type NotebookPhrase,
} from '@/src/vocabulary/notebookData';
import {
  NOTEBOOK_VERB_PATTERNS,
  type NotebookVerbPattern,
} from '@/src/vocabulary/notebookVerbs';
import { useYourItalian } from '@/src/vocabulary/useYourItalian';
import { speakItalian } from '@/src/walkthrough/speakItalian';

type NotebookTab = 'parole' | 'frasi' | 'grammatica' | 'verbi' | 'momenti';

function chapterIdForNumber(n: number): string {
  return n < 10 ? `luca-a-roma-0${n}` : `luca-a-roma-${n}`;
}

export default function VocabularyScreen() {
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const { progress, refresh: refreshProgress } = usePeekProgress();
  const { summary, reinforcingWords, practiceItems, loading, refresh } =
    useYourItalian(progress);

  const [activeTab, setActiveTab] = useState<NotebookTab>('parole');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      navLog('vocabulary focus');
      void refreshProgress();
      void refresh();
    }, [refresh, refreshProgress]),
  );

  useEffect(() => {
    navLog('vocabulary mount');
    return () => navLog('vocabulary unmount');
  }, []);

  const encountered = summary?.encountered ?? 0;
  const practiceCount = practiceItems.length;
  const familiar = summary?.familiar ?? 0;
  const mastered = summary?.mastered ?? 0;
  const progressRatio = encountered > 0 ? (familiar + mastered) / encountered : 0;
  const percentRecognized = Math.round(progressRatio * 100);

  const completedCount = progress?.completedChapterIds?.length ?? 0;
  const isB1Completed = progress?.completedChapterIds?.includes('luca-a-roma-55') ?? false;

  const handlePlayAudio = useCallback(async (id: string, text: string) => {
    try {
      setSpeakingId(id);
      await speakItalian(text);
    } catch {
      // Audio fallback fails gracefully
    } finally {
      setSpeakingId(null);
    }
  }, []);

  const handleNavigateChapter = useCallback((chapterNum: number) => {
    const cid = chapterIdForNumber(chapterNum);
    router.push(readerHref(LUCA_STORY_ID, cid));
  }, []);

  return (
    <AtmosphereBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={700}>
          <GlobalLanguageHeader breadcrumb="Il mio quaderno" />

          {/* JOURNAL HEADER */}
          <View style={styles.header}>
            <Text
              style={[
                type.heroTitle,
                {
                  color: colors.text,
                  fontSize: layout.isPhone ? 28 : 34,
                  lineHeight: layout.isPhone ? 34 : 42,
                },
              ]}>
              📖 Il mio quaderno
            </Text>
            <Text style={[Typography.chapterEyebrow, { color: colors.tint, marginTop: Spacing.xs, letterSpacing: 1.2 }]}>
              Luca a Roma · B1
            </Text>
            <Text style={[type.body, { color: colors.textSecondary, marginTop: 4, fontSize: 15 }]}>
              Parole, frasi, verbi e momenti che hai incontrato nel tuo viaggio.
            </Text>
          </View>

          {/* B1 COMPLETION CELEBRATION / PROGRESS NOTE */}
          {isB1Completed ? (
            <View style={[styles.milestoneBox, { backgroundColor: colors.backgroundElevated, borderColor: colors.highlight }]}>
              <Text style={[Typography.chapterEyebrow, { color: colors.highlight, letterSpacing: 1.5 }]}>
                55 capitoli vissuti
              </Text>
              <Text style={[type.heroTitle, { color: colors.text, fontSize: 18, lineHeight: 24, marginTop: Spacing.xs }]}>
                Hai seguito Luca da Pietralba fino al suo primo giorno allo Spazio Monti.
              </Text>
              <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.xs, fontSize: 14 }]}>
                Il tuo quaderno custodisce le radici, le decisioni e le parole di questo percorso. La storia continua.
              </Text>
            </View>
          ) : completedCount > 0 ? (
            <View style={[styles.growthBox, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
              <View style={styles.growthHeader}>
                <Text style={[type.body, { color: colors.text, fontFamily: 'Literata_600SemiBold', fontSize: 15 }]}>
                  🌿 Il tuo italiano sta crescendo
                </Text>
                <Text style={[type.caption, { color: colors.textMuted }]}>
                  {completedCount} capitoli letti
                </Text>
              </View>
              <Text style={[type.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                Riconosci il {percentRecognized}% delle {encountered} parole incontrate.
              </Text>
              <View style={{ marginTop: Spacing.sm }}>
                <ProgressBar progress={progressRatio} />
              </View>
            </View>
          ) : null}

          {/* 5 SEGMENTED NOTEBOOK TABS */}
          <View style={[styles.tabBar, { borderBottomColor: colors.divider }]}>
            {(
              [
                { id: 'parole', label: 'Parole', icon: '📖' },
                { id: 'frasi', label: 'Frasi', icon: '✨' },
                { id: 'grammatica', label: 'Grammatica', icon: '💡' },
                { id: 'verbi', label: 'Verbi', icon: '🔄' },
                { id: 'momenti', label: 'Momenti', icon: '🗺️' },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.tabItem,
                    active && { borderBottomColor: colors.tint, borderBottomWidth: 2.5 },
                    { opacity: pressed ? 0.7 : 1, minHeight: minTouchTarget },
                  ]}>
                  <Text
                    style={[
                      type.body,
                      {
                        color: active ? colors.text : colors.textMuted,
                        fontSize: 13,
                        fontFamily: active ? 'Literata_600SemiBold' : 'Literata_400Regular',
                      },
                    ]}>
                    {tab.icon} {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {loading ? (
            <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xl, textAlign: 'center' }]}>
              Caricamento del quaderno…
            </Text>
          ) : (
            <View style={{ marginTop: Spacing.lg }}>
              {/* TAB 1: PAROLE */}
              {activeTab === 'parole' && (
                <ParoleSection
                  encountered={encountered}
                  summary={summary}
                  practiceCount={practiceCount}
                  practiceItems={practiceItems}
                  reinforcingWords={reinforcingWords}
                  colors={colors}
                  type={type}
                  minTouchTarget={minTouchTarget}
                  onNavigateChapter={handleNavigateChapter}
                />
              )}

              {/* TAB 2: FRASI */}
              {activeTab === 'frasi' && (
                <FrasiSection
                  phrases={NOTEBOOK_PHRASES}
                  speakingId={speakingId}
                  colors={colors}
                  type={type}
                  minTouchTarget={minTouchTarget}
                  onPlayAudio={handlePlayAudio}
                  onNavigateChapter={handleNavigateChapter}
                />
              )}

              {/* TAB 3: GRAMMATICA */}
              {activeTab === 'grammatica' && (
                <GrammaticaSection
                  insights={NOTEBOOK_GRAMMAR_INSIGHTS}
                  colors={colors}
                  type={type}
                  minTouchTarget={minTouchTarget}
                  onNavigateChapter={handleNavigateChapter}
                />
              )}

              {/* TAB 4: VERBI */}
              {activeTab === 'verbi' && (
                <VerbiSection
                  verbPatterns={NOTEBOOK_VERB_PATTERNS}
                  colors={colors}
                  type={type}
                  minTouchTarget={minTouchTarget}
                  onNavigateChapter={handleNavigateChapter}
                />
              )}

              {/* TAB 5: MOMENTI */}
              {activeTab === 'momenti' && (
                <MomentiSection
                  moments={NOTEBOOK_MOMENTS}
                  completedCount={completedCount}
                  colors={colors}
                  type={type}
                  minTouchTarget={minTouchTarget}
                  onNavigateChapter={handleNavigateChapter}
                />
              )}
            </View>
          )}
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

// ----------------------------------------------------------------------------
// TAB COMPONENTS
// ----------------------------------------------------------------------------

type SectionProps = {
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
  minTouchTarget: number;
  onNavigateChapter: (chapterNum: number) => void;
};

function ParoleSection({
  encountered,
  summary,
  practiceCount,
  practiceItems,
  reinforcingWords,
  colors,
  type,
  minTouchTarget,
  onNavigateChapter,
}: SectionProps & {
  encountered: number;
  summary: ReturnType<typeof useYourItalian>['summary'];
  practiceCount: number;
  practiceItems: ReturnType<typeof useYourItalian>['practiceItems'];
  reinforcingWords: ReturnType<typeof useYourItalian>['reinforcingWords'];
}) {
  if (encountered === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
        <Text style={[type.body, { color: colors.textSecondary, textAlign: 'center' }]}>
          Inizia a leggere: ogni parola scoperta in *Luca a Roma* verrà annotata qui nel tuo quaderno.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: Spacing.lg }}>
      {/* PRACTICE TRIGGER */}
      {practiceCount > 0 ? (
        <View style={[styles.practiceCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.tintSoft }]}>
          <View style={styles.practiceHeader}>
            <View>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.3 }]}>
                Da rivedere
              </Text>
              <Text style={[type.heroTitle, { color: colors.text, fontSize: 18, lineHeight: 24, marginTop: 2 }]}>
                {practiceCount} {practiceCount === 1 ? 'parola pronta per il ripasso' : 'parole pronte per il ripasso'}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/practice' as Href)}
              accessibilityRole="button"
              accessibilityLabel="Pratica le parole"
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  backgroundColor: colors.buttonPrimary,
                  opacity: pressed ? 0.85 : 1,
                  minHeight: minTouchTarget,
                },
              ]}>
              <Text style={[type.button, { color: colors.onButtonPrimary, fontSize: 14 }]}>
                Ripassa ora →
              </Text>
            </Pressable>
          </View>

          <View style={{ marginTop: Spacing.sm, gap: 4 }}>
            {practiceItems.slice(0, 4).map((item) => (
              <View key={`${item.kind}:${item.id}`} style={styles.compactRow}>
                <Text style={[type.body, { color: colors.text, fontFamily: 'Literata_600SemiBold', fontSize: 14 }]}>
                  {item.italian}
                </Text>
                {item.english ? (
                  <Text style={[type.caption, { color: colors.textSecondary, fontSize: 13 }]}>
                    · {item.english}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* FAMILIARITY METRICS (CALM EDITORIAL) */}
      <View style={[styles.statsCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
        <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.3 }]}>
          Stato di apprendimento
        </Text>
        <View style={styles.stagesRow}>
          <View style={styles.stageCol}>
            <Text style={[styles.stageCount, { color: colors.statusNew }]}>{summary?.new ?? 0}</Text>
            <Text style={[type.caption, { color: colors.textMuted }]}>Nuove</Text>
          </View>
          <View style={styles.stageCol}>
            <Text style={[styles.stageCount, { color: colors.statusLearning }]}>{summary?.learning ?? 0}</Text>
            <Text style={[type.caption, { color: colors.textMuted }]}>In pratica</Text>
          </View>
          <View style={styles.stageCol}>
            <Text style={[styles.stageCount, { color: colors.statusFamiliar }]}>{summary?.familiar ?? 0}</Text>
            <Text style={[type.caption, { color: colors.textMuted }]}>Familiari</Text>
          </View>
          <View style={styles.stageCol}>
            <Text style={[styles.stageCount, { color: colors.statusMastered }]}>{summary?.mastered ?? 0}</Text>
            <Text style={[type.caption, { color: colors.textMuted }]}>Conosciute</Text>
          </View>
        </View>
      </View>

      {/* NARRATIVE-SIGNIFICANT VOCABULARY HIGHLIGHTS */}
      <View style={{ gap: Spacing.sm }}>
        <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.3 }]}>
          Parole della storia di Luca
        </Text>
        <Text style={[type.caption, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
          Parole chiave che hanno segnato le decisioni e la crescita di Luca a Roma.
        </Text>

        {reinforcingWords.map((word) => {
          const annotation = getNarrativeAnnotation(word.italian.toLowerCase());
          return (
            <View
              key={word.italian}
              style={[styles.vocabCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
              <View style={styles.vocabCardHeader}>
                <Text style={[type.heroTitle, { color: colors.text, fontSize: 18, lineHeight: 22 }]}>
                  {word.italian}
                </Text>
                {word.chapterNumber ? (
                  <Pressable
                    onPress={() => onNavigateChapter(word.chapterNumber!)}
                    accessibilityRole="button"
                    accessibilityLabel={`Leggi nel capitolo ${word.chapterNumber}`}>
                    <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1 }]}>
                      Capitolo {word.chapterNumber} →
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {annotation ? (
                <View style={[styles.annotationBox, { borderLeftColor: colors.tint }]}>
                  <Text style={[type.caption, { color: colors.text, fontSize: 13, lineHeight: 18 }]}>
                    {annotation.whyItMatters}
                  </Text>
                  <Text style={[type.caption, { color: colors.textSecondary, fontStyle: 'italic', marginTop: 4, fontSize: 12 }]}>
                    «{annotation.storyAnchor.quoteIt}»
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function FrasiSection({
  phrases,
  speakingId,
  colors,
  type,
  minTouchTarget,
  onPlayAudio,
  onNavigateChapter,
}: SectionProps & {
  phrases: readonly NotebookPhrase[];
  speakingId: string | null;
  onPlayAudio: (id: string, text: string) => void;
}) {
  return (
    <View style={{ gap: Spacing.md }}>
      <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.3 }]}>
        Frasi memorabili
      </Text>
      <Text style={[type.caption, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
        Le voci, i consigli e le frasi che Luca porta con sé nel suo percorso.
      </Text>

      {phrases.map((phrase) => {
        const isSpeaking = speakingId === phrase.id;
        return (
          <View
            key={phrase.id}
            style={[styles.phraseCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
            <View style={styles.phraseHeader}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.2 }]}>
                {phrase.speaker} · Capitolo {phrase.chapterNumber}
              </Text>
              <Pressable
                onPress={() => onPlayAudio(phrase.id, phrase.textIt)}
                accessibilityRole="button"
                accessibilityLabel={`Ascolta la frase: ${phrase.textIt}`}
                style={({ pressed }) => [
                  styles.audioBtn,
                  {
                    backgroundColor: isSpeaking ? colors.accentSoft : colors.backgroundHigher,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                    minHeight: Math.max(36, minTouchTarget),
                  },
                ]}>
                <Text style={[type.caption, { color: colors.text, fontSize: 13 }]}>
                  {isSpeaking ? '🔊 In ascolto…' : '🔊 Ascolta'}
                </Text>
              </Pressable>
            </View>

            <Text style={[type.heroTitle, { color: colors.text, fontSize: 17, lineHeight: 24, fontStyle: 'italic', marginTop: Spacing.xs }]}>
              «{phrase.textIt}»
            </Text>
            <Text style={[type.caption, { color: colors.textSecondary, fontSize: 14, marginTop: 4 }]}>
              {phrase.textEn}
            </Text>

            <View style={[styles.phraseFooter, { borderTopColor: colors.divider }]}>
              <Text style={[type.caption, { color: colors.textMuted, flex: 1, fontSize: 12 }]}>
                {phrase.whyMemorable}
              </Text>
              <Pressable
                onPress={() => onNavigateChapter(phrase.chapterNumber)}
                accessibilityRole="button"
                accessibilityLabel={`Vedi nel capitolo ${phrase.chapterNumber}`}>
                <Text style={[type.caption, { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 12 }]}>
                  Leggi scena →
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function GrammaticaSection({
  insights,
  colors,
  type,
  minTouchTarget,
  onNavigateChapter,
}: SectionProps & {
  insights: readonly NotebookGrammarInsight[];
}) {
  return (
    <View style={{ gap: Spacing.md }}>
      <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.3 }]}>
        Una cosa che ho capito
      </Text>
      <Text style={[type.caption, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
        I salti di consapevolezza grammaticale vissuti attraverso le scelte di Luca.
      </Text>

      {insights.map((insight) => (
        <View
          key={insight.id}
          style={[styles.insightCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
          <View style={styles.insightHeader}>
            <Text style={[type.heroTitle, { color: colors.text, fontSize: 17, lineHeight: 22 }]}>
              💡 {insight.titleIt}
            </Text>
            <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1 }]}>
              Capitoli {insight.chapterRange.start}–{insight.chapterRange.end}
            </Text>
          </View>

          <View style={[styles.formulaBox, { backgroundColor: colors.backgroundHigher }]}>
            <Text style={[type.caption, { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 12 }]}>
              {insight.formula}
            </Text>
          </View>

          <View style={{ marginTop: Spacing.xs }}>
            <Text style={[type.body, { color: colors.text, fontFamily: 'Literata_500Medium', fontSize: 14, fontStyle: 'italic' }]}>
              «{insight.exampleIt}»
            </Text>
            <Text style={[type.caption, { color: colors.textSecondary, fontSize: 13, marginTop: 2 }]}>
              {insight.exampleEn}
            </Text>
          </View>

          <Text style={[type.caption, { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: Spacing.xs }]}>
            {insight.explanation}
          </Text>

          <View style={[styles.insightFooter, { borderTopColor: colors.divider }]}>
            <Pressable
              onPress={() => onNavigateChapter(insight.sampleChapterNumber)}
              accessibilityRole="button"
              accessibilityLabel={`Vedi nel capitolo ${insight.sampleChapterNumber}`}
              style={{ minHeight: minTouchTarget, justifyContent: 'center' }}>
              <Text style={[type.caption, { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 13 }]}>
                Vedi nel capitolo {insight.sampleChapterNumber} →
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

function VerbiSection({
  verbPatterns,
  colors,
  type,
  minTouchTarget,
  onNavigateChapter,
}: SectionProps & {
  verbPatterns: readonly NotebookVerbPattern[];
}) {
  const [selectedVerbId, setSelectedVerbId] = useState<string>(verbPatterns[0]?.lemmaId ?? 'parlare');
  const [subTab, setSubTab] = useState<'persona' | 'tempo' | 'storia'>('storia');

  const selectedVerb = verbPatterns.find((v) => v.lemmaId === selectedVerbId) ?? verbPatterns[0];

  return (
    <View style={{ gap: Spacing.md }}>
      <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.3 }]}>
        Come cambiano le parole
      </Text>
      <Text style={[type.caption, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
        Scopri come le forme verbali si trasformano in base alla persona, al tempo e all'esperienza di Luca.
      </Text>

      {/* VERB SELECTOR PILLS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
        {verbPatterns.map((verb) => {
          const active = verb.lemmaId === selectedVerb.lemmaId;
          return (
            <Pressable
              key={verb.lemmaId}
              onPress={() => setSelectedVerbId(verb.lemmaId)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.verbPill,
                {
                  backgroundColor: active ? colors.tint : colors.backgroundElevated,
                  borderColor: active ? colors.tint : colors.border,
                  opacity: pressed ? 0.8 : 1,
                  minHeight: minTouchTarget,
                },
              ]}>
              <Text
                style={[
                  type.body,
                  {
                    color: active ? colors.onTint : colors.text,
                    fontFamily: active ? 'Literata_600SemiBold' : 'Literata_400Regular',
                    fontSize: 13,
                  },
                ]}>
                {verb.infinitive}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* SELECTED VERB CARD */}
      <View style={[styles.verbCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
        <View style={styles.verbCardHeader}>
          <View>
            <Text style={[type.heroTitle, { color: colors.text, fontSize: 22, lineHeight: 28 }]}>
              {selectedVerb.infinitive}
            </Text>
            <Text style={[type.caption, { color: colors.textSecondary, fontSize: 14 }]}>
              {selectedVerb.english} · Radice: <Text style={{ fontFamily: 'Literata_600SemiBold' }}>{selectedVerb.root}</Text>
            </Text>
          </View>
          <View style={[styles.groupBadge, { backgroundColor: colors.backgroundHigher }]}>
            <Text style={[type.caption, { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 11 }]}>
              {selectedVerb.regularGroup.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* WHY IT CHANGES */}
        <View style={[styles.whyChangesBox, { backgroundColor: colors.backgroundAtmosphereTop, borderLeftColor: colors.tint }]}>
          <Text style={[type.caption, { color: colors.text, fontSize: 12, lineHeight: 17 }]}>
            💡 {selectedVerb.whyItChanges}
          </Text>
        </View>

        {/* VERB SUB-TABS */}
        <View style={[styles.subTabBar, { borderBottomColor: colors.divider }]}>
          {(
            [
              { id: 'storia', label: '📖 Nella storia' },
              { id: 'persona', label: '👤 Persona' },
              { id: 'tempo', label: '⏳ Tempi' },
            ] as const
          ).map((st) => {
            const active = subTab === st.id;
            return (
              <Pressable
                key={st.id}
                onPress={() => setSubTab(st.id)}
                style={({ pressed }) => [
                  styles.subTabItem,
                  active && { borderBottomColor: colors.tint, borderBottomWidth: 2 },
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                <Text
                  style={[
                    type.caption,
                    {
                      color: active ? colors.text : colors.textMuted,
                      fontFamily: active ? 'Literata_600SemiBold' : 'Literata_400Regular',
                      fontSize: 12,
                    },
                  ]}>
                  {st.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* SUB-TAB CONTENT */}
        {subTab === 'storia' && (
          <View style={{ gap: Spacing.sm, marginTop: Spacing.xs }}>
            {selectedVerb.transformations.map((trans) => (
              <View
                key={trans.form}
                style={[styles.transRow, { backgroundColor: colors.backgroundHigher, borderColor: colors.border }]}>
                <View style={styles.transHeader}>
                  <Text style={[type.heroTitle, { color: colors.tint, fontSize: 16, lineHeight: 20 }]}>
                    {trans.form}
                  </Text>
                  <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, fontSize: 11 }]}>
                    {trans.tenseName}
                  </Text>
                </View>

                <Text style={[type.caption, { color: colors.text, fontSize: 12, marginTop: 2 }]}>
                  {trans.concept}
                </Text>

                <View style={{ marginTop: 4 }}>
                  <Text style={[type.body, { color: colors.text, fontSize: 13, fontStyle: 'italic' }]}>
                    «{trans.quoteIt}»
                  </Text>
                  <Text style={[type.caption, { color: colors.textSecondary, fontSize: 11, marginTop: 1 }]}>
                    {trans.quoteEn}
                  </Text>
                </View>

                <Pressable
                  onPress={() => onNavigateChapter(trans.chapterNumber)}
                  accessibilityRole="button"
                  style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                  <Text style={[type.caption, { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 11 }]}>
                    Capitolo {trans.chapterNumber} →
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {subTab === 'persona' && (
          <View style={[styles.conjugationGrid, { borderColor: colors.border }]}>
            {(
              [
                { p: 'io', form: selectedVerb.presente.io, ending: '-o' },
                { p: 'tu', form: selectedVerb.presente.tu, ending: '-i' },
                { p: 'lui / lei', form: selectedVerb.presente.luiLei, ending: '-a / -e' },
                { p: 'noi', form: selectedVerb.presente.noi, ending: '-iamo' },
                { p: 'voi', form: selectedVerb.presente.voi, ending: '-ate / -ete / -ite' },
                { p: 'loro', form: selectedVerb.presente.loro, ending: '-ano / -ono' },
              ] as const
            ).map((row) => (
              <View key={row.p} style={[styles.gridRow, { borderBottomColor: colors.divider }]}>
                <Text style={[type.caption, { color: colors.textMuted, width: 70, fontSize: 12 }]}>
                  {row.p}
                </Text>
                <Text style={[type.body, { color: colors.text, fontFamily: 'Literata_600SemiBold', fontSize: 14, flex: 1 }]}>
                  {row.form}
                </Text>
                <Text style={[type.caption, { color: colors.tint, fontSize: 11 }]}>
                  desinenza: {row.ending}
                </Text>
              </View>
            ))}
          </View>
        )}

        {subTab === 'tempo' && (
          <View style={{ gap: Spacing.xs, marginTop: Spacing.xs }}>
            <View style={[styles.tenseCard, { backgroundColor: colors.backgroundHigher }]}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint, fontSize: 11 }]}>Presente (Adesso / Abitudine)</Text>
              <Text style={[type.body, { color: colors.text, fontSize: 13, marginTop: 2 }]}>
                io {selectedVerb.presente.io} · noi {selectedVerb.presente.noi} · loro {selectedVerb.presente.loro}
              </Text>
            </View>

            <View style={[styles.tenseCard, { backgroundColor: colors.backgroundHigher }]}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint, fontSize: 11 }]}>Passato Prossimo (Azione compiuta)</Text>
              <Text style={[type.body, { color: colors.text, fontSize: 13, marginTop: 2 }]}>
                io {selectedVerb.passatoProssimo.io} · noi {selectedVerb.passatoProssimo.noi}
              </Text>
            </View>

            <View style={[styles.tenseCard, { backgroundColor: colors.backgroundHigher }]}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint, fontSize: 11 }]}>Imperfetto (Stato passato continuo)</Text>
              <Text style={[type.body, { color: colors.text, fontSize: 13, marginTop: 2 }]}>
                io {selectedVerb.imperfetto.io} · noi {selectedVerb.imperfetto.noi}
              </Text>
            </View>

            {selectedVerb.condizionale ? (
              <View style={[styles.tenseCard, { backgroundColor: colors.backgroundHigher }]}>
                <Text style={[Typography.chapterEyebrow, { color: colors.tint, fontSize: 11 }]}>Condizionale (Desiderio / Garbo)</Text>
                <Text style={[type.body, { color: colors.text, fontSize: 13, marginTop: 2 }]}>
                  io {selectedVerb.condizionale.io} · lui/lei {selectedVerb.condizionale.luiLei}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

function MomentiSection({
  moments,
  completedCount,
  colors,
  type,
  minTouchTarget,
  onNavigateChapter,
}: SectionProps & {
  moments: readonly NotebookMoment[];
  completedCount: number;
}) {
  return (
    <View style={{ gap: Spacing.lg }}>
      <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.3 }]}>
        I cinque momenti di Luca
      </Text>
      <Text style={[type.caption, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
        Dall’arrivo a Roma fino alla scelta di aprire il proprio banco: l’arco narrativo completo.
      </Text>

      {moments.map((moment, idx) => {
        const isReached = completedCount >= moment.chapterStart;
        return (
          <View
            key={moment.id}
            style={[
              styles.momentCard,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.border,
                opacity: isReached || idx === 0 ? 1 : 0.65,
              },
            ]}>
            <View style={styles.momentHeader}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.4 }]}>
                {idx + 1}. Capitoli {moment.chapterStart}–{moment.chapterEnd}
              </Text>
              <Text style={[type.caption, { color: colors.textMuted, fontSize: 12 }]}>
                {moment.tagline}
              </Text>
            </View>

            <Text style={[type.heroTitle, { color: colors.text, fontSize: 20, lineHeight: 26, marginTop: Spacing.xs }]}>
              {moment.titleIt} ({moment.titleEn})
            </Text>

            <Text style={[type.body, { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: Spacing.xs }]}>
              {moment.description}
            </Text>

            {/* CORE THEMES PILLS */}
            <View style={styles.themePillsRow}>
              {moment.coreThemes.map((theme) => (
                <View key={theme} style={[styles.themePill, { backgroundColor: colors.backgroundHigher }]}>
                  <Text style={[type.caption, { color: colors.text, fontSize: 12 }]}>
                    #{theme}
                  </Text>
                </View>
              ))}
            </View>

            {/* SIGNATURE QUOTE */}
            <View style={[styles.quoteBox, { backgroundColor: colors.backgroundAtmosphereTop, borderLeftColor: colors.highlight }]}>
              <Text style={[type.body, { color: colors.text, fontFamily: 'Literata_500Medium', fontSize: 13, fontStyle: 'italic' }]}>
                «{moment.signatureQuote.textIt}»
              </Text>
              <Text style={[type.caption, { color: colors.textMuted, fontSize: 11, marginTop: 2 }]}>
                — {moment.signatureQuote.speaker} · Capitolo {moment.signatureQuote.chapterNumber}
              </Text>
            </View>

            {/* QUICK CHAPTER ACCESS */}
            <View style={[styles.momentFooter, { borderTopColor: colors.divider }]}>
              <Text style={[type.caption, { color: colors.textMuted, fontSize: 12 }]}>
                Leggi:
              </Text>
              <Pressable
                onPress={() => onNavigateChapter(moment.chapterStart)}
                accessibilityRole="button"
                accessibilityLabel={`Inizio momento: Capitolo ${moment.chapterStart}`}>
                <Text style={[type.caption, { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 12 }]}>
                  Cap. {moment.chapterStart} (Inizio)
                </Text>
              </Pressable>
              <Text style={[type.caption, { color: colors.textMuted }]}>·</Text>
              <Pressable
                onPress={() => onNavigateChapter(moment.chapterEnd)}
                accessibilityRole="button"
                accessibilityLabel={`Fine momento: Capitolo ${moment.chapterEnd}`}>
                <Text style={[type.caption, { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 12 }]}>
                  Cap. {moment.chapterEnd} (Conclusione)
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ----------------------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------------------

const styles = StyleSheet.create({
  header: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  milestoneBox: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  growthBox: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  growthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
    justifyContent: 'space-between',
  },
  tabItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  practiceCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  actionBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  statsCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  stagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  stageCol: {
    alignItems: 'center',
    flex: 1,
  },
  stageCount: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 16,
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
  annotationBox: {
    borderLeftWidth: 2.5,
    paddingLeft: Spacing.sm,
    marginTop: 4,
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
  audioBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  formulaBox: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  insightFooter: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
  },
  verbPill: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verbCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  verbCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupBadge: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
  },
  whyChangesBox: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    borderLeftWidth: 3,
  },
  subTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  subTabItem: {
    paddingBottom: Spacing.xs,
  },
  transRow: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  transHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conjugationGrid: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
  },
  tenseCard: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
  },
  momentCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  momentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  themePill: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radii.sm,
  },
  quoteBox: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    borderLeftWidth: 3,
    marginTop: Spacing.xs,
  },
  momentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
  },
});
