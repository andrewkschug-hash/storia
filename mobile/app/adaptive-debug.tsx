import { Redirect, Stack, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { isDevBuild } from '@/src/security/buildMode';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { getAdaptiveService } from '@/src/adaptive';
import type { AdaptiveLearnerProfile, AdaptationLog } from '@/src/adaptive/types';
import { getProgressService } from '@/src/progress';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function AdaptiveDebugScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const devTools = isDevBuild();
  const [profile, setProfile] = useState<AdaptiveLearnerProfile | null>(null);
  const [logs, setLogs] = useState<AdaptationLog[]>([]);
  const [note, setNote] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const progress = await getProgressService().getOrCreate();
    const adaptive = getAdaptiveService();
    const next = await adaptive.buildProfile(progress);
    const state = await adaptive.getState();
    setProfile(next);
    setLogs([...state.logs].reverse().slice(0, 12));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!devTools) return;
      void refresh();
    }, [devTools, refresh]),
  );

  if (!devTools) {
    return <Redirect href="/" />;
  }

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Adaptive debug' }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={720}>
          <Text style={[Typography.heroTitle, { color: colors.text }]}>Learner profile</Text>
        {profile ? (
          <View style={{ marginTop: Spacing.md, gap: 6 }}>
            <Row label="Reading level" value={profile.readingLevel.replace('_', ' ')} />
            <Row label="Vocabulary strength" value={pct(profile.vocabularyStrength)} />
            <Row label="Phrase strength" value={pct(profile.phraseStrength)} />
            <Row label="Comprehension" value={pct(profile.comprehensionStrength)} />
            <Row label="Average tap rate" value={pct(profile.averageTapRate)} />
            <Row label="Recent tap rate" value={pct(profile.recentTapRate)} />
            <Row label="Question bias" value={profile.questionBias} />
            <Row label="Avg sentence length" value={String(profile.averageSentenceLength)} />
          </View>
        ) : (
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.md }]}>
            No profile yet.
          </Text>
        )}

        <Pressable
          onPress={async () => {
            await getAdaptiveService().seedManualTestLearner();
            setNote('Loaded sample learner (aspettare struggling, casa stable).');
            await refresh();
          }}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: colors.buttonPrimary, opacity: pressed ? 0.88 : 1 },
          ]}>
          <Text style={[Typography.button, { color: colors.onButtonPrimary }]}>Load sample learner</Text>
        </Pressable>
        {note ? (
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
            {note}
          </Text>
        ) : null}

        <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, marginTop: Spacing.xl }]}>
          Top reinforcement targets
        </Text>
        {(profile?.adaptiveItems ?? []).slice(0, 8).map((item) => (
          <View
            key={`${item.kind}:${item.id}`}
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
            ]}>
            <Text style={[Typography.label, { color: colors.text }]}>{item.italian}</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
              Status: {item.state.toUpperCase()}
            </Text>
            <Text style={[Typography.caption, { color: colors.textMuted }]}>
              Encounters: {item.encounterCount} · Taps: {item.tapCount} · Recent:{' '}
              {item.recentTaps}/{item.recentWindow || ADAPTIVE_WINDOW}
            </Text>
            <Text style={[Typography.caption, { color: colors.tint, marginTop: 4 }]}>
              Priority: {item.priority.toFixed(2)}
            </Text>
            {item.reasons.length > 0 ? (
              <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                {item.reasons.join(' · ')}
              </Text>
            ) : null}
          </View>
        ))}

        <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, marginTop: Spacing.xl }]}>
          Adaptation log
        </Text>
        {logs.length === 0 ? (
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
            No adaptive selections yet. Read a chapter after loading the sample learner.
          </Text>
        ) : (
          logs.map((log, i) => (
            <View
              key={`${log.at}-${log.sentenceId}-${i}`}
              style={[
                styles.card,
                { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
              ]}>
              <Text style={[Typography.label, { color: colors.text }]}>
                Chapter {log.chapterNumber} · {log.selectedVariantId}
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                Reinforced: {[...log.reinforcedLemmas, ...log.reinforcedPhrases].join(', ') || '—'}
              </Text>
              <Text style={[Typography.caption, { color: colors.textMuted }]}>
                {log.reason} · {log.priority.toFixed(2)}
              </Text>
            </View>
          ))
        )}

        <Pressable onPress={() => router.back()} style={{ marginTop: Spacing.lg }}>
          <Text style={[Typography.label, { color: colors.tint }]}>Back</Text>
        </Pressable>
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const ADAPTIVE_WINDOW = 6;

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[Typography.body, { color: colors.textSecondary }]}>
      {label}: <Text style={{ color: colors.text }}>{value}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.lg,
  },
  card: {
    marginTop: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
});
