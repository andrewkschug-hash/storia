import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccessibility } from '@/src/accessibility/AccessibilityProvider';
import type { DictionaryLookup } from '@/src/vocabulary/types';
import { Radii, Spacing } from '@/src/theme/tokens';

type Props = {
  lookup: DictionaryLookup | null;
  saved: boolean;
  onClose: () => void;
  onSave: () => void;
  onPronounce?: () => void;
  canPronounce?: boolean;
  /** Word/phrase primary button. Defaults to Save / Saved. */
  saveLabel?: string;
  /** Sentence close button. Defaults to Continue reading. */
  closeLabel?: string;
  /** Launch Translation Explorer with current lookup context. */
  onExploreTranslation?: () => void;
};

/**
 * Compact bottom sheet for word/phrase comprehension.
 * No grammar tables, conjugations, or quizzes.
 */
export function DictionarySheet({
  lookup,
  saved,
  onClose,
  onSave,
  onPronounce,
  canPronounce,
  saveLabel,
  closeLabel,
  onExploreTranslation,
}: Props) {
  const { colors, type, minTouchTarget, settings } = useAccessibility();
  const insets = useSafeAreaInsets();

  if (!lookup) return null;

  const familiar = lookup.encounterCount >= 5;
  const isSentence = lookup.kind === 'sentence';
  const title = isSentence ? lookup.surface : lookup.surface.toUpperCase();

  return (
    <Modal transparent animationType={settings.reducedMotion ? 'none' : 'fade'} visible={!!lookup} onRequestClose={onClose}>
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

          <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
            {lookup.kind === 'phrase' ? 'Phrase' : lookup.kind === 'sentence' ? 'Sentence' : 'Word'}
          </Text>

          <View style={styles.titleRow}>
            <Text
              style={[
                isSentence ? type.chapterTitle : type.heroTitle,
                { color: colors.text, flex: 1, flexShrink: 1 },
              ]}>
              {title}
            </Text>
            {canPronounce ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Play pronunciation"
                onPress={onPronounce}
                hitSlop={8}>
                <Text style={[type.label, { color: colors.tint }]}>🔊</Text>
              </Pressable>
            ) : null}
          </View>

          {lookup.kind === 'word' ? (
            <>
              {!familiar ? (
                <Text
                  style={[
                    type.label,
                    { color: colors.textSecondary, marginTop: Spacing.xs },
                  ]}>
                  {lookup.lemmaItalian}
                </Text>
              ) : null}
              <Text
                style={[
                  familiar ? type.body : type.label,
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
                style={[type.body, { color: colors.text, marginTop: Spacing.sm }]}>
                {lookup.naturalEnglish}
              </Text>
              <Text
                style={[
                  type.caption,
                  { color: colors.textMuted, marginTop: Spacing.sm },
                ]}>
                Literally: “{lookup.literalEnglish}”
              </Text>
            </>
          ) : (
            <Text style={[type.body, { color: colors.text, marginTop: Spacing.sm }]}>
              {lookup.english}
            </Text>
          )}

          {lookup.kind !== 'sentence' ? (
            <Text
              style={[
                type.caption,
                {
                  color: colors.textMuted,
                  marginTop: Spacing.lg,
                  fontStyle: 'italic',
                },
              ]}>
              {lookup.sentenceText}
            </Text>
          ) : null}

          {onExploreTranslation ? (
            <Pressable
              onPress={onExploreTranslation}
              accessibilityRole="button"
              accessibilityLabel="Explore Italian in Translation Explorer"
              style={({ pressed }) => [
                styles.exploreBtn,
                {
                  backgroundColor: colors.backgroundHigher,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Text style={[type.label, { color: colors.tint, fontWeight: '600' }]}>
                🌐 Explore Italian →
              </Text>
            </Pressable>
          ) : null}

          <View style={styles.actions}>
            {lookup.kind !== 'sentence' ? (
              <Pressable
                onPress={onSave}
                accessibilityRole="button"
                accessibilityLabel={saveLabel ?? (saved ? 'Saved' : 'Save word')}
                style={({ pressed }) => [
                  styles.saveBtn,
                  {
                    backgroundColor: saved ? colors.progressTrack : colors.tint,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}>
                <Text
                  style={[
                    type.button,
                    { color: saved ? colors.textSecondary : colors.onTint },
                  ]}>
                  {saveLabel ?? (saved ? 'Saved' : 'Save')}
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
                  type.button,
                  {
                    color: lookup.kind === 'sentence' ? colors.onTint : colors.textSecondary,
                  },
                ]}>
                {lookup.kind === 'sentence' ? (closeLabel ?? 'Continue reading') : '✕'}
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
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
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
    minHeight: 48,
    justifyContent: 'center',
  },
  closeBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  exploreBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
