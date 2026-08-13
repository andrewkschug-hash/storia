import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export type PublicSectionId = 'why' | 'how' | 'journey';

type Props = {
  onScrollToSection?: (id: PublicSectionId) => void;
  continueHref?: Href | null;
};

export function PublicNav({ onScrollToSection, continueHref }: Props) {
  const { colors } = useTheme();
  const layout = useLayout();
  const [open, setOpen] = useState(false);
  const compact = layout.isPhone;

  const go = (href: Href) => {
    setOpen(false);
    router.push(href);
  };

  const scroll = (id: PublicSectionId) => {
    setOpen(false);
    onScrollToSection?.(id);
  };

  const links = (
    <>
      <NavText label="How it works" onPress={() => scroll('how')} colors={colors} />
      <NavText label="Why it's different" onPress={() => scroll('why')} colors={colors} />
      <NavText label="Try walkthrough" onPress={() => go('/walkthrough')} colors={colors} />
    </>
  );

  return (
    <View
      accessibilityRole="header"
      style={[
        styles.bar,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Storia home"
        onPress={() => go('/')}
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
        <Text style={[Typography.brand, { color: colors.text, fontSize: 28, lineHeight: 34 }]}>
          Storia
        </Text>
      </Pressable>

      {!compact ? (
        <View style={styles.mid}>{links}</View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={open ? 'Close menu' : 'Open menu'}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((value) => !value)}
          style={({ pressed }) => [
            styles.menuBtn,
            { borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
          ]}>
          <Text style={[Typography.label, { color: colors.text }]}>{open ? 'Close' : 'Menu'}</Text>
        </Pressable>
      )}

      {!compact ? (
        <View style={styles.right}>
          {continueHref ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue learning"
              onPress={() => go(continueHref)}
              style={({ pressed }) => [
                styles.primary,
                { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1 },
              ]}>
              <Text style={[Typography.button, { color: '#F7FAF9' }]}>Continue learning</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Log in"
                onPress={() => go('/account?mode=signin' as Href)}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, minHeight: 44, justifyContent: 'center' })}>
                <Text style={[Typography.label, { color: colors.textSecondary }]}>Log in</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start learning"
                onPress={() => go('/account?mode=signup' as Href)}
                style={({ pressed }) => [
                  styles.primary,
                  { backgroundColor: colors.tint, opacity: pressed ? 0.88 : 1 },
                ]}>
                <Text style={[Typography.button, { color: '#F7FAF9' }]}>Start learning</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : null}

      {compact && open ? (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
          ]}>
          {links}
          {continueHref ? (
            <NavText label="Continue learning" onPress={() => go(continueHref)} colors={colors} />
          ) : (
            <>
              <NavText label="Log in" onPress={() => go('/account?mode=signin' as Href)} colors={colors} />
              <NavText
                label="Start learning"
                onPress={() => go('/account?mode=signup' as Href)}
                colors={colors}
              />
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

function NavText({
  label,
  onPress,
  colors,
}: {
  label: string;
  onPress: () => void;
  colors: { text: string; textSecondary: string };
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, minHeight: 44, justifyContent: 'center' })}>
      <Text style={[Typography.label, { color: colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
    zIndex: 2,
  },
  mid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    flex: 1,
    justifyContent: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  primary: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
});
