import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';
import type { NotebookGrammarInsight } from '@/src/vocabulary/notebookData';

type Props = {
  insight: NotebookGrammarInsight;
  onOpenDetail: (insight: NotebookGrammarInsight) => void;
  onNavigateChapter: (chapterNum: number) => void;
};

export function GrammarEntry({ insight, onOpenDetail, onNavigateChapter }: Props) {
  const { colors, minTouchTarget, type } = useTheme();

  return (
    <View style={[styles.entry, { borderBottomColor: colors.divider }]}>
      {/* CATEGORY & LEVEL */}
      <View style={styles.topRow}>
        <Text style={[styles.categoryEyebrow, { color: colors.textMuted }]}>
          {insight.category.toUpperCase()} · {insight.level}
        </Text>
      </View>

      {/* CONCEPT TITLE */}
      <Text style={[type.heroTitle, styles.conceptTitle, { color: colors.text }]}>
        {insight.titleIt}
      </Text>

      {/* STORY ANCHOR QUOTE */}
      <View style={styles.quoteBox}>
        <Text style={[type.body, styles.storyQuote, { color: colors.text }]}>
          &ldquo;{insight.exampleIt}&rdquo;
        </Text>
        <Text style={[type.caption, styles.translationText, { color: colors.textSecondary }]}>
          {insight.exampleEn}
        </Text>
      </View>

      {/* INTUITION */}
      <Text style={[type.body, styles.explanationText, { color: colors.textSecondary }]}>
        {insight.explanation}
      </Text>

      {/* PROVENANCE TIMELINE */}
      <Text style={[type.caption, styles.provenanceText, { color: colors.textMuted }]}>
        From Luca&apos;s story · First encountered Ch. {insight.firstEncounterChapterNumber} ·
        Pattern review Ch. {insight.lessonChapterNumber}
      </Text>

      {/* FOOTER ACTIONS */}
      <View style={styles.footerRow}>
        <Pressable
          onPress={() => onNavigateChapter(insight.sampleChapterNumber)}
          accessibilityRole="button"
          accessibilityLabel={`Jump to Chapter ${insight.sampleChapterNumber}`}
          style={styles.chapterJumpLink}>
          <Text style={[type.caption, styles.jumpText, { color: colors.textMuted }]}>
            Chapter {insight.sampleChapterNumber} →
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onOpenDetail(insight)}
          accessibilityRole="button"
          accessibilityLabel={`Review grammar pattern ${insight.titleIt}`}
          style={({ pressed }) => [
            styles.reviewPatternBtn,
            {
              backgroundColor: colors.backgroundHigher,
              borderColor: colors.border,
              minHeight: Math.max(34, minTouchTarget - 10),
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <Text style={[type.caption, styles.reviewPatternText, { color: colors.tint }]}>
            Review Pattern →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  entry: {
    paddingVertical: Spacing.md + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs + 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEyebrow: {
    fontSize: 11,
    fontFamily: 'Literata_600SemiBold',
    letterSpacing: 0.8,
  },
  conceptTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontFamily: 'Literata_600SemiBold',
    marginTop: 1,
  },
  quoteBox: {
    marginTop: 2,
    paddingLeft: Spacing.xs,
  },
  storyQuote: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Literata_500Medium_Italic',
  },
  translationText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 1,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  provenanceText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'Literata_500Medium',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  chapterJumpLink: {
    paddingVertical: 4,
  },
  jumpText: {
    fontSize: 12,
    fontFamily: 'Literata_500Medium',
  },
  reviewPatternBtn: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewPatternText: {
    fontSize: 12,
    fontFamily: 'Literata_600SemiBold',
  },
});
