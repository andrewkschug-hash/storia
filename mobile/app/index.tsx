import { router, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccount } from '@/src/account/storage';
import { ScreenContent } from '@/src/components/ScreenContent';
import { LandingColors } from '@/src/marketing/landingTheme';
import { PublicFooter } from '@/src/marketing/PublicFooter';
import { PublicNav } from '@/src/marketing/PublicNav';
import { ReaderPreview } from '@/src/marketing/ReaderPreview';
import { hasCompletedOnboarding } from '@/src/onboarding/storage';
import { navigateContinueLearning } from '@/src/progress/continueNavigation';
import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';

const PILLARS = [
  {
    title: 'Read',
    headline: 'Real Italian in context',
    body: 'Every word you learn shows up inside a sentence a character actually says, never as an isolated flashcard.',
  },
  {
    title: 'Remember',
    headline: 'Words return in the story',
    body: 'What you tap today reappears in upcoming chapters. The story naturally reinforces vocabulary as you read.',
  },
  {
    title: 'Speak',
    headline: 'Say what you understand',
    body: 'Practice speaking the story aloud in natural dialogue scenes, building confidence from the very first chapter.',
  },
] as const;

const SHELF_LANGUAGES = [
  { id: 'it', label: 'Italiano', live: true, tag: 'LIVE' },
  { id: 'es', label: 'Español', live: false, tag: 'UP NEXT' },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PublicHomeScreen() {
  const colors = LandingColors;
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const scrollRef = useRef<ScrollView>(null);
  const [continueHref, setContinueHref] = useState<Href | null>(null);
  const [shelfY, setShelfY] = useState(0);
  const [pillarsY, setPillarsY] = useState(0);
  const [email, setEmail] = useState('');
  const [notifyState, setNotifyState] = useState<'idle' | 'invalid' | 'done'>('idle');

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

  const wide = layout.isDesktop || layout.isTablet;
  const heroSize = layout.isPhone ? 36 : 48;

  const scrollTo = (y: number) => {
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  };

  const onNotify = () => {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setNotifyState('invalid');
      return;
    }
    setNotifyState('done');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <PublicNav
        continueHref={continueHref}
        onLanguagesPress={() => scrollTo(shelfY)}
        onHowItWorksPress={() => scrollTo(pillarsY)}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={wide ? 1040 : 680} style={styles.page}>
          {/* Hero */}
          <View style={[styles.hero, wide && styles.heroWide]}>
            <View style={[styles.heroCopy, wide && styles.heroCopyWide]}>
              <Text style={[Typography.chapterEyebrow, { color: colors.accent }]}>STORIBASE</Text>
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
                Learn a language by{' '}
                <Text
                  style={{
                    fontFamily: 'Literata_400Regular_Italic',
                    color: colors.accent,
                  }}>
                  living inside
                </Text>{' '}
                its stories.
              </Text>
              <Text
                style={[
                  Typography.body,
                  {
                    color: colors.textSecondary,
                    marginTop: Spacing.md,
                    lineHeight: 26,
                    maxWidth: 480,
                  },
                ]}>
                Storibase helps you learn languages by learning to understand them, one story,
                sentence, and voice at a time.
              </Text>

              <View style={[styles.ctaRow, layout.width < 400 && styles.ctaStack]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Start reading in Italian"
                  onPress={() => router.push('/account?mode=signup' as Href)}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { backgroundColor: colors.accent, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onAccent }]}>
                    Start reading in Italian
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Try the walkthrough"
                  onPress={() => router.push('/walkthrough')}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.text }]}>Try the walkthrough</Text>
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

          {/* The Shelf */}
          <View
            onLayout={(e) => setShelfY(e.nativeEvent.layout.y)}
            style={styles.section}>
            <Text style={[Typography.chapterEyebrow, { color: colors.accent }]}>THE SHELF</Text>
            <Text
              style={[
                Typography.heroTitle,
                {
                  color: colors.text,
                  marginTop: Spacing.sm,
                  fontSize: layout.isPhone ? 28 : 34,
                },
              ]}>
              Italian is live. Spanish is up next.
            </Text>
            <Text
              style={[
                Typography.body,
                { color: colors.textSecondary, marginTop: Spacing.md, maxWidth: 520, lineHeight: 26 },
              ]}>
              Every course on Storibase is an original, chapter-by-chapter story. Italian is
              complete, and Spanish is currently in production. Join the waitlist to be notified
              first.
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shelfRow}
              style={{ marginTop: Spacing.xl }}>
              {SHELF_LANGUAGES.map((lang) => (
                <View
                  key={lang.id}
                  style={[
                    styles.spine,
                    {
                      backgroundColor: lang.live ? colors.accent : colors.locked,
                      borderColor: colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      lang.live ? styles.liveTag : styles.lockTag,
                      { color: lang.live ? colors.onAccent : colors.textMuted },
                    ]}>
                    {lang.tag}
                  </Text>
                  <Text
                    style={[
                      styles.spineLabel,
                      { color: lang.live ? colors.onAccent : colors.textMuted },
                    ]}>
                    {lang.label}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.notifyRow, layout.width < 480 && styles.notifyStack]}>
              <TextInput
                accessibilityLabel="Email for Spanish waitlist"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (notifyState !== 'idle') setNotifyState('idle');
                }}
                placeholder="you@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.emailInput,
                  {
                    color: colors.text,
                    borderColor: notifyState === 'invalid' ? colors.accent : colors.border,
                    backgroundColor: colors.backgroundElevated,
                  },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notify me"
                onPress={onNotify}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.88 : 1,
                    paddingHorizontal: Spacing.lg,
                  },
                ]}>
                <Text style={[Typography.button, { color: colors.onAccent }]}>
                  {notifyState === 'done' ? 'You’re on the list' : 'Notify me'}
                </Text>
              </Pressable>
            </View>
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
              {notifyState === 'invalid'
                ? 'Enter a valid email address.'
                : notifyState === 'done'
                  ? 'Thanks! We will email you as soon as Spanish is ready.'
                  : 'We will email you the day Spanish launches. No spam, ever.'}
            </Text>
          </View>

          {/* How it works */}
          <View
            onLayout={(e) => setPillarsY(e.nativeEvent.layout.y)}
            style={[
              styles.pillarsWrap,
              { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
            ]}>
            {PILLARS.map((item) => (
              <View key={item.title} style={styles.pillar}>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>{item.title}</Text>
                <Text
                  style={[
                    Typography.label,
                    {
                      color: colors.accent,
                      marginTop: Spacing.sm,
                      fontFamily: 'CormorantGaramond_600SemiBold',
                      fontSize: 22,
                      lineHeight: 28,
                    },
                  ]}>
                  {item.headline}
                </Text>
                <Text
                  style={[
                    Typography.body,
                    { color: colors.textSecondary, marginTop: Spacing.sm, lineHeight: 24 },
                  ]}>
                  {item.body}
                </Text>
              </View>
            ))}
          </View>

          {/* Final CTA */}
          <View
            style={[
              styles.final,
              { backgroundColor: colors.backgroundCard, borderColor: colors.border },
              wide && styles.finalWide,
            ]}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  Typography.heroTitle,
                  { color: colors.text, fontSize: layout.isPhone ? 28 : 34 },
                ]}>
                Start with one story.
              </Text>
              <Text style={[Typography.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                Free to begin. Italian, Chapter 1, right now.
              </Text>
            </View>
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
                  backgroundColor: colors.accent,
                  opacity: pressed ? 0.88 : 1,
                  marginTop: wide ? 0 : Spacing.lg,
                  alignSelf: wide ? 'center' : 'flex-start',
                },
              ]}>
              <Text style={[Typography.button, { color: colors.onAccent }]}>
                {continueHref ? 'Continue learning' : 'Start learning'}
              </Text>
            </Pressable>
          </View>

          <PublicFooter showLogin={!continueHref} />
        </ScreenContent>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
  section: {
    marginTop: Spacing.xxl * 1.2,
  },
  shelfRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  spine: {
    width: 72,
    height: 180,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  liveTag: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
  },
  lockTag: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  spineLabel: {
    fontFamily: 'Literata_500Medium',
    fontSize: 13,
    transform: [{ rotate: '-90deg' }],
    width: 140,
    textAlign: 'center',
  },
  notifyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  notifyStack: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  emailInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    fontFamily: 'Literata_400Regular',
    fontSize: 16,
  },
  pillarsWrap: {
    marginTop: Spacing.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  pillar: {
    flexGrow: 1,
    flexBasis: 200,
    minWidth: 180,
  },
  final: {
    marginTop: Spacing.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  finalWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
});
