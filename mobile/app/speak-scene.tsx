import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { LUCA_STORY_ID } from '@/src/content';
import { getSpeakSceneById, speakLineToExercise } from '@/src/content/speakScenes';
import { getProgressService } from '@/src/progress';
import { routeAfterSpeakScene } from '@/src/progress/batchMilestoneRoute';
import type { SpeakSceneLineAttempt, SpeakSceneVote } from '@/src/progress/types';
import { scoreProductionAnswer } from '@/src/production/score';
import { trackReadingEvent } from '@/src/telemetry/ReadingEventStore';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Phase = 'intro' | 'line' | 'feedback' | 'summary';

function continueAfterScene(storyId: string, batchEnd: number, returnTo?: string) {
  router.replace(routeAfterSpeakScene(storyId, batchEnd, returnTo));
}

export default function SpeakSceneScreen() {
  const { story, scene: sceneParam, returnTo } = useLocalSearchParams<{
    story?: string;
    scene?: string;
    returnTo?: string;
  }>();
  const storyId = typeof story === 'string' ? story : LUCA_STORY_ID;
  const sceneId = typeof sceneParam === 'string' ? sceneParam : '';
  const scene = getSpeakSceneById(sceneId);
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>('intro');
  const [lineIndex, setLineIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lineRecords, setLineRecords] = useState<SpeakSceneLineAttempt[]>([]);
  const [saving, setSaving] = useState(false);

  const current = scene?.lines[lineIndex];
  const exercise = useMemo(() => {
    if (!scene || !current) return null;
    return speakLineToExercise(scene, current);
  }, [scene, current]);

  const persist = async (skipped: boolean, lines: SpeakSceneLineAttempt[], done: boolean) => {
    if (!scene) return;
    setSaving(true);
    try {
      await getProgressService(storyId).recordSpeakScene({
        sceneId: scene.id,
        skipped,
        completedAt: done ? new Date().toISOString() : null,
        lines,
      });
      if (!done) return;
      trackReadingEvent({
        type: skipped ? 'speak_scene_skipped' : 'speak_scene_completed',
        storyId,
        meta: {
          sceneId: scene.id,
          skipped,
          lineCount: lines.length,
          gotIt: lines.filter((line) => line.vote === 'got_it').length,
          almost: lines.filter((line) => line.vote === 'almost').length,
          notYet: lines.filter((line) => line.vote === 'not_yet').length,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const finishAndContinue = async (skipped: boolean, lines: SpeakSceneLineAttempt[]) => {
    await persist(skipped, lines, true);
    continueAfterScene(storyId, scene?.batchEnd ?? 15, returnTo);
  };

  if (!scene || (phase !== 'summary' && !current)) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Speak the scene', headerBackVisible: false }} />
        <View style={styles.center}>
          <Text style={[type.body, { color: colors.textSecondary }]}>Scene not found.</Text>
        </View>
      </AtmosphereBackground>
    );
  }

  const onCheck = () => {
    if (!exercise || !draft.trim()) return;
    setAttempts((n) => n + 1);
    setPhase('feedback');
  };

  const onVote = async (vote: SpeakSceneVote) => {
    if (!exercise || !current || saving) return;
    const scored = scoreProductionAnswer(exercise, draft);
    const record: SpeakSceneLineAttempt = {
      lineId: current.id,
      vote,
      score: scored.result,
      attempts: Math.max(1, attempts),
      learnerText: draft.trim(),
      timestamp: new Date().toISOString(),
    };
    trackReadingEvent({
      type: 'speak_scene_line',
      storyId,
      meta: {
        sceneId: scene.id,
        lineId: current.id,
        vote,
        score: scored.result,
        attempts: record.attempts,
      },
    });
    const nextLines = [...lineRecords, record];
    setLineRecords(nextLines);
    setDraft('');
    setAttempts(0);
    const done = lineIndex + 1 >= scene.lines.length;
    await persist(false, nextLines, done);
    if (!done) {
      setLineIndex(lineIndex + 1);
      setPhase('line');
      return;
    }
    setPhase('summary');
  };

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Speak the scene', headerBackVisible: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={680}>
          {phase === 'intro' ? (
            <View>
              <Text style={[type.chapterEyebrow, { color: colors.tint }]}>Speak the scene</Text>
              <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                {scene.title}
              </Text>
              <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md, lineHeight: 24 }]}>
                {scene.summaryEn}
              </Text>
              <Text style={[type.label, { color: colors.text, marginTop: Spacing.lg }]}>
                Say it in Italian.
              </Text>
              <Pressable
                onPress={() => {
                  trackReadingEvent({
                    type: 'speak_scene_started',
                    storyId,
                    meta: { sceneId: scene.id, lineCount: scene.lines.length },
                  });
                  setPhase('line');
                }}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.tint,
                    opacity: pressed ? 0.88 : 1,
                    minHeight: minTouchTarget,
                    marginTop: Spacing.xl,
                  },
                ]}>
                <Text style={[type.button, { color: colors.onTint }]}>Start</Text>
              </Pressable>
              <Pressable
                onPress={() => void finishAndContinue(true, [])}
                disabled={saving}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { borderColor: colors.border, opacity: pressed || saving ? 0.88 : 1, marginTop: Spacing.sm },
                ]}>
                <Text style={[type.button, { color: colors.text }]}>Skip</Text>
              </Pressable>
            </View>
          ) : null}

          {phase === 'line' || phase === 'feedback' ? (
            <View>
              <Text style={[type.caption, { color: colors.textMuted }]}>
                {lineIndex + 1} of {scene.lines.length}
              </Text>
              <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
                {scene.title}
              </Text>
              <Text style={[type.body, { color: colors.textMuted, marginTop: Spacing.md, lineHeight: 24 }]}>
                {scene.summaryEn}
              </Text>
              <Text style={[type.chapterEyebrow, { color: colors.tint, marginTop: Spacing.xl }]}>
                Say it in Italian
              </Text>
              <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm, fontSize: 24, lineHeight: 32 }]}>
                {current?.en}
              </Text>

              <TextInput
                value={draft}
                onChangeText={setDraft}
                editable={phase === 'line'}
                placeholder="Type it in Italian"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundElevated,
                    minHeight: minTouchTarget,
                  },
                ]}
              />

              <View style={styles.actionRow}>
                <Pressable
                  disabled
                  accessibilityState={{ disabled: true }}
                  style={[
                    styles.secondaryBtn,
                    styles.flexBtn,
                    { borderColor: colors.border, opacity: 0.45 },
                  ]}>
                  <Text style={[type.button, { color: colors.textMuted }]}>Speak</Text>
                </Pressable>
                <Pressable
                  onPress={onCheck}
                  disabled={phase !== 'line' || !draft.trim()}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    styles.flexBtn,
                    {
                      backgroundColor: colors.tint,
                      opacity: phase !== 'line' || !draft.trim() ? 0.5 : pressed ? 0.88 : 1,
                      minHeight: minTouchTarget,
                    },
                  ]}>
                  <Text style={[type.button, { color: colors.onTint }]}>Type</Text>
                </Pressable>
              </View>

              {phase === 'feedback' ? (
                <View style={{ marginTop: Spacing.xl }}>
                  <Text style={[type.label, { color: colors.tint }]}>{current?.it}</Text>
                  <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.lg }]}>
                    How did you do?
                  </Text>
                  <View style={styles.voteRow}>
                    <VoteButton label="Got it" filled colors={colors} type={type} minTouchTarget={minTouchTarget} disabled={saving} onPress={() => void onVote('got_it')} />
                    <VoteButton label="Almost" colors={colors} type={type} minTouchTarget={minTouchTarget} disabled={saving} onPress={() => void onVote('almost')} />
                    <VoteButton label="Not yet" colors={colors} type={type} minTouchTarget={minTouchTarget} disabled={saving} onPress={() => void onVote('not_yet')} />
                  </View>
                </View>
              ) : null}

              <Pressable
                onPress={() => void finishAndContinue(true, lineRecords)}
                disabled={saving}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { borderColor: colors.border, opacity: pressed || saving ? 0.88 : 1, marginTop: Spacing.lg },
                ]}>
                <Text style={[type.button, { color: colors.textMuted }]}>Skip</Text>
              </Pressable>
            </View>
          ) : null}

          {phase === 'summary' ? (
            <View>
              <Text style={[type.heroTitle, { color: colors.text }]}>
                You retold &ldquo;{scene.title}&rdquo;.
              </Text>
              <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                {lineRecords.length}/{scene.lines.length} ideas expressed.
              </Text>
              <Pressable
                onPress={() => continueAfterScene(storyId, scene.batchEnd, returnTo)}
                disabled={saving}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.tint,
                    opacity: pressed || saving ? 0.88 : 1,
                    minHeight: minTouchTarget,
                    marginTop: Spacing.xl,
                  },
                ]}>
                <Text style={[type.button, { color: colors.onTint }]}>Continue</Text>
              </Pressable>
            </View>
          ) : null}
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

function VoteButton({
  label,
  filled,
  colors,
  type,
  minTouchTarget,
  disabled,
  onPress,
}: {
  label: string;
  filled?: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  type: ReturnType<typeof useTheme>['type'];
  minTouchTarget: number;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.voteBtn,
        {
          backgroundColor: filled ? colors.tint : 'transparent',
          borderColor: colors.border,
          minHeight: minTouchTarget,
          opacity: pressed || disabled ? 0.88 : 1,
        },
      ]}>
      <Text style={[type.button, { color: filled ? colors.onTint : colors.text, fontSize: 14 }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  input: {
    marginTop: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: 'Literata_400Regular',
    fontSize: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  flexBtn: {
    flex: 1,
  },
  voteRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  voteBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
