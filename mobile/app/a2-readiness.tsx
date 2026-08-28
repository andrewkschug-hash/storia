import { Stack, router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
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
import {
  A2_B1_READINESS_ASSESSMENT,
  evaluateA2Readiness,
  type A2LearnerAnswer,
  type A2ReadinessChoiceQuestion,
  type A2ReadinessEvaluation,
  type A2ReadinessProductionQuestion,
} from '@/src/cefr';
import { LUCA_STORY_ID } from '@/src/content';
import { readerHref } from '@/src/content/storyHrefs';
import { getProgressService } from '@/src/progress';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Stage =
  | 'intro'
  | 'passage'
  | 'reading'
  | 'grammar_inference'
  | 'production'
  | 'results';

export default function A2ReadinessScreen() {
  const { fromChapter } = useLocalSearchParams<{ fromChapter?: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [stage, setStage] = useState<Stage>('intro');
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [prodAnswers, setProdAnswers] = useState<Record<string, string>>({
    'a2-readiness-q9': '',
    'a2-readiness-q10': '',
  });
  const [showPassageModal, setShowPassageModal] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<A2ReadinessEvaluation | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [showAllQuestionsReview, setShowAllQuestionsReview] = useState<boolean>(false);

  const assessment = A2_B1_READINESS_ASSESSMENT;
  const readingQuestions = assessment.questions.slice(0, 3) as A2ReadinessChoiceQuestion[];
  const grammarQuestions = assessment.questions.slice(3, 6) as A2ReadinessChoiceQuestion[];
  const inferenceQuestions = assessment.questions.slice(6, 8) as A2ReadinessChoiceQuestion[];
  const productionQuestions = assessment.questions.slice(8, 10) as A2ReadinessProductionQuestion[];

  const handleSelectChoice = (questionId: string, choiceIndex: number) => {
    setMcAnswers((prev) => ({ ...prev, [questionId]: choiceIndex }));
  };

  const handleSetProduction = (questionId: string, text: string) => {
    setProdAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const allReadingAnswered = readingQuestions.every((q) => mcAnswers[q.id] !== undefined);
  const allGrammarInferenceAnswered =
    grammarQuestions.every((q) => mcAnswers[q.id] !== undefined) &&
    inferenceQuestions.every((q) => mcAnswers[q.id] !== undefined);
  const allProductionAnswered =
    (prodAnswers['a2-readiness-q9'] || '').trim().length >= 4 &&
    (prodAnswers['a2-readiness-q10'] || '').trim().length >= 4;

  const handleFinishAssessment = () => {
    const answers: A2LearnerAnswer[] = [
      ...Object.entries(mcAnswers).map(([questionId, choiceIndex]) => ({
        questionId,
        choiceIndex,
      })),
      ...Object.entries(prodAnswers).map(([questionId, text]) => ({
        questionId,
        text,
      })),
    ];

    const result = evaluateA2Readiness(answers);
    setEvaluation(result);
    setStage('results');
  };

  const handleAdvanceToB1 = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const progressService = getProgressService();
      await progressService.setCEFRLevel('B1');
      await progressService.completeCheckpoint('luca-a-roma:a2-readiness');
      await progressService.openChapter('luca-a-roma-41');
      router.replace(readerHref(LUCA_STORY_ID, 'luca-a-roma-41'));
    } finally {
      setBusy(false);
    }
  };

  const handleExplorePauseStories = () => {
    router.replace('/reader/la-casa-delle-finestre/casa-01' as Href);
  };

  const handleRetry = () => {
    setMcAnswers({});
    setProdAnswers({
      'a2-readiness-q9': '',
      'a2-readiness-q10': '',
    });
    setEvaluation(null);
    setStage('passage');
  };

  const handleReturnToStories = () => {
    router.replace('/(tabs)/stories' as Href);
  };

  return (
    <AtmosphereBackground>
      <Stack.Screen
        options={{
          title: 'A2 → B1 Readiness Check',
          headerBackVisible: false,
        }}
      />

      {/* Passage Modal for peek while answering questions */}
      <Modal
        visible={showPassageModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPassageModal(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.background }]}>
          <ScrollView
            contentContainerStyle={[
              styles.modalContent,
              { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.lg },
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                {assessment.passage.location}
              </Text>
              <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.xs }]}>
                {assessment.passage.title}
              </Text>
            </View>

            <View style={[styles.passageCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
              <Text style={[Typography.reader, { color: colors.text, lineHeight: 28 }]}>
                {assessment.passage.text}
              </Text>
            </View>

            <Pressable
              onPress={() => setShowPassageModal(false)}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.buttonPrimary, marginTop: Spacing.xl, opacity: pressed ? 0.88 : 1 },
              ]}>
              <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                Torna alle domande
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={680}>
          {/* ============================================================ */}
          {/* STAGE 1: INTRO */}
          {/* ============================================================ */}
          {stage === 'intro' ? (
            <View style={styles.sectionGap}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                {assessment.subtitle}
              </Text>
              <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                {assessment.title}
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                {assessment.introText}
              </Text>

              <View
                style={[
                  styles.card,
                  { backgroundColor: colors.backgroundElevated, borderColor: colors.border, marginTop: Spacing.lg },
                ]}>
                <Text style={[Typography.chapterTitle, { color: colors.text, marginBottom: Spacing.md }]}>
                  Come è strutturata la verifica
                </Text>
                <View style={{ gap: Spacing.sm }}>
                  <Text style={[Typography.body, { color: colors.text }]}>
                    📖 <Text style={{ fontWeight: '600' }}>1. Leggi:</Text> Un racconto inedito ambientato a Firenze.
                  </Text>
                  <Text style={[Typography.body, { color: colors.text }]}>
                    🧩 <Text style={{ fontWeight: '600' }}>2. Nota:</Text> 3 domande di comprensione del testo.
                  </Text>
                  <Text style={[Typography.body, { color: colors.text }]}>
                    💭 <Text style={{ fontWeight: '600' }}>3. Collega:</Text> 5 domande su tempi verbali, pronomi e connettori.
                  </Text>
                  <Text style={[Typography.body, { color: colors.text }]}>
                    ✍️ <Text style={{ fontWeight: '600' }}>4. Prova a dirlo:</Text> 2 frasi da comporre liberamente.
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
                <Pressable
                  onPress={() => setStage('passage')}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                    Inizia la lettura →
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleReturnToStories}
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

          {/* ============================================================ */}
          {/* STAGE 2: PASSAGE */}
          {/* ============================================================ */}
          {stage === 'passage' ? (
            <View style={styles.sectionGap}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                {assessment.passage.location}
              </Text>
              <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                {assessment.passage.title}
              </Text>

              <View
                style={[
                  styles.passageCard,
                  { backgroundColor: colors.backgroundElevated, borderColor: colors.border, marginTop: Spacing.md },
                ]}>
                <Text style={[Typography.reader, { color: colors.text, lineHeight: 28 }]}>
                  {assessment.passage.text}
                </Text>
              </View>

              <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
                <Pressable
                  onPress={() => setStage('reading')}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                    Vai alle domande di comprensione →
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setStage('intro')}
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

          {/* ============================================================ */}
          {/* STAGE 3: READING COMPREHENSION (Q1–Q3) */}
          {/* ============================================================ */}
          {stage === 'reading' ? (
            <View style={styles.sectionGap}>
              <View style={styles.progressRow}>
                <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                  Parte 1 di 3 · Comprensione del testo
                </Text>
                <Pressable
                  onPress={() => setShowPassageModal(true)}
                  style={styles.peekBtn}>
                  <Text style={[Typography.caption, { color: colors.tint, fontWeight: '600' }]}>
                    Rileggi il racconto 📖
                  </Text>
                </Pressable>
              </View>

              <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.xs }]}>
                🧩 Nota
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                Rispondi alle domande su ciò che è successo nella bottega di Firenze.
              </Text>

              {readingQuestions.map((q, qIndex) => (
                <View
                  key={q.id}
                  style={[
                    styles.card,
                    { backgroundColor: colors.backgroundElevated, borderColor: colors.border, marginTop: Spacing.md },
                  ]}>
                  <Text style={[Typography.caption, { color: colors.textMuted, marginBottom: Spacing.xs }]}>
                    Domanda {qIndex + 1} di 10 · {q.skill}
                  </Text>
                  <Text style={[Typography.chapterTitle, { color: colors.text, marginBottom: Spacing.md, fontSize: 18 }]}>
                    {q.prompt}
                  </Text>

                  <View style={{ gap: Spacing.sm }}>
                    {q.choices.map((choice, cIndex) => {
                      const isSelected = mcAnswers[q.id] === cIndex;
                      return (
                        <Pressable
                          key={cIndex}
                          onPress={() => handleSelectChoice(q.id, cIndex)}
                          style={({ pressed }) => [
                            styles.choiceBtn,
                            {
                              backgroundColor: isSelected ? colors.accentSoft : colors.backgroundElevated,
                              borderColor: isSelected ? colors.tint : colors.border,
                              opacity: pressed ? 0.85 : 1,
                            },
                          ]}>
                          <Text style={[Typography.body, { color: colors.text }]}>
                            {isSelected ? '● ' : '○ '} {choice}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}

              <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
                <Pressable
                  disabled={!allReadingAnswered}
                  onPress={() => setStage('grammar_inference')}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.buttonPrimary,
                      opacity: pressed || !allReadingAnswered ? 0.6 : 1,
                    },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                    Continua con la grammatica (4–8) →
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setStage('passage')}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.text }]}>
                    Rileggi il racconto
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* ============================================================ */}
          {/* STAGE 4: GRAMMAR & INFERENCE (Q4–Q8) */}
          {/* ============================================================ */}
          {stage === 'grammar_inference' ? (
            <View style={styles.sectionGap}>
              <View style={styles.progressRow}>
                <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                  Parte 2 di 3 · Grammatica e connettori
                </Text>
                <Pressable
                  onPress={() => setShowPassageModal(true)}
                  style={styles.peekBtn}>
                  <Text style={[Typography.caption, { color: colors.tint, fontWeight: '600' }]}>
                    Rileggi il racconto 📖
                  </Text>
                </Pressable>
              </View>

              <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.xs }]}>
                💭 Collega
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                Analizza i tempi verbali, i pronomi e i connettori logici usati nel testo.
              </Text>

              {[...grammarQuestions, ...inferenceQuestions].map((q, idx) => (
                <View
                  key={q.id}
                  style={[
                    styles.card,
                    { backgroundColor: colors.backgroundElevated, borderColor: colors.border, marginTop: Spacing.md },
                  ]}>
                  <Text style={[Typography.caption, { color: colors.textMuted, marginBottom: Spacing.xs }]}>
                    Domanda {idx + 4} di 10 · {q.skill}
                  </Text>
                  <Text style={[Typography.chapterTitle, { color: colors.text, marginBottom: Spacing.md, fontSize: 18 }]}>
                    {q.prompt}
                  </Text>

                  <View style={{ gap: Spacing.sm }}>
                    {q.choices.map((choice, cIndex) => {
                      const isSelected = mcAnswers[q.id] === cIndex;
                      return (
                        <Pressable
                          key={cIndex}
                          onPress={() => handleSelectChoice(q.id, cIndex)}
                          style={({ pressed }) => [
                            styles.choiceBtn,
                            {
                              backgroundColor: isSelected ? colors.accentSoft : colors.backgroundElevated,
                              borderColor: isSelected ? colors.tint : colors.border,
                              opacity: pressed ? 0.85 : 1,
                            },
                          ]}>
                          <Text style={[Typography.body, { color: colors.text }]}>
                            {isSelected ? '● ' : '○ '} {choice}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}

              <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
                <Pressable
                  disabled={!allGrammarInferenceAnswered}
                  onPress={() => setStage('production')}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.buttonPrimary,
                      opacity: pressed || !allGrammarInferenceAnswered ? 0.6 : 1,
                    },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                    Continua con la produzione scritta (9–10) →
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setStage('reading')}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.text }]}>
                    Torna alla parte 1
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* ============================================================ */}
          {/* STAGE 5: PRODUCTION (Q9–Q10) */}
          {/* ============================================================ */}
          {stage === 'production' ? (
            <View style={styles.sectionGap}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                Parte 3 di 3 · Produzione scritta
              </Text>
              <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.xs }]}>
                ✍️ Prova a dirlo
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                Componi due frasi autentiche utilizzando i connettori richiesti.
              </Text>

              {productionQuestions.map((q, idx) => (
                <View
                  key={q.id}
                  style={[
                    styles.card,
                    { backgroundColor: colors.backgroundElevated, borderColor: colors.border, marginTop: Spacing.md },
                  ]}>
                  <Text style={[Typography.caption, { color: colors.textMuted, marginBottom: Spacing.xs }]}>
                    Domanda {idx + 9} di 10 · {q.skill}
                  </Text>
                  <Text style={[Typography.chapterTitle, { color: colors.text, marginBottom: Spacing.xs, fontSize: 18 }]}>
                    {q.prompt}
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: Spacing.sm }]}>
                    💡 {q.hint}
                  </Text>

                  <TextInput
                    value={prodAnswers[q.id]}
                    onChangeText={(val) => handleSetProduction(q.id, val)}
                    placeholder="Scrivi qui la tua frase in italiano..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.readerSurface,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                  />
                  <Text style={[Typography.caption, { color: colors.textMuted, textAlign: 'right', marginTop: 4 }]}>
                    {prodAnswers[q.id]?.length || 0} caratteri
                  </Text>
                </View>
              ))}

              <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
                <Pressable
                  disabled={!allProductionAnswered}
                  onPress={handleFinishAssessment}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.buttonPrimary,
                      opacity: pressed || !allProductionAnswered ? 0.6 : 1,
                    },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                    Conferma e visualizza i risultati →
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setStage('grammar_inference')}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.text }]}>
                    Torna alla parte 2
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* ============================================================ */}
          {/* STAGE 6: RESULTS */}
          {/* ============================================================ */}
          {stage === 'results' && evaluation ? (
            <View style={styles.sectionGap}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                Verifica A2 → B1 completata
              </Text>
              <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.xs }]}>
                {evaluation.headline}
              </Text>

              {/* Score & Status Card */}
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: evaluation.canAdvanceToB1 ? colors.tint : colors.border,
                    marginTop: Spacing.md,
                  },
                ]}>
                <View style={styles.scoreRow}>
                  <View>
                    <Text style={[Typography.caption, { color: colors.textMuted }]}>
                      PUNTEGGIO TOTALE
                    </Text>
                    <Text style={[Typography.heroTitle, { color: colors.text, fontSize: 32 }]}>
                      {evaluation.totalScore.toFixed(1)} / {evaluation.maxScore.toFixed(1)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: evaluation.canAdvanceToB1
                          ? colors.accentSoft
                          : colors.backgroundElevated,
                        borderColor: evaluation.canAdvanceToB1 ? colors.tint : colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        Typography.label,
                        {
                          color: evaluation.canAdvanceToB1 ? colors.tint : colors.textMuted,
                          fontWeight: '700',
                        },
                      ]}>
                      {evaluation.status}
                    </Text>
                  </View>
                </View>

                {/* Domain Floors Breakdown */}
                <View style={{ marginTop: Spacing.lg, gap: Spacing.sm }}>
                  <Text style={[Typography.caption, { color: colors.textMuted, fontWeight: '700' }]}>
                    LIVELLI MINIMI PER COMPETENZA:
                  </Text>
                  {Object.values(evaluation.domains).map((d) => (
                    <View key={d.domain} style={styles.domainRow}>
                      <Text style={[Typography.body, { color: colors.text, flex: 1 }]}>
                        {d.metFloor ? '✓' : '○'} {d.label}
                      </Text>
                      <Text style={[Typography.caption, { color: d.metFloor ? colors.tint : colors.textMuted }]}>
                        {d.earned.toFixed(1)} / {d.possible.toFixed(1)} pts
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Diagnostic Feedback */}
                <View style={{ marginTop: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
                  {evaluation.reasons.map((reason, idx) => (
                    <Text key={idx} style={[Typography.body, { color: colors.textSecondary, marginBottom: 4 }]}>
                      • {reason}
                    </Text>
                  ))}
                  <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
                    {evaluation.remediationAdvice}
                  </Text>
                </View>
              </View>

              {/* Question Review Accordion */}
              <Pressable
                onPress={() => setShowAllQuestionsReview((prev) => !prev)}
                style={[styles.accordionToggle, { borderColor: colors.border, marginTop: Spacing.lg }]}>
                <Text style={[Typography.body, { color: colors.tint, fontWeight: '600' }]}>
                  {showAllQuestionsReview ? '▲ Nascondi dettaglio risposte' : '▼ Mostra dettaglio delle 10 domande con spiegazioni'}
                </Text>
              </Pressable>

              {showAllQuestionsReview ? (
                <View style={{ marginTop: Spacing.md, gap: Spacing.md }}>
                  {evaluation.questionResults.map((qr, idx) => (
                    <View
                      key={qr.questionId}
                      style={[
                        styles.reviewCard,
                        {
                          backgroundColor: colors.backgroundElevated,
                          borderColor: qr.score >= 1.0 ? colors.tint : qr.score > 0 ? colors.border : colors.danger,
                        },
                      ]}>
                      <Text style={[Typography.caption, { color: colors.textMuted }]}>
                        Domanda {idx + 1} ({qr.domain}) · {qr.score.toFixed(1)} pt
                      </Text>
                      <Text style={[Typography.body, { color: colors.text, fontWeight: '600', marginTop: 2 }]}>
                        {qr.prompt}
                      </Text>
                      <Text style={[Typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
                        La tua risposta: <Text style={{ color: colors.text }}>{qr.userAnswer}</Text>
                      </Text>
                      {qr.score < 1.0 ? (
                        <Text style={[Typography.body, { color: colors.tint, marginTop: 2 }]}>
                          Risposta corretta/modello: <Text style={{ color: colors.text }}>{qr.correctAnswer}</Text>
                        </Text>
                      ) : null}
                      <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                        💡 {qr.explanation}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Action Buttons */}
              <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
                {evaluation.canAdvanceToB1 ? (
                  <Pressable
                    disabled={busy}
                    onPress={handleAdvanceToB1}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      { backgroundColor: colors.buttonPrimary, opacity: pressed || busy ? 0.88 : 1 },
                    ]}>
                    {busy ? (
                      <ActivityIndicator color={colors.onButtonPrimary} />
                    ) : (
                      <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                        Continua con il Capitolo 41 →
                      </Text>
                    )}
                  </Pressable>
                ) : (
                  <>
                    <Pressable
                      onPress={handleExplorePauseStories}
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1 },
                      ]}>
                      <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>
                        Esplora le pause di lettura (La casa delle finestre) →
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleRetry}
                      style={({ pressed }) => [
                        styles.secondaryBtn,
                        { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
                      ]}>
                      <Text style={[Typography.button, { color: colors.text }]}>
                        Riprova la verifica
                      </Text>
                    </Pressable>
                  </>
                )}
                <Pressable
                  onPress={handleReturnToStories}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { borderColor: colors.border, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.text }]}>
                    Torna alla libreria
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

const styles = StyleSheet.create({
  content: {},
  sectionGap: {
    gap: Spacing.xs,
  },
  card: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  passageCard: {
    padding: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  choiceBtn: {
    padding: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  textInput: {
    padding: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peekBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  domainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionToggle: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  reviewCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
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
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: Spacing.lg,
  },
  modalHeader: {
    marginBottom: Spacing.md,
  },
});
