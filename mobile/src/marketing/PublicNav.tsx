import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LandingColors } from '@/src/marketing/landingTheme';
import { navigateContinueLearning } from '@/src/progress/continueNavigation';
import { useLayout } from '@/src/theme/useLayout';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';

type Props = {
  continueHref?: Href | null;
  onLanguagesPress?: () => void;
  onHowItWorksPress?: () => void;
};

export function PublicNav({ continueHref, onLanguagesPress, onHowItWorksPress }: Props) {
  const colors = LandingColors;
  const layout = useLayout();
  const [open, setOpen] = useState(false);
  const compact = layout.isPhone;

  const go = (href: Href) => {
    setOpen(false);
    router.push(href);
  };

  const continueLearning = () => {
    setOpen(false);
    if (continueHref) {
      void navigateContinueLearning(continueHref);
    }
  };

  return (
    <View>
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
          accessibilityLabel="Storibase home"
          onPress={() => go('/')}
          style={({ pressed }) => [styles.brandRow, { opacity: pressed ? 0.75 : 1 }]}>
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          <Text style={[Typography.brand, { color: colors.text, fontSize: 26, lineHeight: 32 }]}>
            Storibase
          </Text>
        </Pressable>

        {!compact ? (
          <>
            <View style={styles.centerLinks}>
              <NavText
                label="Languages"
                onPress={() => {
                  setOpen(false);
                  if (onLanguagesPress) onLanguagesPress();
                  else go('/');
                }}
                colors={colors}
              />
              <NavText
                label="How it works"
                onPress={() => {
                  setOpen(false);
                  if (onHowItWorksPress) onHowItWorksPress();
                  else go('/');
                }}
                colors={colors}
              />
            </View>
            <View style={styles.right}>
              {continueHref ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Continue learning"
                  onPress={continueLearning}
                  style={({ pressed }) => [
                    styles.primary,
                    { backgroundColor: colors.accent, opacity: pressed ? 0.88 : 1 },
                  ]}>
                  <Text style={[Typography.button, { color: colors.onAccent }]}>Continue</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel="Log in"
                    onPress={() => go('/account?mode=signin' as Href)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                      minHeight: 44,
                      justifyContent: 'center',
                    })}>
                    <Text style={[Typography.label, { color: colors.textSecondary }]}>Log in</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Start"
                    onPress={() => go('/account?mode=signup' as Href)}
                    style={({ pressed }) => [
                      styles.primary,
                      { backgroundColor: colors.accent, opacity: pressed ? 0.88 : 1 },
                    ]}>
                    <Text style={[Typography.button, { color: colors.onAccent }]}>Start</Text>
                  </Pressable>
                </>
              )}
            </View>
          </>
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

        {compact && open ? (
          <View
            style={[
              styles.dropdown,
              { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
            ]}>
            <NavText
              label="Languages"
              onPress={() => {
                setOpen(false);
                if (onLanguagesPress) onLanguagesPress();
                else go('/');
              }}
              colors={colors}
            />
            <NavText
              label="How it works"
              onPress={() => {
                setOpen(false);
                if (onHowItWorksPress) onHowItWorksPress();
                else go('/');
              }}
              colors={colors}
            />
            <NavText label="Try walkthrough" onPress={() => go('/walkthrough')} colors={colors} />
            {continueHref ? (
              <NavText label="Continue learning" onPress={continueLearning} colors={colors} />
            ) : (
              <>
                <NavText
                  label="Log in"
                  onPress={() => go('/account?mode=signin' as Href)}
                  colors={colors}
                />
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

      <View style={[styles.betaBar, { backgroundColor: colors.betaBar }]}>
        <View style={[styles.betaTag, { backgroundColor: colors.accent }]}>
          <Text style={[styles.betaTagText, { color: colors.onAccent }]}>BETA</Text>
        </View>
        <Text style={[Typography.caption, { color: colors.textMuted, flex: 1 }]}>
          Storibase currently teaches Italian only. Spanish is coming next.
        </Text>
      </View>
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
  colors: { textSecondary: string };
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  centerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
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
  betaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  betaTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  betaTagText: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
  },
});
