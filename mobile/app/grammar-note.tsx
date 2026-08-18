import { Stack, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { LUCA_STORY_ID } from '@/src/content';
import {
  batchRangeForChapter,
  grammarNoteForChapter,
  isLessonBatchEnd,
} from '@/src/content/lessonBatches';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function GrammarNoteScreen() {
  const { story, chapter } = useLocalSearchParams<{ story?: string; chapter?: string }>();
  const storyId = typeof story === 'string' ? story : LUCA_STORY_ID;
  const chapterNumber = chapter ? Number(chapter) : 0;
  const { colors, type, minTouchTarget } = useTheme();
  const insets = useSafeAreaInsets();

  const note =
    isLessonBatchEnd(chapterNumber) ? grammarNoteForChapter(chapterNumber) : null;
  const { start, end } = batchRangeForChapter(chapterNumber);

  const onContinue = () => {
    router.replace(
      `/batch-recap?story=${encodeURIComponent(storyId)}&chapter=${chapterNumber}` as Href,
    );
  };

  const onSkip = () => {
    router.replace(
      `/batch-recap?story=${encodeURIComponent(storyId)}&chapter=${chapterNumber}` as Href,
    );
  };

  useEffect(() => {
    if (!note && chapterNumber > 0) {
      onSkip();
    }
  }, [note, chapterNumber, storyId]);

  if (!note) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'A little grammar', headerBackVisible: false }} />
        <View style={styles.content}>
          <Text style={[type.body, { color: colors.textSecondary }]}>Continuing…</Text>
        </View>
      </AtmosphereBackground>
    );
  }

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'A little grammar', headerBackVisible: false }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={[type.chapterEyebrow, { color: colors.tint }]}>After chapters {start}–{end}</Text>
        <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
          {note.title}
        </Text>
        <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
          {note.intro}
        </Text>

        {note.points.map((point) => (
          <View
            key={point.heading}
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
            ]}>
            <Text style={[type.label, { color: colors.text }]}>{point.heading}</Text>
            <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
              {point.body}
            </Text>
            <View style={{ marginTop: Spacing.md, gap: Spacing.xs }}>
              {point.examples.map((example) => (
                <Text key={example} style={[type.reader, { color: colors.text }]}>
                  {example}
                </Text>
              ))}
            </View>
          </View>
        ))}

        <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.lg }]}>
          No drills — just patterns you already saw in the story.
        </Text>

        <Pressable
          onPress={onContinue}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.tint,
              opacity: pressed ? 0.88 : 1,
              minHeight: minTouchTarget,
              marginTop: Spacing.xl,
            },
          ]}>
          <Text style={[type.button, { color: colors.onTint }]}>Continue</Text>
        </Pressable>
        <Pressable
          onPress={onSkip}
          style={({ pressed }) => [
            styles.secondaryBtn,
            { borderColor: colors.border, opacity: pressed ? 0.88 : 1, marginTop: Spacing.sm },
          ]}>
          <Text style={[type.button, { color: colors.text }]}>Skip</Text>
        </Pressable>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
  },
  card: {
    marginTop: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
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
