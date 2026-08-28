import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';
import type { NotebookVerbPattern } from '@/src/vocabulary/notebookVerbs';

export type VerbTense = 'presente' | 'passatoProssimo' | 'imperfetto' | 'condizionale';
export type VerbViewMode = 'conjugation' | 'storyQuotes' | 'wordFamily';

type Props = {
  verb: NotebookVerbPattern;
  selectedTense: VerbTense;
  onSelectTense: (tense: VerbTense) => void;
  onPlayAudio: (id: string, text: string) => void;
  onNavigateChapter: (chapterNum: number) => void;
};

export function VerbDetailCard({
  verb,
  selectedTense,
  onSelectTense,
  onPlayAudio,
  onNavigateChapter,
}: Props) {
  const { colors, minTouchTarget, type } = useTheme();
  const [viewMode, setViewMode] = useState<VerbViewMode>('conjugation');

  const storyQuotesCount = verb.transformations?.length ?? 0;
  const wordFamilyCount = verb.wordFamily?.length ?? 0;

  const tenses: { id: VerbTense; label: string; short: string }[] = [
    { id: 'presente', label: 'Presente (Present)', short: 'Presente' },
    { id: 'passatoProssimo', label: 'Passato Prossimo (Past)', short: 'Passato' },
    { id: 'imperfetto', label: 'Imperfetto (Habitual)', short: 'Imperfetto' },
    ...(verb.condizionale
      ? [{ id: 'condizionale' as const, label: 'Condizionale (Polite)', short: 'Condizionale' }]
      : []),
  ];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
      ]}>
      {/* VERB HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[type.heroTitle, { color: colors.text, fontSize: 24, lineHeight: 28 }]}>
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
          <Text style={[type.caption, { color: colors.textSecondary, fontSize: 14, marginTop: 2 }]}>
            {verb.english} · Root: <Text style={{ fontFamily: 'Literata_600SemiBold' }}>{verb.root}</Text>
          </Text>
        </View>

        <View
          style={[
            styles.groupBadge,
            { backgroundColor: colors.backgroundHigher, borderColor: colors.border },
          ]}>
          <Text
            style={[
              type.caption,
              { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 11 },
            ]}>
            {verb.regularGroup.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* WHY IT CHANGES TIP */}
      <View
        style={[
          styles.whyChangesBox,
          { backgroundColor: colors.backgroundAtmosphereTop, borderLeftColor: colors.tint },
        ]}>
        <Text style={[type.caption, { color: colors.text, fontSize: 13, lineHeight: 18 }]}>
          💡 {verb.whyItChanges}
        </Text>
      </View>

      {/* SUB-SECTION SELECTOR SEGMENT BAR */}
      <View style={[styles.segmentBar, { backgroundColor: colors.backgroundHigher, borderColor: colors.border }]}>
        <Pressable
          onPress={() => setViewMode('conjugation')}
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'conjugation' }}
          style={[
            styles.segmentBtn,
            viewMode === 'conjugation' && {
              backgroundColor: colors.tint,
            },
          ]}>
          <Text
            style={[
              type.caption,
              {
                color: viewMode === 'conjugation' ? colors.onTint : colors.textSecondary,
                fontFamily: viewMode === 'conjugation' ? 'Literata_600SemiBold' : 'Literata_400Regular',
                fontSize: 12,
              },
            ]}>
            📊 Conjugation
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setViewMode('storyQuotes')}
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'storyQuotes' }}
          style={[
            styles.segmentBtn,
            viewMode === 'storyQuotes' && {
              backgroundColor: colors.tint,
            },
          ]}>
          <Text
            style={[
              type.caption,
              {
                color: viewMode === 'storyQuotes' ? colors.onTint : colors.textSecondary,
                fontFamily: viewMode === 'storyQuotes' ? 'Literata_600SemiBold' : 'Literata_400Regular',
                fontSize: 12,
              },
            ]}>
            💬 Quotes ({storyQuotesCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setViewMode('wordFamily')}
          accessibilityRole="tab"
          accessibilityState={{ selected: viewMode === 'wordFamily' }}
          style={[
            styles.segmentBtn,
            viewMode === 'wordFamily' && {
              backgroundColor: colors.tint,
            },
          ]}>
          <Text
            style={[
              type.caption,
              {
                color: viewMode === 'wordFamily' ? colors.onTint : colors.textSecondary,
                fontFamily: viewMode === 'wordFamily' ? 'Literata_600SemiBold' : 'Literata_400Regular',
                fontSize: 12,
              },
            ]}>
            🌱 Family ({wordFamilyCount})
          </Text>
        </Pressable>
      </View>

      {/* VIEW 1: CONJUGATION WITH HORIZONTAL TENSE SELECTOR */}
      {viewMode === 'conjugation' && (
        <View style={{ gap: Spacing.sm }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tenseRow}>
            {tenses.map((t) => {
              const active = selectedTense === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => onSelectTense(t.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select tense ${t.label}`}
                  style={({ pressed }) => [
                    styles.tensePill,
                    {
                      backgroundColor: active ? colors.tint : colors.backgroundHigher,
                      borderColor: active ? colors.tint : colors.border,
                      opacity: pressed ? 0.8 : 1,
                      minHeight: Math.max(34, minTouchTarget - 10),
                    },
                  ]}>
                  <Text
                    style={[
                      type.caption,
                      {
                        color: active ? colors.onTint : colors.text,
                        fontFamily: active ? 'Literata_600SemiBold' : 'Literata_400Regular',
                        fontSize: 12,
                      },
                    ]}>
                    {t.short}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* GRID */}
          <View style={[styles.conjugationGrid, { borderColor: colors.border }]}>
            {renderConjugationGrid(verb, selectedTense, colors, type)}
          </View>
        </View>
      )}

      {/* VIEW 2: STORY USAGE EXAMPLES */}
      {viewMode === 'storyQuotes' && (
        <View style={{ gap: Spacing.xs }}>
          {verb.transformations && verb.transformations.length > 0 ? (
            verb.transformations.map((trans) => (
              <View
                key={trans.form}
                style={[
                  styles.transRow,
                  { backgroundColor: colors.backgroundHigher, borderColor: colors.border },
                ]}>
                <View style={styles.transHeader}>
                  <Text
                    style={[
                      type.heroTitle,
                      { color: colors.tint, fontSize: 15, lineHeight: 18 },
                    ]}>
                    {trans.form}
                  </Text>
                  <Text style={[Typography.chapterEyebrow, { color: colors.textMuted, fontSize: 11 }]}>
                    {trans.tenseName}
                  </Text>
                </View>
                <Text
                  style={[
                    type.body,
                    { color: colors.text, fontSize: 13, fontStyle: 'italic', marginTop: 2 },
                  ]}>
                  &ldquo;{trans.quoteIt}&rdquo;
                </Text>
                <Text style={[type.caption, { color: colors.textSecondary, fontSize: 12 }]}>
                  {trans.quoteEn}
                </Text>
                <Pressable
                  onPress={() => onNavigateChapter(trans.chapterNumber)}
                  accessibilityRole="button"
                  style={{ alignSelf: 'flex-end', marginTop: 2 }}>
                  <Text
                    style={[
                      type.caption,
                      { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 11 },
                    ]}>
                    Chapter {trans.chapterNumber} →
                  </Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={[type.caption, { color: colors.textMuted, textAlign: 'center', paddingVertical: 12 }]}>
              No story quotes recorded for this verb.
            </Text>
          )}
        </View>
      )}

      {/* VIEW 3: WORD FAMILY CONNECTIONS */}
      {viewMode === 'wordFamily' && (
        <View style={{ gap: Spacing.xs }}>
          {verb.wordFamily && verb.wordFamily.length > 0 ? (
            verb.wordFamily.map((wf) => (
              <View
                key={wf.wordIt}
                style={[
                  styles.wordFamilyRow,
                  { backgroundColor: colors.backgroundHigher, borderColor: colors.border },
                ]}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      type.body,
                      { color: colors.text, fontFamily: 'Literata_600SemiBold', fontSize: 13 },
                    ]}>
                    {wf.wordIt}{' '}
                    <Text
                      style={[
                        type.caption,
                        { color: colors.textSecondary, fontFamily: 'Literata_400Regular' },
                      ]}>
                      · {wf.wordEn}
                    </Text>
                  </Text>
                  <Text style={[type.caption, { color: colors.textMuted, fontSize: 11, marginTop: 1 }]}>
                    {wf.relationship}
                  </Text>
                </View>
                {wf.chapterNumber ? (
                  <Pressable
                    onPress={() => onNavigateChapter(wf.chapterNumber!)}
                    accessibilityRole="button">
                    <Text
                      style={[
                        type.caption,
                        { color: colors.tint, fontFamily: 'Literata_600SemiBold', fontSize: 11 },
                      ]}>
                      Ch. {wf.chapterNumber} →
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={[type.caption, { color: colors.textMuted, textAlign: 'center', paddingVertical: 12 }]}>
              No word family connections recorded for this verb.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function renderConjugationGrid(
  verb: NotebookVerbPattern,
  tense: VerbTense,
  colors: ReturnType<typeof useTheme>['colors'],
  type: ReturnType<typeof useTheme>['type'],
) {
  const data =
    tense === 'passatoProssimo'
      ? verb.passatoProssimo
      : tense === 'imperfetto'
        ? verb.imperfetto
        : tense === 'condizionale' && verb.condizionale
          ? verb.condizionale
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
    <>
      {rows.map((row) => (
        <View key={row.p} style={[styles.gridRow, { borderBottomColor: colors.divider }]}>
          <Text style={[type.caption, { color: colors.textMuted, width: 110, fontSize: 12 }]}>
            {row.p}
          </Text>
          <Text
            style={[
              type.body,
              { color: colors.text, fontFamily: 'Literata_600SemiBold', fontSize: 14, flex: 1 },
            ]}>
            {row.form}
          </Text>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupBadge: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  whyChangesBox: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    borderLeftWidth: 3,
  },
  segmentBar: {
    flexDirection: 'row',
    borderRadius: Radii.sm,
    borderWidth: 1,
    padding: 2,
    gap: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radii.sm - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenseRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  tensePill: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conjugationGrid: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    overflow: 'hidden',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
  },
  transRow: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  transHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordFamilyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xs + 4,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
});
