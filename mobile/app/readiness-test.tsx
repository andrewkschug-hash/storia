import { Stack, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
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

import {
  A2_READINESS_ASSESSMENT,
  evaluateReadinessAssessment,
  getReadinessAssessmentForLevel,
  type LearnerAnswer,
  type ReadinessAssessmentData,
  type ReadinessChoiceQuestion,
  type ReadinessEvaluation,
  type ReadinessProductionQuestion,
} from '@/src/cefr/readinessAssessments';
import { AppSymbol } from '@/src/components/AppSymbol';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { LevelOutcomeCard } from '@/src/components/levelGate/LevelOutcomeCard';
import { ScreenContent } from '@/src/components/ScreenContent';
import { LUCA_STORY_ID } from '@/src/content/catalog';
import { readerHref } from '@/src/content/storyHrefs';
import { getProgressService } from '@/src/progress';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type TestStage = 'intro' | 'passage' | 'questions' | 'outcome';

export default function ReadinessTestScreen() {
  const { level } = useLocalSearchParams<{ level?: string }>();
  const { colors, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();

  const assessment: ReadinessAssessmentData =
    getReadinessAssessmentForLevel(level ?? 'A2') ?? A2_READINESS_ASSESSMENT;

  const [stage, setStage] = useState<TestStage>('intro');
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [prodAnswers, setProdAnswers] = useState<Record<string, string>>({});
  const [showPassageModal, setShowPassageModal] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<ReadinessEvaluation | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const choiceQuestions = assessment.questions.filter(
    (q): q is ReadinessChoiceQuestion => q.domain !== 'production',
  );
  const productionQuestions = assessment.questions.filter(
    (q): q is ReadinessProductionQuestion => q.domain === 'production',
  );

  const allAnswered =
    choiceQuestions.every((q) => mcAnswers[q.id] !== undefined) &&
    productionQuestions.every((q) => (prodAnswers[q.id] || '').trim().length >= 4);

  const handleFinishAssessment = async () => {
    if (busy) return;
    setBusy(true);

    const answers: LearnerAnswer[] = [
      ...Object.entries(mcAnswers).map(([questionId, choiceIndex]) => ({
        questionId,
        choiceIndex,
      })),
      ...Object.entries(prodAnswers).map(([questionId, text]) => ({
        questionId,
        text,
      })),
    ];

    const result = evaluateReadinessAssessment(assessment, answers, LUCA_STORY_ID);
    setEvaluation(result);

    if (result.isReady) {
      try {
        const progressService = getProgressService(LUCA_STORY_ID);
        await progressService.unlockLevelGate(assessment.targetLevel);
      } catch (err) {
        console.error('Failed to unlock level gate:', err);
      }
    }

    setBusy(false);
    setStage('outcome');
  };

  const handleStartChapter = async (chapterNumber: number, chapterId: string) => {
    try {
      const progressService = getProgressService(LUCA_STORY_ID);
      await progressService.startAtChapter(chapterId);
      router.replace(readerHref(LUCA_STORY_ID, chapterId) as Href);
    } catch {
      router.replace('/(tabs)/stories' as Href);
    }
  };

  return (
    <AtmosphereBackground>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: insets.bottom + Spacing.xxl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={640}>
          {/* Top navigation row */}
          <View style={styles.topNav}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
              <Text style={[Typography.caption, { color: colors.textMuted }]}>← Back</Text>
            </Pressable>
            <Text style={[Typography.chapterEyebrow, { color: colors.tint, letterSpacing: 1.2 }]}>
              {assessment.subtitle.toUpperCase()}
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {/* STAGE 1: INTRO */}
          {stage === 'intro' ? (
            <View style={[styles.introCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
              <View style={[styles.levelPill, { backgroundColor: 'rgba(120, 182, 163, 0.12)', borderColor: colors.tint }]}>
                <Text style={[styles.levelPillText, { color: colors.tint }]}>
                  {assessment.targetLevel} READINESS
                </Text>
              </View>

              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Are you ready for {assessment.targetLevel}?
              </Text>

              <Text style={[styles.heroBody, { color: colors.textSecondary }]}>
                Read a little. Listen carefully. Show us what you understand.
              </Text>

              <Text style={[styles.heroNote, { color: colors.textMuted }]}>
                This isn’t a test you need to study for. It’s simply a way to find the right place in Luca’s journey to begin.
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Begin Readiness Test"
                onPress={() => setStage('passage')}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.tint,
                    opacity: pressed ? 0.88 : 1,
                    minHeight: minTouchTarget,
                  },
                ]}>
                <Text style={[styles.primaryBtnText, { color: colors.background }]}>
                  Begin →
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* STAGE 2: UNSEEN PASSAGE */}
          {stage === 'passage' ? (
            <View style={[styles.passageCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
              <View style={styles.passageHeader}>
                <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
                  {assessment.passage.location}
                </Text>
                <Text style={[styles.passageTitle, { color: colors.text }]}>
                  {assessment.passage.title}
                </Text>
              </View>

              <View style={styles.passageBody}>
                {assessment.passage.text.split('\n\n').map((paragraph, index) => (
                  <Text
                    key={index}
                    style={[styles.paragraphText, { color: colors.text }]}>
                    {paragraph}
                  </Text>
                ))}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue to Questions"
                onPress={() => setStage('questions')}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.tint,
                    opacity: pressed ? 0.88 : 1,
                    minHeight: minTouchTarget,
                    marginTop: Spacing.xl,
                  },
                ]}>
                <Text style={[styles.primaryBtnText, { color: colors.background }]}>
                  Continue to Questions →
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* STAGE 3: QUESTIONS */}
          {stage === 'questions' ? (
            <View style={{ gap: Spacing.lg }}>
              {/* Sticky passage review button */}
              <Pressable
                onPress={() => setShowPassageModal(true)}
                style={({ pressed }) => [
                  styles.passagePreviewBtn,
                  {
                    backgroundColor: colors.backgroundElevated,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <Text style={[Typography.caption, { color: colors.tint }]}>
                  📖 Tap to re-read story passage
                </Text>
              </Pressable>

              {/* Multiple Choice Questions */}
              {choiceQuestions.map((q, idx) => (
                <View
                  key={q.id}
                  style={[
                    styles.questionCard,
                    {
                      backgroundColor: colors.backgroundElevated,
                      borderColor: mcAnswers[q.id] !== undefined ? colors.tint : colors.border,
                    },
                  ]}>
                  <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, fontSize: 11 }]}>
                    QUESTION {idx + 1} · {q.skill}
                  </Text>
                  <Text style={[styles.questionPrompt, { color: colors.text }]}>{q.prompt}</Text>

                  <View style={styles.choicesList}>
                    {q.choices.map((choice, cIdx) => {
                      const selected = mcAnswers[q.id] === cIdx;
                      return (
                        <Pressable
                          key={cIdx}
                          onPress={() => setMcAnswers((prev) => ({ ...prev, [q.id]: cIdx }))}
                          style={({ pressed }) => [
                            styles.choiceBtn,
                            {
                              backgroundColor: selected
                                ? 'rgba(120, 182, 163, 0.12)'
                                : colors.background,
                              borderColor: selected ? colors.tint : colors.border,
                              opacity: pressed ? 0.85 : 1,
                            },
                          ]}>
                          <View
                            style={[
                              styles.radioCircle,
                              {
                                borderColor: selected ? colors.tint : colors.textMuted,
                                backgroundColor: selected ? colors.tint : 'transparent',
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.choiceText,
                              {
                                color: selected ? colors.text : colors.textSecondary,
                                fontFamily: selected
                                  ? 'Literata_600SemiBold'
                                  : 'Literata_400Regular',
                              },
                            ]}>
                            {choice}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}

              {/* Production Questions */}
              {productionQuestions.map((pq, pIdx) => (
                <View
                  key={pq.id}
                  style={[
                    styles.questionCard,
                    {
                      backgroundColor: colors.backgroundElevated,
                      borderColor:
                        (prodAnswers[pq.id] || '').trim().length >= 4
                          ? colors.tint
                          : colors.border,
                    },
                  ]}>
                  <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, fontSize: 11 }]}>
                    EXPRESSION · {pq.skill}
                  </Text>
                  <Text style={[styles.questionPrompt, { color: colors.text }]}>{pq.prompt}</Text>
                  <Text style={[styles.hintText, { color: colors.textMuted }]}>
                    💡 {pq.hint}
                  </Text>

                  <TextInput
                    value={prodAnswers[pq.id] ?? ''}
                    onChangeText={(text) =>
                      setProdAnswers((prev) => ({ ...prev, [pq.id]: text }))
                    }
                    placeholder={`Esempio: ${pq.example}`}
                    placeholderTextColor={colors.textMuted}
                    multiline
                    style={[
                      styles.prodInput,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                  />
                </View>
              ))}

              {/* Submit CTA */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Check Readiness"
                onPress={() => void handleFinishAssessment()}
                disabled={!allAnswered || busy}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: allAnswered ? colors.tint : colors.border,
                    opacity: !allAnswered ? 0.5 : pressed ? 0.88 : 1,
                    minHeight: minTouchTarget,
                    marginTop: Spacing.md,
                  },
                ]}>
                {busy ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[styles.primaryBtnText, { color: colors.background }]}>
                    Check Readiness →
                  </Text>
                )}
              </Pressable>
            </View>
          ) : null}

          {/* STAGE 4: OUTCOME */}
          {stage === 'outcome' && evaluation ? (
            <LevelOutcomeCard
              evaluation={evaluation}
              onStartChapter={(num, id) => void handleStartChapter(num, id)}
              onContinueStory={() => router.replace('/(tabs)/stories' as Href)}
              onSecondaryAction={() => router.replace('/(tabs)/stories' as Href)}
            />
          ) : null}
        </ScreenContent>
      </ScrollView>

      {/* Floating Modal for checking passage during questions */}
      <Modal
        visible={showPassageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPassageModal(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowPassageModal(false)} />
          <View style={[styles.modalCard, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {assessment.passage.title}
              </Text>
              <Pressable onPress={() => setShowPassageModal(false)} hitSlop={8}>
                <AppSymbol name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={colors.textMuted} size={20} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {assessment.passage.text.split('\n\n').map((p, idx) => (
                <Text key={idx} style={[styles.paragraphText, { color: colors.text, marginBottom: Spacing.sm }]}>
                  {p}
                </Text>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => setShowPassageModal(false)}
              style={[styles.primaryBtn, { backgroundColor: colors.tint, marginTop: Spacing.md }]}>
              <Text style={[styles.primaryBtnText, { color: colors.background }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  introCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  levelPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  levelPillText: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 12,
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
  },
  heroBody: {
    fontFamily: 'Literata_500Medium',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  heroNote: {
    fontFamily: 'Literata_400Regular',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
    paddingHorizontal: Spacing.sm,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  primaryBtnText: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  passageCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    marginTop: Spacing.sm,
  },
  passageHeader: {
    marginBottom: Spacing.lg,
    gap: 4,
  },
  passageTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 26,
    lineHeight: 32,
  },
  passageBody: {
    gap: Spacing.md,
  },
  paragraphText: {
    fontFamily: 'Literata_400Regular',
    fontSize: 16,
    lineHeight: 26,
  },
  passagePreviewBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  questionCard: {
    borderRadius: Radii.md,
    borderWidth: 1.5,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  questionPrompt: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
  },
  hintText: {
    fontFamily: 'Literata_400Regular',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  choicesList: {
    marginTop: Spacing.xs,
    gap: Spacing.xs + 2,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.sm,
    borderWidth: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  choiceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  prodInput: {
    minHeight: 80,
    borderRadius: Radii.sm,
    borderWidth: 1,
    padding: Spacing.md,
    fontFamily: 'Literata_400Regular',
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
  },
});
