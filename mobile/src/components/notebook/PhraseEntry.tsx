import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';
import type { NotebookPhrase } from '@/src/vocabulary/notebookData';

type Props = {
  phrase: NotebookPhrase;
  isSaved: boolean;
  isSpeaking: boolean;
  onPlayAudio: (id: string, text: string) => void;
  onToggleSave: (kind: 'lemma' | 'phrase', id: string, currentSaved: boolean) => void;
  onNavigateChapter: (chapterNum: number) => void;
};

export function PhraseEntry({
  phrase,
  isSaved,
  isSpeaking,
  onPlayAudio,
  onToggleSave,
  onNavigateChapter,
}: Props) {
  const { colors, minTouchTarget, type } = useTheme();

  return (
    <View style={[styles.entry, { borderBottomColor: colors.divider }]}>
      {/* SPEAKER & CHAPTER EYEBROW */}
      <View style={styles.topRow}>
        <Text style={[styles.speakerEyebrow, { color: colors.textMuted }]}>
          {phrase.speaker.toUpperCase()} · CHAPTER {phrase.chapterNumber}
        </Text>

        {/* ACTIONS */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => onToggleSave('phrase', phrase.id, isSaved)}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Unsave phrase' : 'Save phrase'}
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
            onPress={() => onPlayAudio(`phrase:${phrase.id}`, phrase.textIt)}
            accessibilityRole="button"
            accessibilityLabel={`Listen to: ${phrase.textIt}`}
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
              {isSpeaking ? '🔊 Playing…' : '🔊 Listen'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ITALIAN QUOTE */}
      <Text style={[type.heroTitle, styles.quoteText, { color: colors.text }]}>
        &ldquo;{phrase.textIt}&rdquo;
      </Text>

      {/* ENGLISH TRANSLATION */}
      <Text style={[type.body, styles.translationText, { color: colors.textSecondary }]}>
        {phrase.textEn}
      </Text>

      {/* OPTIONAL CULTURAL / MEMORY NOTE */}
      {phrase.whyMemorable ? (
        <Text style={[type.caption, styles.noteText, { color: colors.textMuted }]}>
          💡 {phrase.whyMemorable}
        </Text>
      ) : null}

      {/* FOOTER ACTION: READ SCENE */}
      <View style={styles.footerRow}>
        <Pressable
          onPress={() => onNavigateChapter(phrase.chapterNumber)}
          accessibilityRole="button"
          accessibilityLabel={`Read scene in Chapter ${phrase.chapterNumber}`}
          style={styles.readSceneBtn}>
          <Text style={[type.caption, styles.readSceneText, { color: colors.tint }]}>
            Read Scene →
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
    justifyContent: 'space-between',
  },
  speakerEyebrow: {
    fontSize: 11,
    fontFamily: 'Literata_600SemiBold',
    letterSpacing: 0.8,
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 25,
    fontFamily: 'Literata_500Medium_Italic',
    marginTop: 2,
  },
  translationText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 1,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    fontFamily: 'Literata_400Regular',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  readSceneBtn: {
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  readSceneText: {
    fontSize: 12,
    fontFamily: 'Literata_600SemiBold',
    letterSpacing: 0.2,
  },
});
