import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccount } from '@/src/account/storage';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { PublicNav } from '@/src/marketing/PublicNav';
import { ReaderPreview } from '@/src/marketing/ReaderPreview';
import { hasCompletedOnboarding } from '@/src/onboarding/storage';
import { navigateContinueLearning } from '@/src/progress/continueNavigation';
import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

const PILLARS = [
  { title: 'Read', body: 'Real Italian in context' },
  { title: 'Remember', body: 'Words return in the story' },
  { title: 'Speak', body: 'Say what you understand' },
] as const;

export default function PublicHomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const [continueHref, setContinueHref] = useState<Href | null>(null);

  useEffect(() => {
    void (async () => {
      const account = await getAccount();
      const onboarded = await hasCompletedOnboarding();
      if (account && onboarded) {
        const href = '/home' as Href;
        setContinueHref(href);
        if (Platform.OS !== 'web') {
          router.replace(href);
        }
      }
    })();
  }, []);

  const heroSize = layout.isPhone ? 38 : 46;
  const wide = layout.isDesktop || layout.isTablet;

  return (
    <AtmosphereBackground>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
        <PublicNav continueHref={continueHref} />
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={wide ? 960 : 680} style={styles.page}>
          <View style={[styles.hero, wide && styles.heroWide]}>
            <View style={[styles.heroCopy, wide && styles.heroCopyWide]}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Storibase</Text>
              <Text
                style={[
                  Typography.heroTitle,
                  {
                    color: colors.text,
                    marginTop: Spacing.sm,
                    fontSize: heroSize,
                    lineHeight: heroSize + 10,
                  },
                ]}
                accessibilityRole="header">
                Learn Italian through stories.
              </Text>
              <Text
                style={[
                  Typography.body,
                  { color: colors.textSecondary, marginTop: Spacing.md, lineHeight: 26, maxWidth: 420 },
                ]}>
                Follow characters chapter by chapter. No word lists — just reading that makes sense.
              </Text>

              <View style={[styles.ctaRow, layout.width < 400 && styles.ctaStack]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Try the walkthrough"
                  onPress={() => router.push('/walkthrough')}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onTint }]}>Try the walkthrough</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Start learning"
                  onPress={() => router.push('/account?mode=signup' as Href)}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.text }]}>Start learning</Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Already have an account? Log in"
                onPress={() => router.push('/account?mode=signin' as Href)}
                style={({ pressed }) => ({
                  marginTop: Spacing.md,
                  opacity: pressed ? 0.7 : 1,
                  minHeight: 44,
                  justifyContent: 'center',
                })}>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>
                  Already have an account? Log in
                </Text>
              </Pressable>
            </View>

            <View style={[styles.heroVisual, wide && styles.heroVisualWide]}>
              <ReaderPreview />
            </View>
          </View>

          <View style={styles.pillars}>
            {PILLARS.map((item) => (
              <View
                key={item.title}
                style={[
                  styles.pillar,
                  { backgroundColor: colors.readerSurface, borderColor: colors.border },
                ]}>
                <Text style={[Typography.label, { color: colors.tint }]}>{item.title}</Text>
                <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                  {item.body}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.final,
              { backgroundColor: colors.readerSurface, borderColor: colors.border },
            ]}>
            <Text style={[Typography.heroTitle, { color: colors.text, fontSize: layout.isPhone ? 28 : 32 }]}>
              Start with one story.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={continueHref ? 'Continue learning' : 'Start learning'}
              onPress={() => {
                if (continueHref) {
                  void navigateContinueLearning(continueHref);
                  return;
                }
                router.push('/account?mode=signup' as Href);
              }}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: colors.tint,
                  opacity: pressed ? 0.88 : 1,
                  marginTop: Spacing.lg,
                  alignSelf: 'flex-start',
                },
              ]}>
              <Text style={[Typography.button, { color: colors.onTint }]}>
                {continueHref ? 'Continue learning' : 'Start learning'}
              </Text>
            </Pressable>
          </View>
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  hero: {
    gap: Spacing.xl,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxl,
  },
  heroCopy: {
    flex: 1,
  },
  heroCopyWide: {
    flex: 1.05,
  },
  heroVisual: {
    flex: 1,
  },
  heroVisualWide: {
    flex: 0.95,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  ctaStack: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  primaryBtn: {
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
  },
  pillar: {
    flexGrow: 1,
    flexBasis: 140,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.md,
  },
  final: {
    marginTop: Spacing.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
});
