import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenContent } from '@/src/components/ScreenContent';
import { LandingColors } from '@/src/marketing/landingTheme';
import { PublicFooter } from '@/src/marketing/PublicFooter';
import { PublicNav } from '@/src/marketing/PublicNav';
import { Spacing, Typography } from '@/src/theme/tokens';

const SECTIONS = [
  {
    title: 'Overview',
    body: 'Storibase (“we”, “us”) provides a story-driven language learning app. This Privacy Policy explains what information we collect, how we use it, and the choices you have. It is a product policy for Storibase learners — not a substitute for legal advice.',
  },
  {
    title: 'Information we collect',
    body: 'Account details you provide (such as email and display name) when you sign up. Learning progress, vocabulary encounters, and related preferences stored so you can continue where you left off. Optional profile fields like an avatar preset. Technical data needed to run the app (for example device/platform type and basic diagnostics).',
  },
  {
    title: 'How we use information',
    body: 'We use your information to provide and improve Storibase: syncing progress across sessions, personalizing your path through stories, securing your account, and fixing bugs. We do not sell your personal information. We do not use your learning content to train unrelated third-party advertising models.',
  },
  {
    title: 'Local storage and cloud sync',
    body: 'Progress may be stored on your device and, when you are signed in and cloud sync is available, on our infrastructure (for example Supabase). Local-only data stays on your device until you clear app storage or sign out in a way that removes it.',
  },
  {
    title: 'Audio and TTS',
    body: 'If you use listen features, story text may be sent to our text-to-speech gateway to generate audio. We process that text only to return speech for the app. Do not submit sensitive personal information into free-text fields unrelated to learning.',
  },
  {
    title: 'Cookies and similar technologies',
    body: 'On web, we may use local storage or similar technologies to keep you signed in and remember preferences. We do not use third-party advertising cookies on the Storibase learner experience.',
  },
  {
    title: 'Retention',
    body: 'We keep account and progress data while your account is active. You may request deletion of your account data by contacting us. Some backups or logs may persist for a limited time for security and operational reasons.',
  },
  {
    title: 'Your choices',
    body: 'You can update profile details in the app, sign out, and request access or deletion of account data. You can stop using optional features (such as listen) at any time.',
  },
  {
    title: 'Children',
    body: 'Storibase is not directed at children under 13. If you believe a child has provided personal information, contact us and we will take appropriate steps.',
  },
  {
    title: 'Changes',
    body: 'We may update this policy as the product evolves. We will post the revised version on this page with an updated date.',
  },
  {
    title: 'Contact',
    body: 'Questions about privacy: privacy@storibase.app (or the contact email listed on storibase.app when available).',
  },
] as const;

export default function PrivacyPolicyScreen() {
  const colors = LandingColors;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <PublicNav />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        showsVerticalScrollIndicator={false}>
        <ScreenContent maxWidth={720} style={styles.page}>
          <Text style={[Typography.chapterEyebrow, { color: colors.accent }]}>LEGAL</Text>
          <Text
            style={[Typography.heroTitle, { color: colors.text, marginTop: Spacing.sm, fontSize: 34 }]}
            accessibilityRole="header">
            Privacy Policy
          </Text>
          <Text style={[Typography.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
            Last updated: August 20, 2026
          </Text>

          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[Typography.label, { color: colors.text }]}>{section.title}</Text>
              <Text
                style={[
                  Typography.body,
                  { color: colors.textSecondary, marginTop: Spacing.sm, lineHeight: 26 },
                ]}>
                {section.body}
              </Text>
            </View>
          ))}

          <PublicFooter />
        </ScreenContent>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  page: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
  },
});
