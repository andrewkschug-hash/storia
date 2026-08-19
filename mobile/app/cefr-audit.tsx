import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isDevBuild } from '@/src/security/buildMode';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { auditStoryCefr } from '@/src/cefr';
import { getContentBundle } from '@/src/content';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function CefrAuditScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const devTools = isDevBuild();
  const bundle = getContentBundle();
  const rows = auditStoryCefr(bundle);

  if (!devTools) {
    return <Redirect href="/" />;
  }

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'CEFR audit' }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Text style={[Typography.heroTitle, { color: colors.text }]}>CEFR content audit</Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          Measurable difficulty for authors. This does not rewrite chapters.
        </Text>

        {bundle.story.arcs.map((arc) => (
          <View
            key={arc.id}
            style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
            <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
              {arc.cefrLevel} · {arc.status}
            </Text>
            <Text style={[Typography.label, { color: colors.text, marginTop: 4 }]}>{arc.titleIt}</Text>
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
              {arc.description} — {arc.narrativeStage}
            </Text>
          </View>
        ))}

        {rows.map((row) => (
          <View
            key={row.chapterId}
            style={[styles.card, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
            <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
              Chapter {row.chapterNumber} · {row.status}
            </Text>
            <Text style={[Typography.label, { color: colors.text, marginTop: 4 }]}>{row.titleIt}</Text>
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
              Target {row.target} · Estimated {row.estimated} · overall {row.overallScore}
            </Text>
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
              Vocab {row.vocabularyScore} · Sentence {row.sentenceScore} · Novelty {row.noveltyScore} ·
              Comprehension {row.comprehensionScore}
            </Text>
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
              Avg length {row.averageSentenceLength} · known {row.knownPercent}% · new {row.newPercent}%
            </Text>
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
              {row.wordCount} words · {row.paragraphCount} paragraphs · {row.sceneCount} scenes · avg
              paragraph {row.averageParagraphLength} · longest {row.longestSentence} · {row.narrativeComplexity}
            </Text>
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
              Adaptive {row.adaptiveOpportunities} · audio {row.audioCompletion}
              {row.incompleteFlags.length ? ` · ${row.incompleteFlags.join('; ')}` : ''}
            </Text>
          </View>
        ))}
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  card: {
    marginTop: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
});
