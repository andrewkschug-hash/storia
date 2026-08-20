import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LandingColors } from '@/src/marketing/landingTheme';
import { Spacing, Typography } from '@/src/theme/tokens';
import { useLayout } from '@/src/theme/useLayout';

type Props = {
  showLogin?: boolean;
};

export function PublicFooter({ showLogin = true }: Props) {
  const layout = useLayout();
  const colors = LandingColors;

  return (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: colors.border,
          flexDirection: layout.isPhone ? 'column' : 'row',
          alignItems: layout.isPhone ? 'flex-start' : 'center',
          gap: layout.isPhone ? Spacing.md : Spacing.lg,
        },
      ]}>
      <Text style={[Typography.caption, { color: colors.textMuted }]}>© 2026 Storibase</Text>
      <View style={styles.links}>
        <FooterLink label="Privacy Policy" href="/privacy" />
        <FooterLink label="Terms of Service" href="/terms" />
        {showLogin ? (
          <FooterLink label="Log in" href={'/account?mode=signin' as Href} />
        ) : null}
      </View>
    </View>
  );
}

function FooterLink({ label, href }: { label: string; href: Href }) {
  const colors = LandingColors;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => router.push(href)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, minHeight: 44, justifyContent: 'center' })}>
      <Text style={[Typography.caption, { color: colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  footer: {
    justifyContent: 'space-between',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.xxl,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    alignItems: 'center',
  },
});
