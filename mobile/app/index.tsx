import { router, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccount } from '@/src/account/storage';
import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { ScreenContent } from '@/src/components/ScreenContent';
import { PublicNav, type PublicSectionId } from '@/src/marketing/PublicNav';
import { ReaderPreview } from '@/src/marketing/ReaderPreview';
import { hasCompletedOnboarding } from '@/src/onboarding/storage';
import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

const JOURNEY = [
  { title: 'Read', body: 'Understand Italian in context.' },
  { title: 'Remember', body: 'Important vocabulary returns naturally.' },
  { title: 'Understand more', body: 'Stories gradually become more complex.' },
  { title: 'Speak', body: "Turn things you've understood into your own Italian." },
] as const;

const CHARACTERS = ['Luca', 'Sofia', 'Marco', 'Rome', 'Café', 'Home', 'Work'] as const;

const AUDIENCE = [
  "Beginners who don't know where to start",
  'Learners tired of disconnected exercises',
  'People who enjoy learning through stories',
  'Learners who want vocabulary to stick through repeated context',
  "People who want to eventually speak, but don't want to start with speaking drills",
] as const;

export default function PublicHomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Partial<Record<PublicSectionId, number>>>({});
  const [continueHref, setContinueHref] = useState<Href | null>(null);

  useEffect(() => {
    void (async () => {
      const account = await getAccount();
      const onboarded = await hasCompletedOnboarding();
      if (account && onboarded) {
        const href = '/(tabs)/home' as Href;
        setContinueHref(href);
        if (Platform.OS !== 'web') {
          router.replace(href);
        }
      }
    })();
  }, []);

  const scrollToSection = (id: PublicSectionId) => {
    const y = sectionY.current[id];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
  };

  const markSection = (id: PublicSectionId) => (event: { nativeEvent: { layout: { y: number } } }) => {
    sectionY.current[id] = event.nativeEvent.layout.y;
  };

  const heroSize = layout.isPhone ? 36 : 48;
  const wide = layout.isDesktop || layout.isTablet;

  return (
    <AtmosphereBackground>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
        <PublicNav onScrollToSection={scrollToSection} continueHref={continueHref} />
      </View>
      <ScrollView
        ref={scrollRef}
        accessibilityRole="none"
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={wide ? 960 : undefined} style={styles.page}>
          <View style={[styles.hero, wide && styles.heroWide]}>
            <View style={[styles.heroCopy, wide && styles.heroCopyWide]}>
              <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>Italian, in context</Text>
              <Text
                style={[
                  Typography.heroTitle,
                  {
                    color: colors.text,
                    marginTop: Spacing.sm,
                    fontSize: heroSize,
                    lineHeight: heroSize + 8,
                  },
                ]}
                accessibilityRole="header">
                Learn Italian through stories.
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
                Read real Italian in context, follow the same characters from chapter to chapter, and
                build your vocabulary naturally as you understand more.
              </Text>
              <Text
                style={[
                  Typography.body,
                  {
                    color: colors.text,
                    marginTop: Spacing.md,
                    fontFamily: 'Literata_400Regular_Italic',
                  },
                ]}>
                You don&apos;t learn Italian by memorizing Italian. You learn it by understanding Italian.
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
                  <Text style={[Typography.button, { color: '#F7FAF9' }]}>Try the walkthrough</Text>
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
                style={({ pressed }) => ({ marginTop: Spacing.md, opacity: pressed ? 0.7 : 1, minHeight: 44, justifyContent: 'center' })}>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>
                  Already have an account? Log in
                </Text>
              </Pressable>
            </View>
            <View style={[styles.heroVisual, wide && styles.heroVisualWide]}>
              <ReaderPreview />
            </View>
          </View>

          <View onLayout={markSection('why')} nativeID="why" style={styles.section}>
            <Text style={[Typography.heroTitle, { color: colors.text, fontSize: layout.isPhone ? 26 : 32 }]}>
              Most language apps teach you words. We teach you what those words mean.
            </Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              Traditional practice often splits language into lists, grammar drills, disconnected
              sentences, and translation puzzles. Storia keeps the language inside a story you can
              follow.
            </Text>
            <View style={[styles.grid, layout.isPhone && styles.gridStack]}>
              {([
                ['Stories', 'You follow recurring characters and situations.'],
                ['Context', 'New words appear where they actually mean something.'],
                ['Repetition', 'Important words return naturally across chapters.'],
                ['Comprehension', 'You learn by understanding what is happening.'],
                ['Production', "Once you understand something, you're gradually asked to say it yourself."],
              ] as const).map(([title, body]) => (
                <View
                  key={title}
                  style={[
                    styles.ideaCard,
                    { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
                  ]}>
                  <Text style={[Typography.label, { color: colors.tint }]}>{title}</Text>
                  <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                    {body}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View onLayout={markSection('how')} nativeID="how" style={styles.section}>
            <Text style={[Typography.heroTitle, { color: colors.text, fontSize: layout.isPhone ? 26 : 32 }]}>
              See how it works.
            </Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              No account required. Take a few minutes to see how learning Italian here actually works.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Try the walkthrough"
              onPress={() => router.push('/walkthrough')}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1, marginTop: Spacing.lg, alignSelf: 'flex-start' },
              ]}>
              <Text style={[Typography.button, { color: '#F7FAF9' }]}>Try the walkthrough →</Text>
            </Pressable>
          </View>

          <View onLayout={markSection('journey')} nativeID="journey" style={styles.section}>
            <Text style={[Typography.heroTitle, { color: colors.text, fontSize: layout.isPhone ? 26 : 32 }]}>
              A path you can feel.
            </Text>
            {JOURNEY.map((item, index) => (
              <View key={item.title} style={styles.journeyItem}>
                <Text style={[Typography.label, { color: colors.tint }]}>{item.title}</Text>
                <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                  {item.body}
                </Text>
                {index < JOURNEY.length - 1 ? (
                  <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>↓</Text>
                ) : null}
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[Typography.heroTitle, { color: colors.text, fontSize: layout.isPhone ? 26 : 32 }]}>
              The story keeps going.
            </Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              Luca doesn&apos;t disappear after one lesson. The same characters, places, and situations
              return as your Italian improves — natural repetition, without feeling like a flashcard
              stack.
            </Text>
            <View style={styles.chipRow}>
              {CHARACTERS.map((name) => (
                <View
                  key={name}
                  style={[
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: colors.backgroundElevated },
                  ]}>
                  <Text style={[Typography.caption, { color: colors.text }]}>{name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[Typography.heroTitle, { color: colors.text, fontSize: layout.isPhone ? 26 : 32 }]}>
              Built for people who want to actually understand Italian.
            </Text>
            {AUDIENCE.map((line) => (
              <Text
                key={line}
                style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                • {line}
              </Text>
            ))}
          </View>

          <View
            style={[
              styles.final,
              { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
            ]}>
            <Text style={[Typography.heroTitle, { color: colors.text, fontSize: layout.isPhone ? 28 : 34 }]}>
              Start with one story.
            </Text>
            <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              No complicated setup. Start reading Italian and see how much you can understand.
            </Text>
            <View style={[styles.ctaRow, layout.width < 400 && styles.ctaStack, { marginTop: Spacing.lg }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Try the walkthrough"
                onPress={() => router.push('/walkthrough')}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1 },
                ]}>
                <Text style={[Typography.button, { color: '#F7FAF9' }]}>Try the walkthrough</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start learning"
                onPress={() => router.push((continueHref ?? '/account?mode=signup') as Href)}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                ]}>
                <Text style={[Typography.button, { color: colors.text }]}>
                  {continueHref ? 'Continue learning' : 'Start learning'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScreenContent>
      </ScrollView>
    </AtmosphereBackground>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: Spacing.xl,
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
  section: {
    marginTop: Spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  gridStack: {
    flexDirection: 'column',
  },
  ideaCard: {
    flexGrow: 1,
    flexBasis: 220,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  journeyItem: {
    marginTop: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  final: {
    marginTop: Spacing.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
});
