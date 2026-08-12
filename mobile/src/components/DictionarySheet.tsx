import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { DictionaryLookup } from '@/src/vocabulary/types';
import { Radii, Spacing, Typography } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

type Props = {
  lookup: DictionaryLookup | null;
  saved: boolean;
  onClose: () => void;
  onSave: () => void;
  onPronounce?: () => void;
  canPronounce?: boolean;
};

/**
 * Compact bottom sheet for word/phrase comprehension.
 * No grammar tables, conjugations, or quizzes.
 */
export function DictionarySheet({ lookup, saved, onClose, onSave, onPronounce, canPronounce }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!lookup) return null;

  const familiar = lookup.encounterCount >= 5;
  const isSentence = lookup.kind === 'sentence';
  const title = isSentence ? lookup.surface : lookup.surface.toUpperCase();

  return (
    <Modal transparent animationType="fade" visible={!!lookup} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close dictionary">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom, Spacing.md) + Spacing.sm,
            },
          ]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <Text style={[Typography.chapterEyebrow, { color: colors.tint }]}>
            {lookup.kind === 'phrase' ? 'Phrase' : lookup.kind === 'sentence' ? 'Sentence' : 'Word'}
          </Text>

          <View style={styles.titleRow}>
            <Text
              style={[
                isSentence ? Typography.chapterTitle : Typography.heroTitle,
                { color: colors.text, flex: 1 },
              ]}>
              {title}
            </Text>
            {canPronounce ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Play pronunciation"
                onPress={onPronounce}
                hitSlop={8}>
                <Text style={[Typography.label, { color: colors.tint }]}>🔊</Text>
              </Pressable>
            ) : null}
          </View>

          {lookup.kind === 'word' ? (
            <>
              {!familiar ? (
                <Text
                  style={[
                    Typography.label,
                    { color: colors.textSecondary, marginTop: Spacing.xs },
                  ]}>
                  {lookup.lemmaItalian}
                </Text>
              ) : null}
              <Text
                style={[
                  familiar ? Typography.body : Typography.label,
                  {
                    color: colors.text,
                    marginTop: familiar ? Spacing.sm : Spacing.xs,
                  },
                ]}>
                {lookup.english}
              </Text>
            </>
          ) : lookup.kind === 'phrase' ? (
            <>
              <Text
                style={[Typography.body, { color: colors.text, marginTop: Spacing.sm }]}>
                {lookup.naturalEnglish}
              </Text>
              <Text
                style={[
                  Typography.caption,
                  { color: colors.textMuted, marginTop: Spacing.sm },
                ]}>
                Literally: “{lookup.literalEnglish}”
              </Text>
            </>
          ) : (
            <Text style={[Typography.body, { color: colors.text, marginTop: Spacing.sm }]}>
              {lookup.english}
            </Text>
          )}

          {lookup.kind !== 'sentence' ? (
            <Text
              style={[
                Typography.caption,
                {
                  color: colors.textMuted,
                  marginTop: Spacing.lg,
                  fontStyle: 'italic',
                },
              ]}>
              {lookup.sentenceText}
            </Text>
          ) : null}

          <View style={styles.actions}>
            {lookup.kind !== 'sentence' ? (
              <Pressable
                onPress={onSave}
                accessibilityRole="button"
                accessibilityLabel={saved ? 'Saved' : 'Save word'}
                style={({ pressed }) => [
                  styles.saveBtn,
                  {
                    backgroundColor: saved ? colors.progressTrack : colors.tint,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}>
                <Text
                  style={[
                    Typography.button,
                    { color: saved ? colors.textSecondary : '#F7FAF9' },
                  ]}>
                  {saved ? 'Saved' : 'Save'}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              style={({ pressed }) => [
                lookup.kind === 'sentence' ? styles.saveBtn : styles.closeBtn,
                {
                  borderColor: colors.border,
                  backgroundColor:
                    lookup.kind === 'sentence' ? colors.tint : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Text
                style={[
                  Typography.button,
                  {
                    color: lookup.kind === 'sentence' ? '#F7FAF9' : colors.textSecondary,
                  },
                ]}>
                {lookup.kind === 'sentence' ? 'Continue reading' : '✕'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 22, 20, 0.35)',
  },
  sheet: {
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radii.pill,
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
  },
  closeBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
