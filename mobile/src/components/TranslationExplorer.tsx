import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { resolveInitialEditorText } from '@/src/reader/translationExplorerLogic';
import type {
  ExploreTranslationPayload,
  TranslationDirection,
} from '@/src/reader/translationExplorerTypes';
import {
  translateText,
  type TranslationLanguage,
} from '@/src/reader/translationService';
import { trackReadingEvent } from '@/src/telemetry/ReadingEventStore';
import { Radii, Spacing } from '@/src/theme/tokens';
import { speakItalian, stopSpeakingItalian } from '@/src/walkthrough/speakItalian';

type Props = {
  visible: boolean;
  payload: ExploreTranslationPayload | null;
  onClose: () => void;
  storyId?: string;
  chapterId?: string;
};

/**
 * First-class language experimentation laboratory.
 * Supports live in-app translation (default: English ➔ Italian with quick swap),
 * audio pronunciation, one-tap copy, and story context comparison.
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

  const [direction, setDirection] = useState<TranslationDirection>('en_to_it');
  const [editedText, setEditedText] = useState('');
  const [translatedResult, setTranslatedResult] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize/sync editor with payload when modal opens or payload changes
  useEffect(() => {
    if (visible && payload) {
      setDirection('en_to_it');
      const initial = resolveInitialEditorText(payload, 'en_to_it');
      setEditedText(initial);
      setTranslatedResult(null);
      setErrorMessage(null);
      setCopied(false);
      setIsSpeaking(false);
    }
  }, [visible, payload]);

  // Clean up speech when modal unmounts or closes
  useEffect(() => {
    if (!visible) {
      stopSpeakingItalian();
    }
  }, [visible]);

  if (!visible || !payload) return null;

  const fromLang: TranslationLanguage = direction === 'en_to_it' ? 'en' : 'it';
  const toLang: TranslationLanguage = direction === 'en_to_it' ? 'it' : 'en';

  const defaultForCurrentDirection = resolveInitialEditorText(payload, direction);
  const isModified =
    defaultForCurrentDirection.length > 0 &&
    editedText.trim() !== defaultForCurrentDirection.trim();
  const hasStoryDefault = defaultForCurrentDirection.trim().length > 0;
  const canTranslate = editedText.trim().length > 0 && !isTranslating;
  const isNearMaxLimit = editedText.length > 400;

  const handleToggleDirection = () => {
    const nextDirection: TranslationDirection =
      direction === 'en_to_it' ? 'it_to_en' : 'en_to_it';
    setDirection(nextDirection);
    setErrorMessage(null);
    setCopied(false);

    // If we already have a translation result, pre-fill it as the new input!
    if (translatedResult && translatedResult.trim().length > 0) {
      setEditedText(translatedResult.trim());
      setTranslatedResult(null);
    } else {
      setEditedText(resolveInitialEditorText(payload, nextDirection));
      setTranslatedResult(null);
    }
  };

  const handleResetToStory = () => {
    setEditedText(resolveInitialEditorText(payload, direction));
    setTranslatedResult(null);
    setErrorMessage(null);
  };

  const handleClearText = () => {
    setEditedText('');
    setTranslatedResult(null);
    setErrorMessage(null);
  };

  const handleTranslate = async () => {
    if (!canTranslate) return;

    const trimmed = editedText.trim();
    setIsTranslating(true);
    setErrorMessage(null);
    setCopied(false);

    trackReadingEvent({
      type: 'translation_explorer_launched',
      storyId,
      chapterId,
      meta: {
        source: payload.source,
        direction,
        textLength: trimmed.length,
      },
    });

    try {
      const result = await translateText({
        text: trimmed,
        from: fromLang,
        to: toLang,
      });
      setTranslatedResult(result.translatedText);
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Could not complete translation. Please check your internet connection.';
      setErrorMessage(msg);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = async (textToSpeak: string) => {
    if (!textToSpeak.trim() || isSpeaking) return;
    setIsSpeaking(true);
    try {
      await speakItalian(textToSpeak.trim());
    } catch {
      // Best-effort TTS
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleCopy = async (textToCopy: string) => {
    if (!textToCopy) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleOpenGoogleTranslate = async () => {
    const trimmed = editedText.trim();
    if (!trimmed) return;
    const url = buildGoogleTranslateUrl(trimmed, fromLang, toLang);
    await WebBrowser.openBrowserAsync(url);
  };

  const hasContext = Boolean(
    payload.selectedText || payload.referenceEnglish || payload.contextSentence,
  );

  const isItalianOutput = direction === 'en_to_it';

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
                  {direction === 'en_to_it'
                    ? 'Enter English · See instant Italian translation'
                    : 'Enter Italian · See English translation'}
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

                  {payload.contextSentence ? (
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
                    <View style={[styles.contextLine, { marginTop: 2 }]}>
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

              {/* Direction Switcher Toolbar */}
              <View
                style={[
                  styles.directionBar,
                  {
                    backgroundColor: colors.backgroundAtmosphereTop,
                    borderColor: colors.border,
                  },
                ]}>
                <Pressable
                  onPress={() => {
                    if (direction !== 'en_to_it') handleToggleDirection();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="English to Italian mode"
                  style={[
                    styles.directionPill,
                    direction === 'en_to_it'
                      ? [styles.directionPillActive, { backgroundColor: colors.tint }]
                      : null,
                  ]}>
                  <Text
                    style={[
                      type.caption,
                      styles.directionText,
                      {
                        color:
                          direction === 'en_to_it'
                            ? colors.onTint
                            : colors.textSecondary,
                        fontWeight: direction === 'en_to_it' ? '700' : '500',
                      },
                    ]}>
                    🇬🇧 English ➔ 🇮🇹 Italian
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleToggleDirection}
                  accessibilityRole="button"
                  accessibilityLabel="Swap translation direction"
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.swapBtn,
                    {
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}>
                  <Text style={[type.caption, { color: colors.tint, fontWeight: '700' }]}>
                    ⇄ Swap
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (direction !== 'it_to_en') handleToggleDirection();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Italian to English mode"
                  style={[
                    styles.directionPill,
                    direction === 'it_to_en'
                      ? [styles.directionPillActive, { backgroundColor: colors.tint }]
                      : null,
                  ]}>
                  <Text
                    style={[
                      type.caption,
                      styles.directionText,
                      {
                        color:
                          direction === 'it_to_en'
                            ? colors.onTint
                            : colors.textSecondary,
                        fontWeight: direction === 'it_to_en' ? '700' : '500',
                      },
                    ]}>
                    🇮🇹 Italian ➔ 🇬🇧 English
                  </Text>
                </Pressable>
              </View>

              {/* Editor Header Row */}
              <View style={styles.editorLabelRow}>
                <View style={styles.labelTagRow}>
                  <Text style={[type.label, { color: colors.text, fontWeight: '600' }]}>
                    {direction === 'en_to_it' ? 'English input' : 'Italian input'}
                  </Text>
                  {isModified && hasStoryDefault ? (
                    <View
                      style={[
                        styles.modifiedPill,
                        { backgroundColor: colors.accentSoft },
                      ]}>
                      <Text style={[type.caption, { color: colors.tint, fontSize: 11 }]}>
                        Customized
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.editorActionRow}>
                  {hasStoryDefault && isModified ? (
                    <Pressable
                      onPress={handleResetToStory}
                      accessibilityRole="button"
                      accessibilityLabel="Reset to original story text"
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

              {/* Text Input Container */}
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
                  onChangeText={(val) => {
                    setEditedText(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={
                    direction === 'en_to_it'
                      ? 'Type English here to translate to Italian…'
                      : 'Scrivi qualcosa in italiano…'
                  }
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

              {/* Translate Action Button */}
              <View style={styles.actionArea}>
                <Pressable
                  onPress={() => void handleTranslate()}
                  disabled={!canTranslate}
                  accessibilityRole="button"
                  accessibilityLabel="Translate text"
                  style={({ pressed }) => [
                    styles.primaryCta,
                    {
                      backgroundColor: canTranslate ? colors.tint : colors.progressTrack,
                      opacity: !canTranslate ? 0.5 : pressed ? 0.88 : 1,
                    },
                  ]}>
                  {isTranslating ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color={colors.onTint} />
                      <Text
                        style={[
                          type.button,
                          { color: colors.onTint, marginLeft: Spacing.xs },
                        ]}>
                        Translating…
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        type.button,
                        {
                          color: canTranslate ? colors.onTint : colors.textSecondary,
                          fontWeight: '700',
                        },
                      ]}>
                      Translate to {direction === 'en_to_it' ? 'Italian' : 'English'} →
                    </Text>
                  )}
                </Pressable>
              </View>

              {/* Error Banner if API fails */}
              {errorMessage ? (
                <View
                  style={[
                    styles.errorCard,
                    { backgroundColor: colors.accentSoft, borderColor: colors.border },
                  ]}>
                  <Text style={[type.caption, { color: colors.tint, flex: 1 }]}>
                    ⚠️ {errorMessage}
                  </Text>
                </View>
              ) : null}

              {/* Live In-App Translation Result Card */}
              {translatedResult ? (
                <View
                  style={[
                    styles.resultCard,
                    {
                      backgroundColor: colors.backgroundAtmosphereTop,
                      borderColor: colors.tint,
                    },
                  ]}>
                  <View style={styles.resultHeaderRow}>
                    <Text
                      style={[
                        type.caption,
                        { color: colors.tint, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
                      ]}>
                      {direction === 'en_to_it'
                        ? '🇮🇹 Italian Translation'
                        : '🇬🇧 English Translation'}
                    </Text>
                  </View>

                  <Text
                    style={[
                      type.reader,
                      styles.resultText,
                      { color: colors.text },
                    ]}>
                    {translatedResult}
                  </Text>

                  {/* Action Toolbar for Result */}
                  <View style={styles.resultActionsRow}>
                    {/* Pronunciation audio (available when output or input is Italian) */}
                    {isItalianOutput ? (
                      <Pressable
                        onPress={() => void handleSpeak(translatedResult)}
                        accessibilityRole="button"
                        accessibilityLabel="Listen to Italian pronunciation"
                        hitSlop={8}
                        style={({ pressed }) => [
                          styles.actionPill,
                          {
                            backgroundColor: colors.backgroundElevated,
                            borderColor: colors.border,
                            opacity: pressed || isSpeaking ? 0.7 : 1,
                          },
                        ]}>
                        <Text style={[type.caption, { color: colors.tint, fontWeight: '600' }]}>
                          {isSpeaking ? '🔊 Playing…' : '🔊 Listen'}
                        </Text>
                      </Pressable>
                    ) : null}

                    {/* Copy to clipboard */}
                    <Pressable
                      onPress={() => void handleCopy(translatedResult)}
                      accessibilityRole="button"
                      accessibilityLabel="Copy translated text"
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.actionPill,
                        {
                          backgroundColor: colors.backgroundElevated,
                          borderColor: colors.border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}>
                      <Text
                        style={[
                          type.caption,
                          {
                            color: copied ? colors.tint : colors.textSecondary,
                            fontWeight: '600',
                          },
                        ]}>
                        {copied ? '✓ Copied!' : '📋 Copy'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}

              {/* Secondary Google Translate External Link */}
              <View style={styles.footerRow}>
                <Pressable
                  onPress={() => void handleOpenGoogleTranslate()}
                  accessibilityRole="button"
                  accessibilityLabel="Open in Google Translate"
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.googleLinkBtn,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <Text style={[type.caption, styles.googleLinkText, { color: colors.textMuted }]}>
                    Open in Google Translate ↗
                  </Text>
                </Pressable>
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
    maxWidth: 620,
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
    marginBottom: Spacing.sm,
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
    paddingBottom: Spacing.md,
  },
  contextCard: {
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  contextLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  directionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    marginBottom: Spacing.md,
  },
  directionPill: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionPillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  directionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  swapBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 4,
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
    minHeight: 90,
    justifyContent: 'space-between',
  },
  textInput: {
    minHeight: 65,
    textAlignVertical: 'top',
    padding: 0,
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
    fontSize: 11,
  },
  actionArea: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  primaryCta: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radii.md,
    minHeight: 46,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultCard: {
    borderRadius: Radii.md,
    borderWidth: 1.5,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
  },
  resultActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footerRow: {
    marginTop: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLinkBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  googleLinkText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
