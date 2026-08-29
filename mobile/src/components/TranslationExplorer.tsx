import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { useAccessibility } from '@/src/accessibility/AccessibilityProvider';
import {
  MAX_TRANSLATION_INPUT_LENGTH,
  buildGoogleTranslateUrl,
} from '@/src/reader/googleTranslateUrl';
import type { ExploreTranslationPayload } from '@/src/reader/translationExplorerTypes';
import { trackReadingEvent } from '@/src/telemetry/ReadingEventStore';
import { Radii, Spacing } from '@/src/theme/tokens';

type Props = {
  visible: boolean;
  payload: ExploreTranslationPayload | null;
  onClose: () => void;
  storyId?: string;
  chapterId?: string;
};

/**
 * First-class language experimentation laboratory.
 * Enables learners to observe the original story context, modify the Italian,
 * see the difference, and launch external reference translation seamlessly.
 */
export function TranslationExplorer({
  visible,
  payload,
  onClose,
  storyId,
  chapterId,
}: Props) {
  const { colors, type, minTouchTarget, settings } = useAccessibility();
  const insets = useSafeAreaInsets();

  const originalText = payload?.text ?? '';
  const [editedText, setEditedText] = useState(originalText);

  // Sync editor with payload whenever modal opens or payload changes
  useEffect(() => {
    setEditedText(payload?.text ?? '');
  }, [payload]);

  if (!visible || !payload) return null;

  const isModified = editedText.trim() !== originalText.trim();
  const hasOriginalStoryText = originalText.trim().length > 0;
  const canLaunch = editedText.trim().length > 0;
  const isNearMaxLimit = editedText.length > 400;

  const handleResetToStory = () => {
    setEditedText(originalText);
  };

  const handleClearText = () => {
    setEditedText('');
  };

  const handleLaunchTranslation = async () => {
    if (!canLaunch) return;

    const trimmedText = editedText.trim();
    trackReadingEvent({
      type: 'translation_explorer_launched',
      storyId,
      chapterId,
      meta: {
        source: payload.source,
        inputType: payload.contextSentence ? 'story_sentence' : 'custom',
        modified: isModified,
        hasReferenceEnglish: Boolean(payload.referenceEnglish),
        textLength: trimmedText.length,
      },
    });

    const url = buildGoogleTranslateUrl(trimmedText);
    await WebBrowser.openBrowserAsync(url);
  };

  const hasContext = Boolean(
    payload.selectedText || payload.referenceEnglish || payload.contextSentence,
  );

  return (
    <Modal
      transparent
      animationType={settings.reducedMotion ? 'none' : 'fade'}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Close Translation Explorer">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}>
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

            {/* Header */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
                  🌐 Explore Italian
                </Text>
                <Text
                  style={[
                    type.caption,
                    { color: colors.textSecondary, marginTop: 2 },
                  ]}>
                  Try the language · Explore beyond the story
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={12}
                style={({ pressed }) => [
                  styles.closeBtn,
                  {
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                    minHeight: minTouchTarget,
                  },
                ]}>
                <Text style={[type.button, { color: colors.textSecondary }]}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}>
              {/* Exploration Context Card (if opened from story context) */}
              {hasContext ? (
                <View
                  style={[
                    styles.contextCard,
                    {
                      backgroundColor: colors.backgroundAtmosphereTop,
                      borderColor: colors.border,
                    },
                  ]}>
                  <Text style={[type.caption, { color: colors.tint, fontWeight: '600' }]}>
                    Exploration context
                  </Text>

                  {payload.selectedText ? (
                    <View style={styles.contextLine}>
                      <Text style={[type.caption, { color: colors.textSecondary }]}>
                        Exploring:
                      </Text>
                      <Text style={[type.caption, { color: colors.text, fontWeight: '600' }]}>
                        “{payload.selectedText}”
                      </Text>
                    </View>
                  ) : null}

                  {payload.contextSentence &&
                  payload.contextSentence !== payload.selectedText ? (
                    <View style={styles.contextLine}>
                      <Text style={[type.caption, { color: colors.textSecondary }]}>
                        In context:
                      </Text>
                      <Text
                        style={[
                          type.caption,
                          { color: colors.text, fontStyle: 'italic', flex: 1 },
                        ]}>
                        {payload.contextSentence}
                      </Text>
                    </View>
                  ) : null}

                  {payload.referenceEnglish ? (
                    <View style={[styles.contextLine, { marginTop: Spacing.xs }]}>
                      <Text style={[type.caption, { color: colors.textSecondary }]}>
                        Storia's translation:
                      </Text>
                      <Text
                        style={[
                          type.caption,
                          { color: colors.text, fontStyle: 'italic', flex: 1 },
                        ]}>
                        “{payload.referenceEnglish}”
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* Editor Header Row */}
              <View style={styles.editorLabelRow}>
                <View style={styles.labelTagRow}>
                  <Text style={[type.label, { color: colors.text, fontWeight: '600' }]}>
                    {isModified && hasOriginalStoryText ? 'Your version' : 'Italian'}
                  </Text>
                  {isModified && hasOriginalStoryText ? (
                    <View
                      style={[
                        styles.modifiedPill,
                        { backgroundColor: colors.accentSoft },
                      ]}>
                      <Text style={[type.caption, { color: colors.tint, fontSize: 11 }]}>
                        Modified
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.editorActionRow}>
                  {hasOriginalStoryText && isModified ? (
                    <Pressable
                      onPress={handleResetToStory}
                      accessibilityRole="button"
                      accessibilityLabel="Reset to story"
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.toolBtn,
                        { opacity: pressed ? 0.7 : 1 },
                      ]}>
                      <Text style={[type.caption, { color: colors.tint, fontWeight: '600' }]}>
                        ↶ Reset to story
                      </Text>
                    </Pressable>
                  ) : null}

                  {editedText.length > 0 ? (
                    <Pressable
                      onPress={handleClearText}
                      accessibilityRole="button"
                      accessibilityLabel="Clear text"
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.toolBtn,
                        { opacity: pressed ? 0.7 : 1 },
                      ]}>
                      <Text style={[type.caption, { color: colors.textMuted }]}>
                        Clear
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              {/* Italian Text Input */}
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: isModified ? colors.tint : colors.border,
                  },
                ]}>
                <TextInput
                  value={editedText}
                  onChangeText={setEditedText}
                  placeholder="Scrivi qualcosa in italiano…"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={MAX_TRANSLATION_INPUT_LENGTH}
                  autoCapitalize="sentences"
                  autoCorrect={false}
                  style={[
                    styles.textInput,
                    type.reader,
                    {
                      color: colors.text,
                    },
                  ]}
                />
                {isNearMaxLimit ? (
                  <Text
                    style={[
                      type.caption,
                      styles.charCount,
                      { color: colors.textMuted },
                    ]}>
                    {editedText.length} / {MAX_TRANSLATION_INPUT_LENGTH}
                  </Text>
                ) : null}
              </View>

              {/* Action Area & Supporting Copy */}
              <View style={styles.actionArea}>
                <Pressable
                  onPress={() => void handleLaunchTranslation()}
                  disabled={!canLaunch}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isModified ? 'See the difference' : 'Explore translation'
                  }
                  style={({ pressed }) => [
                    styles.primaryCta,
                    {
                      backgroundColor: canLaunch ? colors.tint : colors.progressTrack,
                      opacity: !canLaunch ? 0.5 : pressed ? 0.88 : 1,
                    },
                  ]}>
                  <Text
                    style={[
                      type.button,
                      { color: canLaunch ? colors.onTint : colors.textSecondary },
                    ]}>
                    {isModified ? 'See the difference →' : 'Explore translation →'}
                  </Text>
                </Pressable>

                <Text
                  style={[
                    type.caption,
                    styles.supportCopy,
                    { color: colors.textSecondary },
                  ]}>
                  {isModified
                    ? 'Explore how your changes affect the meaning.'
                    : hasOriginalStoryText
                      ? 'Curious what happens if you change it? Edit the Italian above to experiment.'
                      : 'Write or paste Italian to explore how it translates.'}
                </Text>

                <Text
                  style={[
                    type.caption,
                    styles.poweredBy,
                    { color: colors.textMuted },
                  ]}>
                  Powered by Google Translate
                </Text>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    maxWidth: 580,
    width: '100%',
    maxHeight: '90%',
    alignSelf: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radii.pill,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  scrollContent: {
    paddingBottom: Spacing.sm,
  },
  contextCard: {
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: 4,
  },
  contextLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  editorLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  labelTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  modifiedPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  editorActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toolBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  inputContainer: {
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  textInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    padding: 0,
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
    fontSize: 11,
  },
  actionArea: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  primaryCta: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    minHeight: 48,
  },
  supportCopy: {
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  poweredBy: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 2,
  },
});
