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
    title: 'Agreement',
    body: 'By using Storibase, you agree to these Terms of Service. If you do not agree, do not use the app. These terms describe a product agreement for learners and are not a substitute for legal advice.',
  },
  {
    title: 'The service',
    body: 'Storibase provides story-based language learning experiences (currently Italian). Features may change as we improve the product. Some features (for example listen/TTS) may depend on network access or third-party providers.',
  },
  {
    title: 'Accounts',
    body: 'You are responsible for the accuracy of account information and for keeping login credentials secure. You must be old enough to form a binding contract in your jurisdiction (and at least 13). Do not share your account.',
  },
  {
    title: 'Acceptable use',
    body: 'Use Storibase only for lawful personal learning. Do not attempt to disrupt the service, scrape content at scale, reverse engineer beyond what the law allows, or misuse audio/TTS systems. Do not upload unlawful or abusive material.',
  },
  {
    title: 'Content and intellectual property',
    body: 'Stories, software, branding, and related materials belong to Storibase or its licensors. You may use the app for personal learning. You may not copy, redistribute, or commercially exploit Storibase content without permission.',
  },
  {
    title: 'Progress and availability',
    body: 'We try to keep progress accurate and the service available, but we do not guarantee uninterrupted access or perfect sync across every device. Features may be added, changed, or removed.',
  },
  {
    title: 'Disclaimers',
    body: 'Storibase is provided “as is” for educational purposes. We do not guarantee specific learning outcomes. To the fullest extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.',
  },
  {
    title: 'Limitation of liability',
    body: 'To the fullest extent permitted by law, Storibase and its operators are not liable for indirect, incidental, special, consequential, or punitive damages, or for lost data or profits, arising from your use of the service.',
  },
  {
    title: 'Termination',
    body: 'You may stop using Storibase at any time. We may suspend or terminate access if you violate these terms or abuse the service. Provisions that should survive (including IP, disclaimers, and limitations) will survive termination.',
  },
  {
    title: 'Changes',
    body: 'We may update these terms. Continued use after changes are posted means you accept the updated terms. The date at the top of this page will reflect the latest revision.',
  },
  {
    title: 'Contact',
    body: 'Questions about these terms: legal@storibase.app (or the contact email listed on storibase.app when available).',
  },
] as const;

export default function TermsOfServiceScreen() {
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
            Terms of Service
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
