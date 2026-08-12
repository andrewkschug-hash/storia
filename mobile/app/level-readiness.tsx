import { Stack, router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { getAdaptiveService } from '@/src/adaptive';
import { getLevelReadinessService } from '@/src/cefr';
import type { CEFRLevel, LevelReadiness } from '@/src/cefr';
import { getChapterByNumber } from '@/src/content';
import { getProgressService } from '@/src/progress';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function LevelReadinessScreen() {
  const { fromChapter } = useLocalSearchParams<{ fromChapter?: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [readiness, setReadiness] = useState<LevelReadiness | null>(null);
  const chapterNumber = fromChapter ? Number(fromChapter) : 20;

  useEffect(() => {
    void (async () => {
      const progress = await getProgressService().getOrCreate();
      const profile = await getAdaptiveService().buildProfile(progress);
      setReadiness(getLevelReadinessService().evaluate(profile, progress));
    })();
  }, [chapterNumber]);

  const copy =
    chapterNumber >= 24
      ? {
          eyebrow: 'Prossime storie',
          title: 'Stai leggendo bene a questo livello.',
          body: 'Le prossime storie saranno un po\' più lunghe e useranno più passato.',
          tryLabel: 'Try A2',
          stayLabel: 'Stay with A1+',
          nextChapter: 25,
        }
      : {
          eyebrow: 'Un po\' di più',
          title: 'Stai leggendo bene a questo livello.',
          body: 'Le prossime storie saranno un po\' più lunghe.',
          tryLabel: 'Try A1+',
          stayLabel: 'Stay with A1',
          nextChapter: 21,
        };

  const onTry = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const progress = await getProgressService().getOrCreate();
      const profile = await getAdaptiveService().buildProfile(progress);
      await getLevelReadinessService().chooseNext(profile);
      const next = getChapterByNumber(copy.nextChapter);
      if (next) {
        await getProgressService().openChapter(next.id);
        router.replace(`/reader/${next.id}` as Href);
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

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Next stories', headerBackVisible: false }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}>
        {!readiness ? (
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
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.md }]}>
              {readiness.message}
            </Text>

            <View style={{ marginTop: Spacing.xl, gap: Spacing.sm }}>
              <Pressable
                disabled={busy}
                onPress={() => void onTry()}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.tint, opacity: pressed || busy ? 0.88 : 1 },
                ]}>
                <Text style={[Typography.button, { color: '#F7FAF9' }]}>{copy.tryLabel}</Text>
              </Pressable>
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
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
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
