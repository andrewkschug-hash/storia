import { Stack, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { getAdaptiveService } from '@/src/adaptive';
import type { AdaptiveLearnerProfile } from '@/src/adaptive/types';
import {
  B1_ASSESSMENT_PASSAGE,
  B1_DIAGNOSTIC_ITEMS,
  evaluateLearnerCrossStoryA1,
  getLevelReadinessService,
  scoreB1Diagnostic,
  type A2ToB1ReadinessEvaluation,
  type CrossStoryA1Readiness,
  type LevelReadiness,
} from '@/src/cefr';
import { LUCA_STORY_ID, getChapterByNumber } from '@/src/content';
import { readerHref } from '@/src/content/storyHrefs';
import { getProgressService } from '@/src/progress';
import { routeAfterLevelReadiness } from '@/src/progress/batchMilestoneRoute';
import type { ReadingProgressRecord } from '@/src/progress/types';
import { getVocabularyService } from '@/src/vocabulary';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

function a1StatusTitle(status: CrossStoryA1Readiness['status']): string {
  if (status === 'CONFIDENT') return 'Very ready';
  if (status === 'READY') return 'Ready';
  if (status === 'APPROACHING') return 'Almost there';
  return 'Keep going';
}

type B1Stage = 'intro' | 'passage' | 'diagnostic' | 'outcome';

export default function LevelReadinessScreen() {
  const { fromChapter } = useLocalSearchParams<{ fromChapter?: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [readiness, setReadiness] = useState<LevelReadiness | null>(null);
  const [crossA1, setCrossA1] = useState<CrossStoryA1Readiness | null>(null);
  const [progressRecord, setProgressRecord] = useState<ReadingProgressRecord | null>(null);
  const [learnerProfile, setLearnerProfile] = useState<AdaptiveLearnerProfile | null>(null);

  const chapterNumber = fromChapter ? Number(fromChapter) : 20;
  const isA1Mode = chapterNumber < 24;
  const isB1Mode = chapterNumber >= 40;

  // B1 Assessment State
  const [b1Stage, setB1Stage] = useState<B1Stage>('intro');
  const [b1DiagIndex, setB1DiagIndex] = useState<number>(0);
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [prodAnswers, setProdAnswers] = useState<Record<string, string>>({});
  const [currentInputText, setCurrentInputText] = useState<string>('');
  const [itemSubmitted, setItemSubmitted] = useState<boolean>(false);
  const [peekPassage, setPeekPassage] = useState<boolean>(false);
  const [b1Evaluation, setB1Evaluation] = useState<A2ToB1ReadinessEvaluation | null>(null);

  useEffect(() => {
    void (async () => {
      const progress = await getProgressService().getOrCreate();
      const profile = await getAdaptiveService().buildProfile(progress);
      setProgressRecord(progress);
      setLearnerProfile(profile);
      setReadiness(getLevelReadinessService().evaluate(profile, progress));

      if (isA1Mode) {
        const vocabulary = await getVocabularyService().getState();
        setCrossA1(await evaluateLearnerCrossStoryA1({ vocabulary }));
      } else {
        setCrossA1(null);
      }
    })();
  }, [chapterNumber, isA1Mode]);

  const copy =
    chapterNumber >= 24
      ? {
          eyebrow: 'Continue reading',
          title: "Luca's story opens up.",
          body: 'The next chapters are a little longer, with more past tense — the same story, told with more Italian.',
          tryLabel: 'Continue',
          stayLabel: 'Browse other stories',
          nextChapter: 25,
        }
      : {
          eyebrow: 'Continue reading',
          title: crossA1 ? a1StatusTitle(crossA1.status) : 'Ready for more',
          body: crossA1?.message ?? 'The next chapters ask a little more of you — same story, richer language.',
          tryLabel: 'Continue',
          stayLabel: 'Browse other stories',
          nextChapter: 21,
        };

  const onTryA1OrA2 = async () => {
    if (busy) return;
    if (isA1Mode && crossA1 && !crossA1.canChooseNext) return;
    setBusy(true);
    try {
      const progress = await getProgressService().getOrCreate();
      const profile = await getAdaptiveService().buildProfile(progress);
      await getLevelReadinessService().chooseNext(profile);
      const speakRoute = routeAfterLevelReadiness(LUCA_STORY_ID, chapterNumber);
      if (speakRoute) {
        router.replace(speakRoute);
        return;
      }
      const next = getChapterByNumber(copy.nextChapter);
      if (next) {
        await getProgressService().openChapter(next.id);
        router.replace(readerHref(LUCA_STORY_ID, next.id));
      } else {
        router.replace('/(tabs)/stories' as Href);
      }
    } finally {
      setBusy(false);
    }
  };

  const onStay = () => {
    router.replace('/(tabs)/stories' as Href);
  };

  // ============================================================
  // B1 ASSESSMENT HANDLERS
  // ============================================================

  const currentB1Item = B1_DIAGNOSTIC_ITEMS[b1DiagIndex];

  const handleSelectChoice = (choiceIndex: number) => {
    if (itemSubmitted || !currentB1Item) return;
    setMcAnswers((prev) => ({ ...prev, [currentB1Item.id]: choiceIndex }));
    setItemSubmitted(true);
  };

  const handleSubmitProduction = () => {
    if (itemSubmitted || !currentB1Item || currentInputText.trim().length === 0) return;
    setProdAnswers((prev) => ({ ...prev, [currentB1Item.id]: currentInputText.trim() }));
    setItemSubmitted(true);
  };

  const handleNextB1Question = () => {
    if (b1DiagIndex < B1_DIAGNOSTIC_ITEMS.length - 1) {
      setB1DiagIndex((prev) => prev + 1);
      setItemSubmitted(false);
      setCurrentInputText('');
      setPeekPassage(false);
    } else {
      // Evaluate full assessment
      if (learnerProfile && progressRecord) {
        const diagResult = scoreB1Diagnostic(mcAnswers, prodAnswers);
        const evalResult = getLevelReadinessService().evaluateA2ToB1(
          learnerProfile,
          progressRecord,
          diagResult,
        );
        setB1Evaluation(evalResult);
      }
      setB1Stage('outcome');
    }
  };

  const handleConfirmB1Promotion = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await getLevelReadinessService().confirmB1Promotion();
      await getProgressService().openChapter('luca-a-roma-41');
      router.replace(readerHref(LUCA_STORY_ID, 'luca-a-roma-41'));
    } finally {
      setBusy(false);
    }
  };

  const handleResetB1Assessment = () => {
    setB1Stage('intro');
    setB1DiagIndex(0);
    setMcAnswers({});
    setProdAnswers({});
    setCurrentInputText('');
    setItemSubmitted(false);
    setPeekPassage(false);
    setB1Evaluation(null);
  };

  // ============================================================
  // B1 FLOW RENDERING
  // ============================================================

  if (isB1Mode) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Traguardo Atto III', headerBackVisible: false }} />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}>
          <ScreenContent maxWidth={680}>
            {/* 1. INTRO STAGE */}
            {b1Stage === 'intro' ? (
              <View style={styles.sectionGap}>
                <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                  Traguardo Atto III · Verso B1
                </Text>
                <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                  Prima di continuare...
                </Text>
                <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                  Hai completato 40 capitoli di Luca a Roma. Ora mettiamo alla prova la tua autonomia
                  con un breve racconto inedito, mai letto prima.
                </Text>

                <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                  <Text style={[Typography.chapterTitle, { color: colors.text, marginBottom: Spacing.sm }]}>
                    Come funziona la verifica
                  </Text>
                  <View style={{ gap: Spacing.sm }}>
                    <Text style={[Typography.body, { color: colors.text }]}>
                      📖 <Text style={{ fontWeight: '600' }}>Leggi il racconto:</Text> una storia indipendente ambientata a Firenze.
                    </Text>
                    <Text style={[Typography.body, { color: colors.text }]}>
                      🎯 <Text style={{ fontWeight: '600' }}>10 domande:</Text> 4 di comprensione, 4 di tempi/connettivi, 2 di produzione.
                    </Text>
                    <Text style={[Typography.body, { color: colors.text }]}>
                      ✨ <Text style={{ fontWeight: '600' }}>Valutazione integrata:</Text> 30% verifica attiva + 70% percorso capitoli 25–40.
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
                  <Pressable
                    onPress={() => setB1Stage('passage')}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1 },
                    ]}>
                    <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                      Leggi la storia →
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={onStay}
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
                    ]}>
                    <Text style={[Typography.button, { color: colors.text }]}>
                      Torna alle storie
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {/* 2. PASSAGE STAGE */}
            {b1Stage === 'passage' ? (
              <View style={styles.sectionGap}>
                <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                  Racconto inedito · Firenze
                </Text>
                <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                  {B1_ASSESSMENT_PASSAGE.title}
                </Text>

                <View style={[styles.passageCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                  {B1_ASSESSMENT_PASSAGE.paragraphs.map((p, idx) => (
                    <Text
                      key={idx}
                      style={[
                        Typography.body,
                        styles.passageParagraph,
                        { color: colors.text },
                      ]}>
                      {p}
                    </Text>
                  ))}
                </View>

                <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
                  <Pressable
                    onPress={() => {
                      setB1DiagIndex(0);
                      setItemSubmitted(false);
                      setCurrentInputText('');
                      setB1Stage('diagnostic');
                    }}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1 },
                    ]}>
                    <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                      Inizia le 10 domande →
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setB1Stage('intro')}
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
                    ]}>
                    <Text style={[Typography.button, { color: colors.text }]}>
                      Indietro
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {/* 3. DIAGNOSTIC STAGE */}
            {b1Stage === 'diagnostic' && currentB1Item ? (
              <View style={styles.sectionGap}>
                {/* Progress header & peek button */}
                <View style={styles.progressRow}>
                  <Text style={[Typography.caption, { color: colors.tint, fontWeight: '700' }]}>
                    DOMANDA {b1DiagIndex + 1} DI {B1_DIAGNOSTIC_ITEMS.length}
                  </Text>
                  <Pressable
                    onPress={() => setPeekPassage((prev) => !prev)}
                    style={styles.peekBtn}>
                    <Text style={[Typography.caption, { color: colors.tint }]}>
                      {peekPassage ? 'Nascondi testo ▴' : 'Rileggi il testo ▾'}
                    </Text>
                  </Pressable>
                </View>

                {/* Progress bar */}
                <View style={[styles.progressBarTrack, { backgroundColor: colors.progressTrack }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: colors.progressFill,
                        width: `${((b1DiagIndex + 1) / B1_DIAGNOSTIC_ITEMS.length) * 100}%`,
                      },
                    ]}
                  />
                </View>

                {/* Optional peek passage card */}
                {peekPassage ? (
                  <View style={[styles.peekCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                    <Text style={[Typography.chapterTitle, { color: colors.text, marginBottom: Spacing.sm }]}>
                      {B1_ASSESSMENT_PASSAGE.title}
                    </Text>
                    {B1_ASSESSMENT_PASSAGE.paragraphs.map((p, idx) => (
                      <Text
                        key={idx}
                        style={[Typography.body, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
                        {p}
                      </Text>
                    ))}
                  </View>
                ) : null}

                {/* Question card */}
                <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                  <Text style={[Typography.caption, { color: colors.textMuted, marginBottom: Spacing.xs }]}>
                    {currentB1Item.section === 'reading_inference'
                      ? 'Comprensione del testo'
                      : currentB1Item.section === 'aspect_tense'
                      ? 'Grammatica & Aspetto Verbale'
                      : 'Produzione Libera'}
                  </Text>
                  <Text style={[Typography.chapterTitle, { color: colors.text, marginBottom: Spacing.md }]}>
                    {currentB1Item.question}
                  </Text>

                  {/* Multiple Choice Options */}
                  {currentB1Item.type === 'multiple_choice' && currentB1Item.choices ? (
                    <View style={{ gap: Spacing.sm }}>
                      {currentB1Item.choices.map((choiceText, cIdx) => {
                        const isSelected = mcAnswers[currentB1Item.id] === cIdx;
                        const isCorrect = currentB1Item.correctChoice === cIdx;
                        let optionBg: string = colors.backgroundElevated;
                        let optionBorder: string = colors.border;

                        if (itemSubmitted) {
                          if (isSelected && isCorrect) {
                            optionBg = colors.accentSoft;
                            optionBorder = colors.tint;
                          } else if (isSelected && !isCorrect) {
                            optionBg = colors.accentSoft;
                            optionBorder = colors.danger;
                          } else if (isCorrect) {
                            optionBorder = colors.tint;
                          }
                        } else if (isSelected) {
                          optionBg = colors.accentSoft;
                          optionBorder = colors.tint;
                        }

                        return (
                          <Pressable
                            key={cIdx}
                            disabled={itemSubmitted}
                            onPress={() => handleSelectChoice(cIdx)}
                            style={({ pressed }) => [
                              styles.choiceBtn,
                              {
                                backgroundColor: optionBg,
                                borderColor: optionBorder,
                                opacity: pressed && !itemSubmitted ? 0.8 : 1,
                              },
                            ]}>
                            <Text style={[Typography.body, { color: colors.text }]}>
                              {choiceText}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}

                  {/* Production Text Input */}
                  {currentB1Item.type === 'production' ? (
                    <View style={{ gap: Spacing.md }}>
                      {currentB1Item.promptEn ? (
                        <View style={[styles.promptBox, { backgroundColor: colors.accentSoft }]}>
                          <Text style={[Typography.caption, { color: colors.textMuted }]}>
                            English prompt:
                          </Text>
                          <Text style={[Typography.body, { color: colors.text, fontWeight: '500' }]}>
                            {currentB1Item.promptEn}
                          </Text>
                        </View>
                      ) : null}

                      {!itemSubmitted ? (
                        <View style={{ gap: Spacing.sm }}>
                          <TextInput
                            value={currentInputText}
                            onChangeText={setCurrentInputText}
                            placeholder="Scrivi qui la tua frase in italiano..."
                            placeholderTextColor={colors.textMuted}
                            style={[
                              styles.textInput,
                              {
                                backgroundColor: colors.backgroundElevated,
                                borderColor: colors.border,
                                color: colors.text,
                              },
                            ]}
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            multiline
                          />
                          <Pressable
                            disabled={currentInputText.trim().length === 0}
                            onPress={handleSubmitProduction}
                            style={({ pressed }) => [
                              styles.primaryBtn,
                              {
                                backgroundColor: colors.buttonPrimary,
                                opacity:
                                  pressed || currentInputText.trim().length === 0 ? 0.6 : 1,
                              },
                            ]}>
                            <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                              Conferma risposta
                            </Text>
                          </Pressable>
                        </View>
                      ) : (
                        <View style={[styles.userTextDisplay, { borderColor: colors.border }]}>
                          <Text style={[Typography.caption, { color: colors.textMuted }]}>
                            La tua risposta:
                          </Text>
                          <Text style={[Typography.body, { color: colors.text, marginTop: Spacing.xs }]}>
                            {prodAnswers[currentB1Item.id]}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : null}

                  {/* Feedback on answer */}
                  {itemSubmitted ? (
                    <View
                      style={[
                        styles.feedbackBox,
                        {
                          backgroundColor: colors.accentSoft,
                          borderColor: colors.border,
                        },
                      ]}>
                      <Text style={[Typography.caption, { color: colors.text, lineHeight: 20 }]}>
                        💡 {currentB1Item.explanation}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Continue button */}
                {itemSubmitted ? (
                  <View style={{ marginTop: Spacing.md }}>
                    <Pressable
                      onPress={handleNextB1Question}
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1 },
                      ]}>
                      <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                        {b1DiagIndex < B1_DIAGNOSTIC_ITEMS.length - 1
                          ? 'Domanda successiva →'
                          : 'Vedi il risultato →'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* 4. OUTCOME STAGE */}
            {b1Stage === 'outcome' && b1Evaluation ? (
              <View style={styles.sectionGap}>
                <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                  Esito Valutazione B1
                </Text>

                {b1Evaluation.canChooseNext ? (
                  <>
                    <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                      {b1Evaluation.status === 'CONFIDENT'
                        ? 'Eccellente! Livello B1 Raggiunto ✨'
                        : 'Pronto per il Livello B1! 🎉'}
                    </Text>
                    <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                      Hai dimostrato piena autonomia sia sul racconto inedito a Firenze, sia attraverso i
                      40 capitoli dell’Atto III.
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                      Quasi pronto per il B1 🌱
                    </Text>
                    <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                      Hai completato la verifica. Alcune aree necessitano di un piccolo consolidamento
                      prima di aprire l’Atto IV.
                    </Text>
                  </>
                )}

                {/* Detailed Score Breakdown Card */}
                <View style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                  <Text style={[Typography.chapterTitle, { color: colors.text, marginBottom: Spacing.sm }]}>
                    Riepilogo Punteggio Integrato
                  </Text>

                  <View style={{ gap: Spacing.sm }}>
                    <View style={styles.metricRow}>
                      <Text style={[Typography.body, { color: colors.text }]}>Punteggio Finale</Text>
                      <Text style={[Typography.body, { color: colors.tint, fontWeight: '700' }]}>
                        {b1Evaluation.compositeScore.toFixed(0)}%
                      </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                    <View style={styles.metricRow}>
                      <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                        • Verifica Attiva (30%)
                      </Text>
                      <Text style={[Typography.caption, { color: colors.text, fontWeight: '600' }]}>
                        {b1Evaluation.diagnostic.totalScore} / 10 ({b1Evaluation.diagnostic.percentage.toFixed(0)}%)
                      </Text>
                    </View>

                    <View style={styles.metricRow}>
                      <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                        • Percorso Atto III (70%)
                      </Text>
                      <Text style={[Typography.caption, { color: colors.text, fontWeight: '600' }]}>
                        {b1Evaluation.longitudinal.longitudinalPercentage.toFixed(0)}%
                      </Text>
                    </View>

                    <View style={styles.metricRow}>
                      <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                        • Comprensione Ch 25–40
                      </Text>
                      <Text style={[Typography.caption, { color: colors.text, fontWeight: '600' }]}>
                        {(b1Evaluation.longitudinal.comprehensionScore * 100).toFixed(0)}%
                      </Text>
                    </View>

                    <View style={styles.metricRow}>
                      <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                        • Autonomia Lessicale (Tap)
                      </Text>
                      <Text style={[Typography.caption, { color: colors.text, fontWeight: '600' }]}>
                        {(b1Evaluation.longitudinal.tapAutonomyScore * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Recommendations if any */}
                {b1Evaluation.recommendations.length > 0 ? (
                  <View style={[styles.card, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}>
                    <Text style={[Typography.caption, { color: colors.textMuted, fontWeight: '700', marginBottom: Spacing.xs }]}>
                      CONSIGLI DI STUDIO
                    </Text>
                    {b1Evaluation.recommendations.map((rec, rIdx) => (
                      <Text key={rIdx} style={[Typography.body, { color: colors.text, marginTop: Spacing.xs }]}>
                        • {rec}
                      </Text>
                    ))}
                  </View>
                ) : null}

                {/* Action CTAs */}
                <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
                  {b1Evaluation.canChooseNext ? (
                    <Pressable
                      disabled={busy}
                      onPress={() => void handleConfirmB1Promotion()}
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        { backgroundColor: colors.buttonPrimary, opacity: pressed || busy ? 0.88 : 1 },
                      ]}>
                      <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                        Inizia l’Atto IV (B1) →
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={handleResetB1Assessment}
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1 },
                      ]}>
                      <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                        Riprova la verifica
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    onPress={onStay}
                    style={({ pressed }) => [
                      styles.secondaryBtn,
                      { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
                    ]}>
                    <Text style={[Typography.button, { color: colors.text }]}>
                      {b1Evaluation.canChooseNext ? 'Esplora la biblioteca' : 'Torna alle storie A2'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </ScreenContent>
        </ScrollView>
      </AtmosphereBackground>
    );
  }

  // ============================================================
  // A1 / A1+ FLOW RENDERING (Chapter 20 / Chapter 24)
  // ============================================================

  const showA1Try = !isA1Mode || Boolean(crossA1?.canChooseNext);

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Next stories', headerBackVisible: false }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={680}>
          {!readiness || (isA1Mode && !crossA1) ? (
            <ActivityIndicator color={colors.tint} />
          ) : (
            <>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>{copy.eyebrow}</Text>
              <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                {copy.title}
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                {copy.body}
              </Text>
              {!isA1Mode ? (
                <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.md }]}>
                  {readiness.message}
                </Text>
              ) : null}

              {isA1Mode && crossA1 ? (
                <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
                  {crossA1.groups.map((group) => (
                    <Text key={group.id} style={[Typography.body, { color: colors.text }]}>
                      {group.met ? '✓' : '○'}  {group.label}
                    </Text>
                  ))}
                  {crossA1.reasons[0] ? (
                    <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
                      {crossA1.reasons[0]}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
                {showA1Try ? (
                  <Pressable
                    disabled={busy}
                    onPress={() => void onTryA1OrA2()}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      { backgroundColor: colors.buttonPrimary, opacity: pressed || busy ? 0.88 : 1 },
                    ]}>
                    <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>{copy.tryLabel}</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={onStay}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.text }]}>{copy.stayLabel}</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  content: {},
  sectionGap: {
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  passageCard: {
    padding: Spacing.lg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  passageParagraph: {
    lineHeight: 28,
    marginBottom: Spacing.md,
    fontSize: 17,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  peekBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  peekCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  choiceBtn: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  promptBox: {
    padding: Spacing.md,
    borderRadius: Radii.md,
  },
  textInput: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    minHeight: 80,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  userTextDisplay: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  feedbackBox: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  primaryBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
