import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ChapterEndNotes } from '@/src/components/ChapterEndNotes';
import { buildChapterRecap } from '@/src/content/chapterRecap';
import { findStoryIdForChapter, getChapter, getContentBundle } from '@/src/content';
import { comprehensionHref } from '@/src/content/storyHrefs';
import { getVocabularyService } from '@/src/vocabulary';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function ChapterRecapScreen() {
  const { chapterId, story } = useLocalSearchParams<{ chapterId: string; story?: string }>();
  const storyId =
    (typeof story === 'string' && story) || findStoryIdForChapter(chapterId) || undefined;
  const chapter = storyId ? getChapter(chapterId, storyId) : undefined;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!chapter) {
    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Recap' }} />
        <View style={styles.center}>
          <Text style={[Typography.body, { color: colors.textSecondary }]}>Chapter not found.</Text>
        </View>
      </AtmosphereBackground>
    );
  }

  const recap = buildChapterRecap(chapter, getContentBundle(storyId ?? chapter.storyId).lexiconById);

  return (
    <AtmosphereBackground>
      <Stack.Screen
        options={{
          title: `Capitolo ${chapter.number}`,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Chapter recap</Text>
        <Text style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
          {recap.titleIt}
        </Text>
        <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
          {recap.titleEn}
        </Text>

        <Text style={[Typography.label, { color: colors.text, marginTop: Spacing.lg }]}>
          What happened
        </Text>
        <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          {recap.summary}
        </Text>

        {recap.facts.length > 0 || recap.lookFors.length > 0 ? (
          <View style={{ marginTop: Spacing.lg }}>
            <ChapterEndNotes recap={recap} variant="full" />
          </View>
        ) : null}

        <Pressable
          onPress={async () => {
            await getVocabularyService().recordChapterExposure(chapter);
            router.push(comprehensionHref(storyId ?? chapter.storyId, chapter.id));
          }}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.tint,
              opacity: pressed ? 0.88 : 1,
              marginTop: Spacing.xl,
            },
          ]}>
          <Text style={[Typography.button, { color: '#F7FAF9' }]}>Check your understanding</Text>
        </Pressable>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
});
