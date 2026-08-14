import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccount } from '@/src/account/storage';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { DictionarySheet } from '@/src/components/DictionarySheet';
import { ScreenContent } from '@/src/components/ScreenContent';
import { completeOnboardingAndSync } from '@/src/sync/learnerSession';
import type { DictionaryLookup } from '@/src/vocabulary/types';
import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Step = 'word' | 'sentence' | 'recap' | 'done';

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const [step, setStep] = useState<'word' | 'sentence' | 'recap' | 'done'>('word');
  const [lookup, setLookup] = useState<DictionaryLookup | null>(null);

  useEffect(() => {
    void getAccount().then((account) => {
      if (!account) router.replace('/account');
    });
  }, []);

  const finish = async () => {
    await completeOnboardingAndSync();
    router.replace('/(tabs)/home');
  };

  const wordLookup: DictionaryLookup = {
    kind: 'word',
    surface: 'casa',
    lemmaId: 'casa',
    lemmaItalian: 'casa',
    english: 'house, home',
    encounterCount: 0,
    chapterId: 'onboarding',
    chapterNumber: 0,
    sentenceText: 'Luca cerca una casa.',
    sentenceId: 'onboarding-s1',
    tokenIndex: 3,
  };

  const sentenceLookup: DictionaryLookup = {
    kind: 'sentence',
    surface: 'Luca cerca una casa.',
    sentenceText: 'Luca cerca una casa.',
    english: 'Luca is looking for a home.',
    sentenceId: 'onboarding-s1',
    chapterId: 'onboarding',
    chapterNumber: 0,
    encounterCount: 0,
  };

  return (
    <AtmosphereBackground>
      <View
        style={[
          styles.wrap,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.lg },
        ]}>
        <ScreenContent style={styles.flex}>
          <Pressable onPress={() => void finish()} style={styles.skip} accessibilityRole="button">
            <Text style={[Typography.caption, { color: colors.textMuted }]}>Skip</Text>
          </Pressable>

          {step === 'word' ? (
            <View style={styles.panel}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Quick start</Text>
              <Text
                style={[
                  Typography.heroTitle,
                  {
                    color: colors.text,
                    marginTop: Spacing.sm,
                    fontSize: layout.isPhone ? 26 : 32,
                    lineHeight: layout.isPhone ? 32 : 40,
                  },
                ]}>
                Tap a word
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                When you need help, tap any word in the story.
              </Text>
              <Pressable
                onPress={() => setLookup(wordLookup)}
                style={[styles.sample, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                <Text
                  style={[
                    Typography.reader,
                    {
                      color: colors.text,
                      fontSize: layout.isPhone ? 20 : 22,
                      lineHeight: layout.isPhone ? 36 : 40,
                    },
                  ]}>
                  Luca cerca una{' '}
                  <Text style={{ backgroundColor: colors.sentenceHighlight, borderRadius: 4 }}>casa</Text>.
                </Text>
              </Pressable>
              <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
                Try tapping casa.
              </Text>
            </View>
          ) : null}

          {step === 'sentence' ? (
            <View style={styles.panel}>
              <Text
                style={[
                  Typography.heroTitle,
                  {
                    color: colors.text,
                    fontSize: layout.isPhone ? 26 : 32,
                    lineHeight: layout.isPhone ? 32 : 40,
                  },
                ]}>
                Tap a sentence
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                Tap the sentence for a quick English line when you need it.
              </Text>
              <Pressable
                onPress={() => setLookup(sentenceLookup)}
                style={[styles.sample, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                <Text
                  style={[
                    Typography.reader,
                    {
                      color: colors.text,
                      fontSize: layout.isPhone ? 20 : 22,
                      lineHeight: layout.isPhone ? 36 : 40,
                    },
                  ]}>
                  Luca cerca una casa.
                </Text>
              </Pressable>
            </View>
          ) : null}

          {step === 'recap' ? (
            <View style={styles.panel}>
              <Text
                style={[
                  Typography.heroTitle,
                  {
                    color: colors.text,
                    fontSize: layout.isPhone ? 26 : 32,
                    lineHeight: layout.isPhone ? 32 : 40,
                  },
                ]}>
                When you finish reading
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                Tap Recap at the end of a chapter. A few short questions check the story — then the next
                chapter unlocks.
              </Text>
              <View
                style={[styles.sample, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>Finished reading?</Text>
                <View style={[styles.fakeBtn, { backgroundColor: colors.tint }]}>
                  <Text style={[Typography.button, { color: '#F7FAF9', fontSize: 14 }]}>Recap</Text>
                </View>
              </View>
              <Pressable
                onPress={() => setStep('done')}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1, marginTop: Spacing.xl },
                ]}>
                <Text style={[Typography.button, { color: '#F7FAF9' }]}>Continue</Text>
              </Pressable>
            </View>
          ) : null}

          {step === 'done' ? (
            <View style={styles.panel}>
              <Text
                style={[
                  Typography.heroTitle,
                  {
                    color: colors.text,
                    fontSize: layout.isPhone ? 26 : 32,
                    lineHeight: layout.isPhone ? 32 : 40,
                  },
                ]}>
                That&apos;s it
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                Just read the story. Tap when you need help. Use Recap when you reach the end.
              </Text>
              <Pressable
                onPress={() => void finish()}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1, marginTop: Spacing.xl },
                ]}>
                <Text style={[Typography.button, { color: '#F7FAF9' }]}>Start reading</Text>
              </Pressable>
            </View>
          ) : null}
        </ScreenContent>

        <DictionarySheet
          lookup={lookup}
          saved={false}
          saveLabel="Next"
          closeLabel="Next"
          onClose={() => {
            setLookup(null);
            if (step === 'word') setStep('sentence');
            else if (step === 'sentence') setStep('recap');
          }}
          onSave={() => {
            setLookup(null);
            if (step === 'word') setStep('sentence');
            else if (step === 'sentence') setStep('recap');
          }}
        />
      </View>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  flex: { flex: 1 },
  skip: { alignSelf: 'flex-end', padding: Spacing.sm, minHeight: 44, justifyContent: 'center' },
  panel: { flex: 1, justifyContent: 'center' },
  sample: {
    marginTop: Spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    padding: Spacing.lg,
  },
  fakeBtn: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    minHeight: 48,
  },
});
