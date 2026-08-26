import { useRef, useState } from 'react';
import { Animated, LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';

import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FUTURE_LEVELS = [
  { level: 'B1', title: 'Lettura indipendente', detail: 'Storie più lunghe e conversazioni autentiche' },
  { level: 'B1+', title: 'Narrazioni estese', detail: 'Trame articolate e descrizioni ricche' },
  { level: 'B2', title: 'Scelte e complessità', detail: 'Saggi, romanzi e italiano naturale' },
  { level: 'C1', title: 'Fluidità avanzata', detail: 'Espressioni idiomatiche e sfumature letterarie' },
] as const;

export function LockedLevelsAccordion() {
  const { colors, minTouchTarget } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const rotate = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
    Animated.timing(rotate, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded((prev) => !prev);
  };

  const chevronRotate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={toggle}
        style={({ pressed }) => [
          styles.header,
          {
            opacity: pressed ? 0.88 : 1,
            minHeight: minTouchTarget,
          },
        ]}>
        <View style={styles.headerText}>
          <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.4 }]}>
            Più avanti
          </Text>
          <Text style={[styles.title, { color: colors.textSecondary }]}>
            Nuove storie appariranno mentre il tuo italiano cresce.
          </Text>
        </View>
        <Animated.Text style={{ transform: [{ rotate: chevronRotate }], color: colors.textMuted, fontSize: 16 }}>
          ▾
        </Animated.Text>
      </Pressable>

      {expanded ? (
        <View style={styles.list}>
          {FUTURE_LEVELS.map((level) => (
            <View
              key={level.level}
              style={[styles.levelRow, { backgroundColor: colors.backgroundElevated }]}>
              <Text style={[styles.levelLabel, { color: colors.textMuted }]}>{level.level}</Text>
              <View style={styles.levelMeta}>
                <Text style={[styles.levelTitle, { color: colors.text }]}>{level.title}</Text>
                <Text style={[styles.levelDetail, { color: colors.textSecondary }]}>
                  {level.detail}
                </Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>🔒</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  headerText: {
    flex: 1,
    paddingRight: Spacing.md,
    gap: 2,
  },
  title: {
    fontFamily: 'Literata_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  list: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    gap: Spacing.md,
  },
  levelLabel: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 15,
    width: 32,
  },
  levelMeta: {
    flex: 1,
  },
  levelTitle: {
    fontFamily: 'Literata_500Medium',
    fontSize: 15,
    lineHeight: 20,
  },
  levelDetail: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
});

