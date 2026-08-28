import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';
import type { NotebookVerbPattern } from '@/src/vocabulary/notebookVerbs';

type VerbTense = 'presente' | 'passatoProssimo' | 'imperfetto';

type Props = {
  verb: NotebookVerbPattern | null;
  visible: boolean;
  onClose: () => void;
  onPlayAudio: (id: string, text: string) => void;
  onNavigateChapter: (chapterNum: number) => void;
};

export function VerbDetailSheet({
  verb,
  visible,
  onClose,
  onPlayAudio,
  onNavigateChapter,
}: Props) {
  const { colors, minTouchTarget, type } = useTheme();

  if (!verb) return null;

  const tenses: { id: VerbTense; label: string }[] = [
    { id: 'presente', label: 'Presente (Present)' },
    { id: 'passatoProssimo', label: 'Passato Prossimo (Past)' },
    { id: 'imperfetto', label: 'Imperfetto (Habitual)' },
  ];

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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[type.heroTitle, styles.infinitive, { color: colors.text }]}>
                  {verb.infinitive}
                </Text>
                <Pressable
                  onPress={() => onPlayAudio(`verb:${verb.lemmaId}`, verb.infinitive)}
                  accessibilityRole="button"
                  accessibilityLabel={`Pronounce ${verb.infinitive}`}
                  style={{ padding: 4 }}>
                  <Text style={{ fontSize: 18 }}>🔊</Text>
                </Pressable>
              </View>
              <Text style={[type.body, { color: colors.textSecondary, fontSize: 14, marginTop: 1 }]}>
                {verb.english} · <Text style={{ fontStyle: 'italic' }}>{verb.regularGroup}</Text>
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close verb details"
              style={styles.closeBtn}>
              <Text style={{ fontSize: 18, color: colors.textMuted }}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* WHY IT CHANGES TIP */}
            {verb.whyItChanges ? (
              <View
                style={[
                  styles.tipBox,
                  { backgroundColor: colors.backgroundAtmosphereTop, borderLeftColor: colors.tint },
                ]}>
                <Text style={[type.caption, { color: colors.text, fontSize: 13, lineHeight: 18 }]}>
                  💡 {verb.whyItChanges}
                </Text>
              </View>
            ) : null}

            {/* CONJUGATION TABLES (3 STORY TENSES) */}
            {tenses.map((t) => {
              const data =
                t.id === 'passatoProssimo'
                  ? verb.passatoProssimo
                  : t.id === 'imperfetto'
                    ? verb.imperfetto
                    : verb.presente;

              const rows = [
                { p: 'io (I)', form: data.io },
                { p: 'tu (you)', form: data.tu },
                { p: 'lui / lei (he/she)', form: data.luiLei },
                { p: 'noi (we)', form: data.noi },
                { p: 'voi (you all)', form: data.voi },
                { p: 'loro (they)', form: data.loro },
              ];

              return (
                <View key={t.id} style={styles.tenseSection}>
                  <Text style={[styles.tenseHeaderTitle, { color: colors.tint }]}>
                    {t.label.toUpperCase()}
                  </Text>
                  <View style={[styles.grid, { borderColor: colors.border }]}>
                    {rows.map((row) => (
                      <View
                        key={row.p}
                        style={[styles.gridRow, { borderBottomColor: colors.divider }]}>
                        <Text
                          style={[
                            type.caption,
                            { color: colors.textMuted, width: 100, fontSize: 12 },
                          ]}>
                          {row.p}
                        </Text>
                        <Text
                          style={[
                            type.body,
                            {
                              color: colors.text,
                              fontFamily: 'Literata_600SemiBold',
                              fontSize: 14,
                              flex: 1,
                            },
                          ]}>
                          {row.form}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            {/* STORY EXAMPLES */}
            {verb.transformations && verb.transformations.length > 0 ? (
              <View style={styles.tenseSection}>
                <Text style={[styles.tenseHeaderTitle, { color: colors.textMuted }]}>
                  FROM LUCA&apos;S STORY
                </Text>
                <View style={{ gap: Spacing.xs }}>
                  {verb.transformations.map((trans) => (
                    <View
                      key={trans.form}
                      style={[
                        styles.storyRow,
                        { backgroundColor: colors.backgroundHigher, borderColor: colors.border },
                      ]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text
                          style={[
                            type.body,
                            { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 13 },
                          ]}>
                          {trans.form}{' '}
                          <Text
                            style={[
                              type.caption,
                              { color: colors.textMuted, fontFamily: 'Literata_400Regular' },
                            ]}>
                            ({trans.tenseName})
                          </Text>
                        </Text>
                        <Pressable
                          onPress={() => {
                            onClose();
                            onNavigateChapter(trans.chapterNumber);
                          }}>
                          <Text
                            style={[
                              type.caption,
                              { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 11 },
                            ]}>
                            Chapter {trans.chapterNumber} →
                          </Text>
                        </Pressable>
                      </View>
                      <Text
                        style={[
                          type.body,
                          {
                            color: colors.text,
                            fontStyle: 'italic',
                            fontSize: 13,
                            marginTop: 3,
                          },
                        ]}>
                        &ldquo;{trans.quoteIt}&rdquo;
                      </Text>
                      <Text
                        style={[
                          type.caption,
                          { color: colors.textSecondary, fontSize: 12, marginTop: 1 },
                        ]}>
                        {trans.quoteEn}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* FOOTER */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
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
                Close
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
  infinitive: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: 'Literata_600SemiBold',
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  tipBox: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    borderLeftWidth: 3,
  },
  tenseSection: {
    gap: Spacing.xs,
  },
  tenseHeaderTitle: {
    fontSize: 11,
    fontFamily: 'Literata_600SemiBold',
    letterSpacing: 0.8,
  },
  grid: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    overflow: 'hidden',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
  },
  storyRow: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  closeSheetBtn: {
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
