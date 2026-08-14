import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useAccessibility } from '@/src/accessibility/AccessibilityProvider';
import type { Sentence, Token } from '@/src/content/schemas';
import { Spacing } from '@/src/theme/tokens';

type Props = {
  sentence: Sentence;
  highlighted?: boolean;
  activeTokenIndex?: number | null;
  phraseRange?: { start: number; end: number } | null;
  onPressToken?: (sentence: Sentence, token: Token, tokenIndex: number) => void;
  /** Tap beside a word, or hold the sentence, for the English translation */
  onPressSentenceBackground?: (sentence: Sentence) => void;
  hasAudio?: boolean;
  isPlaying?: boolean;
  onPlayAudio?: (sentence: Sentence) => void;
};

/**
 * Renders each token as a generous tap target.
 * Tapping a token inside a phrase resolves via VocabularyService (phrase preferred).
 */
export function ReaderSentence({
  sentence,
  highlighted,
  activeTokenIndex,
  phraseRange,
  onPressToken,
  onPressSentenceBackground,
  hasAudio,
  isPlaying,
  onPlayAudio,
}: Props) {
  const { colors, type } = useAccessibility();
  const skipSentencePress = useRef(false);
  const isDialogue = sentence.kind === 'dialogue';
  const baseStyle = isDialogue ? type.readerDialogue : type.reader;

  const openSentence = () => onPressSentenceBackground?.(sentence);
  const markNestedPress = () => {
    skipSentencePress.current = true;
  };

  const parts: ReactNode[] = [];
  let cursor = 0;

  sentence.tokens.forEach((token, index) => {
    if (token.start > cursor) {
      const gap = sentence.text.slice(cursor, token.start);
      parts.push(
        <Text key={`gap-${index}`} style={[baseStyle, { color: colors.text }]}>
          {gap}
        </Text>,
      );
    }

    const inPhrase =
      phraseRange != null && index >= phraseRange.start && index <= phraseRange.end;
    const isActive = activeTokenIndex === index || inPhrase;

    parts.push(
      <Text
        key={`tok-${index}`}
        onPress={() => {
          markNestedPress();
          onPressToken?.(sentence, token, index);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Look up ${token.surface}`}
        style={[
          baseStyle,
          {
            color: colors.text,
            backgroundColor: isActive ? colors.sentenceHighlight : 'transparent',
            borderRadius: 4,
            paddingHorizontal: 1,
          },
        ]}>
        {token.surface}
      </Text>,
    );
    cursor = token.end;
  });

  if (cursor < sentence.text.length) {
    parts.push(
      <Text key="gap-end" style={[baseStyle, { color: colors.text }]}>
        {sentence.text.slice(cursor)}
      </Text>,
    );
  }

  const audioGlyph = hasAudio ? (
    <Text
      key="audio"
      onPress={() => {
        markNestedPress();
        onPlayAudio?.(sentence);
      }}
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? 'Pause sentence audio' : 'Play sentence audio'}
      style={[
        type.caption,
        {
          color: isPlaying ? colors.tint : colors.textMuted,
          opacity: isPlaying ? 1 : 0.7,
        },
      ]}>
      {' '}
      {isPlaying ? '❚❚' : '▶'}
    </Text>
  ) : null;

  return (
    <Pressable
      onPress={() => {
        if (skipSentencePress.current) {
          skipSentencePress.current = false;
          return;
        }
        openSentence();
      }}
      onLongPress={openSentence}
      delayLongPress={350}
      accessibilityHint="Shows the English translation"
      style={[
        styles.wrap,
        highlighted && { backgroundColor: colors.sentenceHighlight },
      ]}>
      {isDialogue ? (
        <View>
          {sentence.speakerId ? (
            <Text style={[type.caption, { color: colors.tint, marginBottom: 2 }]}>
              {capitalize(sentence.speakerId)}
            </Text>
          ) : null}
          <Text style={[baseStyle, { color: colors.text }]}>
            “{parts}”{audioGlyph}
          </Text>
        </View>
      ) : (
        <Text style={[baseStyle, { color: colors.text }]}>
          {parts}
          {audioGlyph}
        </Text>
      )}
    </Pressable>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    flexShrink: 1,
  },
});
