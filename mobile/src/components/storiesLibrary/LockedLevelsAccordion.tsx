import { useRef, useState } from 'react';
import { Animated, LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';

import { LOCKED_LEVEL_PREVIEWS } from '@/src/components/storiesLibrary/buildStoryRows';
import { Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
          <Text style={[styles.title, { color: colors.textMuted }]}>Locked Levels 🔒</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Unlock B1, B2 and C1 as you progress.
          </Text>
        </View>
        <Animated.Text style={{ transform: [{ rotate: chevronRotate }], color: colors.textMuted }}>
          ▾
        </Animated.Text>
      </Pressable>

      {expanded ? (
        <View style={styles.list}>
          {LOCKED_LEVEL_PREVIEWS.map((level) => (
            <View
              key={level.level}
              style={[styles.levelRow, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
              <Text style={[styles.levelLabel, { color: colors.textMuted }]}>{level.level}</Text>
              <View style={styles.levelMeta}>
                <Text style={[styles.levelTitle, { color: colors.textMuted }]}>{level.title}</Text>
                {level.chapterCount > 0 ? (
                  <Text style={[styles.levelChapters, { color: colors.textMuted }]}>
                    {level.chapterCount} chapters
                  </Text>
                ) : (
                  <Text style={[styles.levelChapters, { color: colors.textMuted }]}>Coming soon</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontFamily: 'Literata_500Medium',
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.7,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    opacity: 0.55,
  },
  list: {
    gap: 8,
    marginTop: 8,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 16,
  },
  levelLabel: {
    fontFamily: 'Literata_600SemiBold',
    fontSize: 15,
    width: 36,
    opacity: 0.5,
  },
  levelMeta: {
    flex: 1,
  },
  levelTitle: {
    fontFamily: 'Literata_500Medium',
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.55,
  },
  levelChapters: {
    ...Typography.caption,
    fontSize: 13,
    marginTop: 2,
    opacity: 0.45,
  },
});
