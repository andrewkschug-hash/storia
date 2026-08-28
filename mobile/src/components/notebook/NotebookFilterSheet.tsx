import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';
import {
  CEFR_CURRICULUM_BANDS,
  type CefrBandKey,
  type GrammarFilterState,
  type NotebookLens,
  type PhrasesFilterState,
  type WordsFilterState,
} from '@/src/vocabulary/notebookSelectors';

type Props = {
  visible: boolean;
  onClose: () => void;
  lens: NotebookLens;
  wordsFilter: WordsFilterState;
  onWordsFilterChange: (next: WordsFilterState) => void;
  phrasesFilter: PhrasesFilterState;
  onPhrasesFilterChange: (next: PhrasesFilterState) => void;
  grammarFilter: GrammarFilterState;
  onGrammarFilterChange: (next: GrammarFilterState) => void;
  availableSpeakers?: string[];
};

export function NotebookFilterSheet({
  visible,
  onClose,
  lens,
  wordsFilter,
  onWordsFilterChange,
  phrasesFilter,
  onPhrasesFilterChange,
  grammarFilter,
  onGrammarFilterChange,
  availableSpeakers = ['Luca', 'Sofia', 'Marco', 'Bruno', 'Giulia', 'Signora Maria', 'Sergio'],
}: Props) {
  const { colors, minTouchTarget, type } = useTheme();

  const handleReset = () => {
    if (lens === 'words') {
      onWordsFilterChange({
        ...wordsFilter,
        pos: 'all',
        status: 'all',
        chapterRange: 'all',
        savedOnly: false,
        groupBy: 'chronology',
      });
    } else if (lens === 'phrases') {
      onPhrasesFilterChange({
        ...phrasesFilter,
        speaker: 'ALL',
        chapterRange: 'all',
        savedOnly: false,
      });
    } else if (lens === 'grammar') {
      onGrammarFilterChange({
        ...grammarFilter,
        level: 'all',
        chapterRange: 'all',
      });
    }
  };

  const cefrBands: { id: CefrBandKey; label: string }[] = [
    { id: 'all', label: 'All Chapters (1–70)' },
    { id: 'A1', label: CEFR_CURRICULUM_BANDS.A1.label },
    { id: 'A1+', label: CEFR_CURRICULUM_BANDS['A1+'].label },
    { id: 'A2', label: CEFR_CURRICULUM_BANDS.A2.label },
    { id: 'B1', label: CEFR_CURRICULUM_BANDS.B1.label },
    { id: 'B1+', label: CEFR_CURRICULUM_BANDS['B1+'].label },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissOverlay} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.backgroundElevated, borderColor: colors.border }]}>
          {/* HEADER */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[type.heroTitle, styles.sheetTitle, { color: colors.text }]}>
                Filter {lens === 'words' ? 'Words' : lens === 'phrases' ? 'Phrases' : 'Grammar'}
              </Text>
              <Text style={[type.caption, { color: colors.textSecondary, marginTop: 1 }]}>
                Refine by chapter, status, or category
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close filter"
              style={styles.closeBtn}>
              <Text style={{ fontSize: 18, color: colors.textMuted }}>✕</Text>
            </Pressable>
          </View>

          {/* CONTENT */}
          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* ===================== WORDS LENS ===================== */}
            {lens === 'words' && (
              <View style={{ gap: Spacing.md }}>
                {/* GROUP BY */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    GROUP BY
                  </Text>
                  <View style={styles.chipRow}>
                    {(
                      [
                        { id: 'chronology', label: '⏱ Story Timeline' },
                        { id: 'part_of_speech', label: '📑 Word Groups (Verbs, Nouns…)' },
                      ] as const
                    ).map((opt) => {
                      const isSelected = (wordsFilter.groupBy ?? 'chronology') === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() => onWordsFilterChange({ ...wordsFilter, groupBy: opt.id })}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isSelected ? colors.tint : colors.backgroundHigher,
                              borderColor: isSelected ? colors.tint : colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              { color: isSelected ? colors.onTint : colors.text },
                            ]}>
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* PART OF SPEECH */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    PART OF SPEECH
                  </Text>
                  <View style={styles.chipRow}>
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'verb', label: 'Verbs (Azioni)' },
                        { id: 'noun', label: 'Nouns (Sostantivi)' },
                        { id: 'adjective', label: 'Describing (Aggettivi)' },
                        { id: 'adverb', label: 'Adverbs (Avverbi)' },
                        { id: 'other', label: 'Other' },
                      ] as const
                    ).map((opt) => {
                      const isSelected = wordsFilter.pos === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() => onWordsFilterChange({ ...wordsFilter, pos: opt.id })}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isSelected ? colors.tint : colors.backgroundHigher,
                              borderColor: isSelected ? colors.tint : colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              { color: isSelected ? colors.onTint : colors.text },
                            ]}>
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* STATUS */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>STATUS</Text>
                  <View style={styles.chipRow}>
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'learning', label: 'Learning' },
                        { id: 'familiar', label: 'Familiar' },
                        { id: 'mastered', label: 'Mastered' },
                      ] as const
                    ).map((opt) => {
                      const isSelected = wordsFilter.status === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() => onWordsFilterChange({ ...wordsFilter, status: opt.id })}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isSelected ? colors.tint : colors.backgroundHigher,
                              borderColor: isSelected ? colors.tint : colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              { color: isSelected ? colors.onTint : colors.text },
                            ]}>
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* CHAPTER RANGE */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    CHAPTER / CEFR LEVEL
                  </Text>
                  <View style={styles.chipRow}>
                    {cefrBands.map((opt) => {
                      const isSelected = wordsFilter.chapterRange === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() =>
                            onWordsFilterChange({ ...wordsFilter, chapterRange: opt.id })
                          }
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isSelected ? colors.tint : colors.backgroundHigher,
                              borderColor: isSelected ? colors.tint : colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              { color: isSelected ? colors.onTint : colors.text },
                            ]}>
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* ===================== PHRASES LENS ===================== */}
            {lens === 'phrases' && (
              <View style={{ gap: Spacing.md }}>
                {/* SPEAKER */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>SPEAKER</Text>
                  <View style={styles.chipRow}>
                    {[{ id: 'ALL', label: 'All Speakers' }, ...availableSpeakers.map((s) => ({ id: s, label: s }))].map((opt) => {
                      const isSelected = phrasesFilter.speaker.toLowerCase() === opt.id.toLowerCase();
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() =>
                            onPhrasesFilterChange({ ...phrasesFilter, speaker: opt.id })
                          }
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isSelected ? colors.tint : colors.backgroundHigher,
                              borderColor: isSelected ? colors.tint : colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              { color: isSelected ? colors.onTint : colors.text },
                            ]}>
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* CHAPTER RANGE */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    CHAPTER / CEFR LEVEL
                  </Text>
                  <View style={styles.chipRow}>
                    {cefrBands.map((opt) => {
                      const isSelected = phrasesFilter.chapterRange === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() =>
                            onPhrasesFilterChange({ ...phrasesFilter, chapterRange: opt.id })
                          }
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isSelected ? colors.tint : colors.backgroundHigher,
                              borderColor: isSelected ? colors.tint : colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              { color: isSelected ? colors.onTint : colors.text },
                            ]}>
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* ===================== GRAMMAR LENS ===================== */}
            {lens === 'grammar' && (
              <View style={{ gap: Spacing.md }}>
                {/* CEFR LEVEL */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    CURRICULUM LEVEL
                  </Text>
                  <View style={styles.chipRow}>
                    {(
                      [
                        { id: 'all', label: 'All Levels' },
                        { id: 'A1', label: 'A1 (Chapters 1–20)' },
                        { id: 'A1+', label: 'A1+ (Chapters 21–24)' },
                        { id: 'A2', label: 'A2 (Chapters 25–40)' },
                        { id: 'B1', label: 'B1 (Chapters 41–55)' },
                        { id: 'B1+', label: 'B1+ (Chapters 56–70)' },
                      ] as const
                    ).map((opt) => {
                      const isSelected = grammarFilter.level === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() => onGrammarFilterChange({ ...grammarFilter, level: opt.id })}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isSelected ? colors.tint : colors.backgroundHigher,
                              borderColor: isSelected ? colors.tint : colors.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              { color: isSelected ? colors.onTint : colors.text },
                            ]}>
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* FOOTER */}
          <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={handleReset}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.resetBtn,
                { opacity: pressed ? 0.7 : 1, minHeight: Math.max(38, minTouchTarget - 8) },
              ]}>
              <Text style={[type.caption, { color: colors.textMuted, fontSize: 13 }]}>
                Reset Filters
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.doneBtn,
                {
                  backgroundColor: colors.buttonPrimary,
                  opacity: pressed ? 0.85 : 1,
                  minHeight: Math.max(38, minTouchTarget - 8),
                },
              ]}>
              <Text style={[type.button, { color: colors.onButtonPrimary, fontSize: 13 }]}>
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    borderWidth: 1,
    maxHeight: '75%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 18,
    lineHeight: 22,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Literata_600SemiBold',
    letterSpacing: 0.8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Literata_500Medium',
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  resetBtn: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  doneBtn: {
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
