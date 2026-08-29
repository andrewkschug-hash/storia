import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { getContentBundle } from '@/src/content';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';
import type { VocabBrowseItem } from '@/src/vocabulary/catalog';
import { getNarrativeAnnotation } from '@/src/vocabulary/notebookData';
import { getItemChapter } from '@/src/vocabulary/notebookSelectors';
import { getVerbPattern } from '@/src/vocabulary/notebookVerbs';
import { findExamplesForLemma, findExamplesForPhrase } from '@/src/vocabulary/storyExamples';

type Props = {
  item: VocabBrowseItem;
  bundle: ReturnType<typeof getContentBundle>;
  isSaved: boolean;
  isSpeaking: boolean;
  highestChapter?: number;
  onPlayAudio: (id: string, text: string) => void;
  onToggleSave: (kind: 'lemma' | 'phrase', id: string, currentSaved: boolean) => void;
  onNavigateChapter: (chapterNum: number) => void;
  onOpenVerbDetail?: (lemmaId: string) => void;
};

export function WordEntry({
  item,
  bundle,
  isSaved,
  isSpeaking,
  highestChapter,
  onPlayAudio,
  onToggleSave,
  onNavigateChapter,
  onOpenVerbDetail,
}: Props) {
  const { colors, minTouchTarget, type } = useTheme();

  const narrative = getNarrativeAnnotation(item.id);
  const verbPattern = useMemo(() => getVerbPattern(item.id), [item.id]);

  // Check if narrative annotation is unlocked for this learner
  const isNarrativeUnlocked =
    narrative !== null &&
    (highestChapter === undefined || narrative.storyAnchor.chapterNumber <= highestChapter);

  const storyExample = useMemo(() => {
    if (item.kind === 'phrase') {
      const phraseExamples = findExamplesForPhrase(bundle, item.id, 8);
      if (highestChapter !== undefined) {
        const reachedExample = phraseExamples.find((ex) => ex.chapterNumber <= highestChapter);
        if (reachedExample) return reachedExample;
      }
      return phraseExamples[0] ?? null;
    }
    const examples = findExamplesForLemma(bundle, item.id, 8);
    if (highestChapter !== undefined) {
      const reachedExample = examples.find((ex) => ex.chapterNumber <= highestChapter);
      if (reachedExample) return reachedExample;
    }
    return examples[0] ?? null;
  }, [bundle, item.id, item.kind, highestChapter]);

  const chapterNum = useMemo(() => {
    if (isNarrativeUnlocked && narrative) {
      return narrative.storyAnchor.chapterNumber;
    }
    if (
      storyExample &&
      (highestChapter === undefined || storyExample.chapterNumber <= highestChapter)
    ) {
      return storyExample.chapterNumber;
    }
    return getItemChapter(item, highestChapter);
  }, [isNarrativeUnlocked, narrative, storyExample, item, highestChapter]);

  const quoteIt = useMemo(() => {
    if (isNarrativeUnlocked && narrative) {
      return narrative.storyAnchor.quoteIt;
    }
    if (
      storyExample &&
      (highestChapter === undefined || storyExample.chapterNumber <= highestChapter)
    ) {
      return storyExample.text;
    }
    return null;
  }, [isNarrativeUnlocked, narrative, storyExample, highestChapter]);

  // Metadata description line
  const metaParts: string[] = [];
  if (item.partOfSpeech) {
    if (verbPattern) {
      metaParts.push(`verb · ${verbPattern.regularGroup}`);
    } else {
      metaParts.push(item.partOfSpeech);
    }
  }
  metaParts.push(item.status);

  return (
    <View style={[styles.entry, { borderBottomColor: colors.divider }]}>
      {/* TOP ROW: HEADWORD & ACTIONS */}
      <View style={styles.topRow}>
        <View style={styles.headwordCol}>
          <Text style={[type.heroTitle, styles.italianWord, { color: colors.text }]}>
            {item.italian}
          </Text>
          <Text style={[type.body, styles.englishMeaning, { color: colors.textSecondary }]}>
            {item.english}
          </Text>
          <Text style={[type.caption, styles.metaLine, { color: colors.textMuted }]}>
            {metaParts.join(' · ')}
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => onToggleSave(item.kind, item.id, isSaved)}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Unsave word' : 'Save word'}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: colors.backgroundHigher,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <Text style={{ fontSize: 14 }}>{isSaved ? '⭐' : '☆'}</Text>
          </Pressable>

          <Pressable
            onPress={() => onPlayAudio(`word:${item.id}`, item.italian)}
            accessibilityRole="button"
            accessibilityLabel={`Pronounce ${item.italian}`}
            style={({ pressed }) => [
              styles.audioBtn,
              {
                backgroundColor: isSpeaking ? colors.accentSoft : colors.backgroundHigher,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
                minHeight: Math.max(34, minTouchTarget - 10),
              },
            ]}>
            <Text style={[type.caption, { color: colors.text, fontSize: 12 }]}>
              {isSpeaking ? '🔊 Playing…' : '🔊'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* STORY CONTEXT SENTENCE */}
      {quoteIt ? (
        <View style={styles.storyContextWrapper}>
          <Text style={[type.body, styles.storyQuote, { color: colors.text }]}>
            &ldquo;{quoteIt}&rdquo;
          </Text>
        </View>
      ) : null}

      {/* FOOTER ROW: PROVENANCE LINK & VERB CONJUGATION LINK */}
      <View style={styles.footerRow}>
        <Pressable
          onPress={() => onNavigateChapter(chapterNum)}
          accessibilityRole="button"
          accessibilityLabel={`Read scene in Chapter ${chapterNum}`}
          style={styles.provenanceLink}>
          <Text style={[type.caption, styles.provenanceText, { color: colors.tint }]}>
            Luca a Roma · Chapter {chapterNum} →
          </Text>
        </Pressable>

        {verbPattern && onOpenVerbDetail ? (
          <Pressable
            onPress={() => onOpenVerbDetail(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Conjugate verb ${item.italian}`}
            style={styles.conjugateBtn}>
            <Text style={[type.caption, styles.conjugateText, { color: colors.tint }]}>
              Conjugate →
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  entry: {
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs + 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headwordCol: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  italianWord: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: 'Literata_600SemiBold',
  },
  englishMeaning: {
    fontSize: 14,
    lineHeight: 18,
    marginTop: 2,
  },
  metaLine: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyContextWrapper: {
    marginTop: 2,
    paddingLeft: Spacing.xs,
  },
  storyQuote: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Literata_400Regular_Italic',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  provenanceLink: {
    paddingVertical: 2,
  },
  provenanceText: {
    fontSize: 11,
    fontFamily: 'Literata_600SemiBold',
    letterSpacing: 0.2,
  },
  conjugateBtn: {
    paddingVertical: 2,
  },
  conjugateText: {
    fontSize: 11,
    fontFamily: 'Literata_600SemiBold',
    letterSpacing: 0.2,
  },
});
