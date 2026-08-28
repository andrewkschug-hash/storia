import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export type NotebookTab = 'words' | 'phrases' | 'grammar';

export const NOTEBOOK_TABS: NotebookTab[] = ['words', 'phrases', 'grammar'];

export type NotebookTabCounts = {
  words?: number;
  phrases?: number;
  grammar?: number;
  /** Backward-compatible alias */
  vocabulary?: number;
};

export const NOTEBOOK_TAB_CONFIG: Record<
  NotebookTab,
  { label: string; icon: string; defaultSub: string }
> = {
  words: { label: 'Words', icon: '📖', defaultSub: 'Word Bank' },
  phrases: { label: 'Phrases', icon: '💬', defaultSub: 'Memorable Lines' },
  grammar: { label: 'Grammar', icon: '🧠', defaultSub: 'Patterns' },
};

type Props = {
  active: NotebookTab;
  onChange: (tab: NotebookTab) => void;
  counts?: NotebookTabCounts;
};

export function NotebookTabs({ active, onChange, counts }: Props) {
  const { colors, minTouchTarget, type } = useTheme();

  const getCount = (tab: NotebookTab): number | undefined => {
    if (!counts) return undefined;
    if (tab === 'words') return counts.words ?? counts.vocabulary;
    return counts[tab];
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.tabRow}>
        {NOTEBOOK_TABS.map((tab) => {
          const isSelected = active === tab;
          const config = NOTEBOOK_TAB_CONFIG[tab];
          const count = getCount(tab);

          return (
            <Pressable
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${config.label}${count !== undefined ? `, ${count} items` : ''}`}
              onPress={() => onChange(tab)}
              style={({ pressed }) => [
                styles.tabBtn,
                {
                  borderBottomColor: isSelected ? colors.tint : 'transparent',
                  minHeight: Math.max(40, minTouchTarget - 4),
                  opacity: pressed ? 0.75 : 1,
                },
              ]}>
              <View style={styles.tabContent}>
                <Text
                  style={[
                    type.body,
                    styles.tabLabel,
                    {
                      color: isSelected ? colors.text : colors.textMuted,
                      fontFamily: isSelected ? 'Literata_600SemiBold' : 'Literata_500Medium',
                    },
                  ]}>
                  {config.label}
                </Text>
                {count !== undefined ? (
                  <Text
                    style={[
                      type.caption,
                      styles.countBadge,
                      {
                        color: isSelected ? colors.tint : colors.textMuted,
                        backgroundColor: isSelected ? colors.tintSoft : 'transparent',
                      },
                    ]}>
                    {count}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    marginBottom: Spacing.sm + 2,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  tabBtn: {
    paddingVertical: Spacing.xs + 4,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabLabel: {
    fontSize: 16,
    lineHeight: 20,
  },
  countBadge: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Literata_600SemiBold',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
