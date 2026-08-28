import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { GrammarNote } from '@/src/content/lessonBatches';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';
import type { NotebookGrammarInsight } from '@/src/vocabulary/notebookData';

type Props = {
  insight: NotebookGrammarInsight | null;
  note: GrammarNote | null;
  visible: boolean;
  onClose: () => void;
  onNavigateChapter: (chapterNum: number) => void;
};

export function GrammarDetailModal({
  insight,
  note,
  visible,
  onClose,
  onNavigateChapter,
}: Props) {
  const { colors, minTouchTarget, type } = useTheme();

  if (!insight) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissOverlay} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
          ]}>
          {/* HEADER */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.categoryEyebrow, { color: colors.textMuted }]}>
                {insight.category.toUpperCase()} · {insight.level}
              </Text>
              <Text style={[type.heroTitle, styles.title, { color: colors.text }]}>
                {insight.titleIt}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close grammar pattern"
              style={styles.closeBtn}>
              <Text style={{ fontSize: 18, color: colors.textMuted }}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* FORMULA PILL */}
            <View style={[styles.formulaBox, { backgroundColor: colors.backgroundHigher }]}>
              <Text style={[type.caption, styles.formulaText, { color: colors.tint }]}>
                📐 {insight.formula}
              </Text>
            </View>

            {/* INTUITION */}
            <Text style={[type.body, { color: colors.textSecondary, fontSize: 14, lineHeight: 21 }]}>
              {note?.intro ?? insight.explanation}
            </Text>

            {/* LESSON STEPS (IF NOTE EXISTS) */}
            {note?.steps && note.steps.length > 0 ? (
              <View style={{ gap: Spacing.md, marginTop: Spacing.xs }}>
                {note.steps.map((step, idx) => (
                  <View
                    key={step.title}
                    style={[
                      styles.stepCard,
                      { backgroundColor: colors.backgroundHigher, borderColor: colors.border },
                    ]}>
                    <Text
                      style={[
                        type.body,
                        { color: colors.text, fontFamily: 'Literata_600SemiBold', fontSize: 14 },
                      ]}>
                      {idx + 1}. {step.title}
                    </Text>

                    <View
                      style={[
                        styles.rulePill,
                        { backgroundColor: colors.backgroundAtmosphereTop, borderLeftColor: colors.tint },
                      ]}>
                      <Text
                        style={[
                          type.caption,
                          { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 12 },
                        ]}>
                        📌 Rule: {step.rule}
                      </Text>
                    </View>

                    <Text
                      style={[
                        type.caption,
                        { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 3 },
                      ]}>
                      {step.explanation}
                    </Text>

                    {/* EXAMPLES */}
                    {step.examples && step.examples.length > 0 ? (
                      <View style={{ gap: 4, marginTop: 4 }}>
                        {step.examples.map((ex) => (
                          <View key={ex.italian} style={styles.exampleRow}>
                            <Text
                              style={[
                                type.body,
                                { color: colors.text, fontStyle: 'italic', fontSize: 13 },
                              ]}>
                              &ldquo;{ex.italian}&rdquo;
                            </Text>
                            <Text style={[type.caption, { color: colors.textMuted, fontSize: 12 }]}>
                              → {ex.english}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <View
                style={[
                  styles.stepCard,
                  { backgroundColor: colors.backgroundHigher, borderColor: colors.border },
                ]}>
                <Text
                  style={[
                    type.body,
                    { color: colors.text, fontStyle: 'italic', fontSize: 14 },
                  ]}>
                  &ldquo;{insight.exampleIt}&rdquo;
                </Text>
                <Text style={[type.caption, { color: colors.textSecondary, fontSize: 13, marginTop: 2 }]}>
                  {insight.exampleEn}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* FOOTER */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={() => {
                onClose();
                onNavigateChapter(insight.sampleChapterNumber);
              }}
              accessibilityRole="button"
              style={styles.chapterJumpBtn}>
              <Text style={[type.caption, { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 13 }]}>
                Read in Chapter {insight.sampleChapterNumber} →
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.closeSheetBtn,
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
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  categoryEyebrow: {
    fontSize: 11,
    fontFamily: 'Literata_600SemiBold',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    fontFamily: 'Literata_600SemiBold',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  formulaBox: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
    alignSelf: 'flex-start',
  },
  formulaText: {
    fontSize: 12,
    fontFamily: 'Literata_600SemiBold',
  },
  stepCard: {
    padding: Spacing.md,
    borderRadius: Radii.sm + 2,
    borderWidth: 1,
    gap: 4,
  },
  rulePill: {
    borderLeftWidth: 2.5,
    paddingLeft: Spacing.xs + 2,
    paddingVertical: 3,
    marginTop: 2,
  },
  exampleRow: {
    marginTop: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  chapterJumpBtn: {
    paddingVertical: 4,
  },
  closeSheetBtn: {
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
