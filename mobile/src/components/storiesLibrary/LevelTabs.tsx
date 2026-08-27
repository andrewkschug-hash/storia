import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LibraryTab } from '@/src/components/storiesLibrary/types';
import { LIBRARY_TABS } from '@/src/components/storiesLibrary/buildStoryRows';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  active: LibraryTab;
  onChange: (tab: LibraryTab) => void;
};

const TAB_DESCRIPTIONS: Record<LibraryTab, { label: string; sub: string }> = {
  A1: { label: 'A1', sub: 'Arrivo' },
  'A1+': { label: 'A1+', sub: 'Appartenenza' },
  A2: { label: 'A2', sub: 'Responsabilità' },
  B1: { label: 'B1', sub: 'Due vite' },
  'B1+': { label: 'B1+', sub: 'La scelta' },
  'A2+': { label: 'A2+', sub: 'Percorsi' },
};

export function LevelTabs({ active, onChange }: Props) {
  const { colors, minTouchTarget } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, letterSpacing: 1.4, marginBottom: Spacing.sm }]}>
        Reading Pathway
      </Text>
      <View style={styles.shelfRow}>
        {LIBRARY_TABS.map((tab) => {
          const selected = tab === active;
          const info = TAB_DESCRIPTIONS[tab];
          return (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => onChange(tab)}
              style={({ pressed }) => [
                styles.tab,
                {
                  backgroundColor: selected ? colors.backgroundElevated : 'transparent',
                  borderBottomWidth: selected ? 2.5 : 0,
                  borderBottomColor: selected ? colors.tint : 'transparent',
                  minHeight: minTouchTarget,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: selected ? colors.text : colors.textMuted,
                    fontFamily: selected ? 'Literata_600SemiBold' : 'Literata_500Medium',
                  },
                ]}>
                {info.label}
              </Text>
              <Text
                style={[
                  styles.tabSub,
                  {
                    color: selected ? colors.tint : colors.textMuted,
                    opacity: selected ? 1 : 0.7,
                  },
                ]}>
                {info.sub}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.lg,
  },
  shelfRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
    borderRadius: Radii.sm,
  },
  tabLabel: {
    ...Typography.label,
    fontSize: 14,
  },
  tabSub: {
    ...Typography.caption,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
    textAlign: 'center',
  },
});

