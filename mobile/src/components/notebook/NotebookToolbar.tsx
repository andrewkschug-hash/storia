import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
  placeholder?: string;
  onOpenFilter: () => void;
  hasActiveFilters?: boolean;
  savedOnly?: boolean;
  onToggleSaved?: () => void;
};

export function NotebookToolbar({
  search,
  onSearchChange,
  placeholder = 'Search your Italian…',
  onOpenFilter,
  hasActiveFilters = false,
  savedOnly = false,
  onToggleSaved,
}: Props) {
  const { colors, minTouchTarget, type } = useTheme();

  return (
    <View style={styles.container}>
      {/* SEARCH INPUT */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.backgroundElevated,
            borderColor: colors.border,
            minHeight: Math.max(38, minTouchTarget - 8),
          },
        ]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={[
            type.body,
            styles.input,
            { color: colors.text, minHeight: Math.max(36, minTouchTarget - 10) },
          ]}
        />
        {search ? (
          <Pressable
            onPress={() => onSearchChange('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={styles.clearBtn}>
            <Text style={{ color: colors.textMuted, fontSize: 15 }}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* QUICK SAVED TOGGLE (IF PROVIDED) */}
      {onToggleSaved ? (
        <Pressable
          onPress={onToggleSaved}
          accessibilityRole="button"
          accessibilityLabel={savedOnly ? 'Show all items' : 'Show saved items only'}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: savedOnly ? colors.tintSoft : colors.backgroundElevated,
              borderColor: savedOnly ? colors.tint : colors.border,
              minHeight: Math.max(38, minTouchTarget - 8),
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <Text style={{ fontSize: 16 }}>{savedOnly ? '⭐' : '☆'}</Text>
        </Pressable>
      ) : null}

      {/* FILTER BUTTON */}
      <Pressable
        onPress={onOpenFilter}
        accessibilityRole="button"
        accessibilityLabel="Open filter options"
        style={({ pressed }) => [
          styles.filterBtn,
          {
            backgroundColor: hasActiveFilters ? colors.tintSoft : colors.backgroundElevated,
            borderColor: hasActiveFilters ? colors.tint : colors.border,
            minHeight: Math.max(38, minTouchTarget - 8),
            opacity: pressed ? 0.75 : 1,
          },
        ]}>
        <Text style={[styles.filterIcon, { color: hasActiveFilters ? colors.tint : colors.text }]}>
          ⚙
        </Text>
        <Text
          style={[
            type.caption,
            styles.filterText,
            {
              color: hasActiveFilters ? colors.tint : colors.text,
              fontFamily: hasActiveFilters ? 'Literata_600SemiBold' : 'Literata_500Medium',
            },
          ]}>
          Filter
        </Text>
        {hasActiveFilters ? <View style={[styles.activeDot, { backgroundColor: colors.tint }]} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm + 2,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
    fontFamily: 'Literata_400Regular',
  },
  clearBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    borderRadius: Radii.sm + 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: Radii.sm + 2,
    borderWidth: 1,
    gap: 5,
  },
  filterIcon: {
    fontSize: 13,
  },
  filterText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 2,
  },
});
