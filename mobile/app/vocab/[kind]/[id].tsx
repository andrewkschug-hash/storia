import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AtmosphereBackground } from '@/src/components/AtmosphereBackground';
import { getContentBundle } from '@/src/content';
import { getVocabularyService } from '@/src/vocabulary';
import { phraseIdFromSurface } from '@/src/vocabulary/dictionaryIndex';
import {
  findExamplesForLemma,
  findExamplesForPhrase,
  findSentenceById,
} from '@/src/vocabulary/storyExamples';
import type { LemmaEncounter, PhraseEncounter } from '@/src/vocabulary/types';
import { Radii, Spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/useTheme';

export default function VocabDetailScreen() {
  const { kind, id } = useLocalSearchParams<{ kind: string; id: string }>();
  const { colors, type } = useTheme();
  const insets = useSafeAreaInsets();
  const bundle = getContentBundle();
  const decodedId = decodeURIComponent(id ?? '');
  const [lemma, setLemma] = useState<LemmaEncounter | null>(null);
  const [phrase, setPhrase] = useState<PhraseEncounter | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const state = await getVocabularyService().getState();
      if (cancelled) return;
      if (kind === 'phrase') setPhrase(state.phrases[decodedId] ?? null);
      else setLemma(state.lemmas[decodedId] ?? null);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [kind, decodedId]);

  if (kind === 'phrase') {
    const examples = findExamplesForPhrase(bundle, decodedId, 4);
    const example = examples[0];
    const meta = phraseEnglish(bundle, decodedId);
    const chapters = chapterLabels(bundle, phrase?.chaptersEncountered ?? examples.map((e) => e.chapterId));

    return (
      <AtmosphereBackground>
        <Stack.Screen options={{ title: 'Phrase' }} />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}>
          <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
            {statusLabel(phrase?.status)}
          </Text>
          <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
            {(phrase?.surface ?? meta.surface).toUpperCase()}
          </Text>
          <Text style={[type.body, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
            {meta.naturalEn}
          </Text>
          <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.sm }]}>
            Literally: “{meta.literalEn}”
          </Text>

          {example ? (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
              ]}>
              <Text style={[type.caption, { color: colors.textMuted }]}>Example</Text>
              <Text style={[type.body, { color: colors.text, marginTop: Spacing.sm }]}>
                “{example.text}”
              </Text>
            </View>
          ) : null}

          <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xl }]}>
            Seen in
          </Text>
          {chapters.map((label) => (
            <Text key={label} style={[type.body, { color: colors.text, marginTop: 4 }]}>
              {label}
            </Text>
          ))}

          <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.lg }]}>
            Encountered: {phrase?.encounterCount ?? 0}{' '}
            {phrase?.encounterCount === 1 ? 'time' : 'times'}
          </Text>
        </ScrollView>
      </AtmosphereBackground>
    );
  }

  const entry = bundle.lexicon.find((l) => l.lemmaId === decodedId);
  const examples = findExamplesForLemma(bundle, decodedId, 4);
  const example = examples[0];
  const exampleSentence = example ? findSentenceById(bundle, example.sentenceId) : null;
  const inflected =
    exampleSentence && example?.tokenIndex != null
      ? exampleSentence.sentence.tokens[example.tokenIndex]?.surface
      : undefined;
  const surface = lemma?.savedForms[0] ?? inflected ?? entry?.italian ?? decodedId;
  const chapters = chapterLabels(bundle, lemma?.chaptersEncountered ?? examples.map((e) => e.chapterId));

  return (
    <AtmosphereBackground>
      <Stack.Screen options={{ title: 'Word' }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}>
        <Text style={[type.chapterEyebrow, { color: colors.tint }]}>
          {statusLabel(lemma?.status)}
        </Text>
        <Text style={[type.heroTitle, { color: colors.text, marginTop: Spacing.sm }]}>
          {surface.toUpperCase()}
        </Text>
        <Text style={[type.label, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
          {entry?.italian ?? decodedId}
        </Text>
        <Text style={[type.body, { color: colors.textSecondary }]}>{entry?.english}</Text>

        {example ? (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElevated, borderColor: colors.border },
            ]}>
            <Text style={[type.caption, { color: colors.textMuted }]}>Example</Text>
            <Text style={[type.body, { color: colors.text, marginTop: Spacing.sm }]}>
              “{example.text}”
            </Text>
          </View>
        ) : null}

        <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.xl }]}>
          Seen in
        </Text>
        {chapters.map((label) => (
          <Text key={label} style={[type.body, { color: colors.text, marginTop: 4 }]}>
            {label}
          </Text>
        ))}

        <Text style={[type.caption, { color: colors.textMuted, marginTop: Spacing.lg }]}>
          Encountered: {lemma?.encounterCount ?? 0} {lemma?.encounterCount === 1 ? 'time' : 'times'}
        </Text>
      </ScrollView>
    </AtmosphereBackground>
  );
}

function statusLabel(status?: string) {
  if (status === 'learning') return 'Learning';
  if (status === 'familiar') return 'Familiar';
  if (status === 'mastered') return 'Mastered';
  return 'New';
}

function chapterLabels(bundle: ReturnType<typeof getContentBundle>, ids: string[]) {
  const unique = [...new Set(ids)];
  return unique.map((id) => {
    const chapter = bundle.chapters.get(id);
    return chapter ? `Chapter ${chapter.number}` : id;
  });
}

function phraseEnglish(bundle: ReturnType<typeof getContentBundle>, phraseId: string) {
  for (const chapter of bundle.chapters.values()) {
    for (const p of chapter.paragraphs) {
      for (const s of p.sentences) {
        for (const phrase of s.phrases ?? []) {
          if (phraseIdFromSurface(phrase.surface) === phraseId) {
            return {
              surface: phrase.surface,
              naturalEn: phrase.naturalEn,
              literalEn: phrase.literalEn,
            };
          }
        }
      }
    }
  }
  return { surface: phraseId, naturalEn: '', literalEn: '' };
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  card: {
    marginTop: Spacing.xl,
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
  },
});
