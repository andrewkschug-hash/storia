import type { Chapter, ContentBundle, Sentence } from '@/src/content/schemas';
import { phraseIdFromSurface } from '@/src/vocabulary/dictionaryIndex';

export type StoryExample = {
  sentenceId: string;
  text: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitleIt: string;
  tokenIndex: number | null;
};

export function findExamplesForLemma(
  bundle: ContentBundle,
  lemmaId: string,
  limit = 8,
): StoryExample[] {
  const out: StoryExample[] = [];
  for (const chapter of sortedChapters(bundle)) {
    for (const sentence of sentencesOf(chapter)) {
      const tokenIndex = sentence.tokens.findIndex((t) => t.lemmaId === lemmaId);
      if (tokenIndex < 0) continue;
      out.push(toExample(chapter, sentence, tokenIndex));
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export function findExamplesForPhrase(
  bundle: ContentBundle,
  phraseId: string,
  limit = 8,
): StoryExample[] {
  const out: StoryExample[] = [];
  for (const chapter of sortedChapters(bundle)) {
    for (const sentence of sentencesOf(chapter)) {
      const phrase = (sentence.phrases ?? []).find(
        (p) => phraseIdFromSurface(p.surface) === phraseId,
      );
      if (!phrase) continue;
      out.push(toExample(chapter, sentence, phrase.tokenStart));
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export function clozeText(sentence: Sentence, lemmaId: string): string | null {
  const token = sentence.tokens.find((t) => t.lemmaId === lemmaId);
  if (!token) return null;
  const { start, end } = token;
  if (start < 0 || end > sentence.text.length || start >= end) {
    return sentence.text.replace(token.surface, '______');
  }
  return `${sentence.text.slice(0, start)}______${sentence.text.slice(end)}`;
}

export function clozePhraseText(
  sentence: Sentence,
  phraseId: string,
): { cloze: string; surface: string } | null {
  const phrase = (sentence.phrases ?? []).find(
    (p) => phraseIdFromSurface(p.surface) === phraseId,
  );
  if (!phrase) return null;
  const surface = phrase.surface;
  const idx = sentence.text.indexOf(surface);
  if (idx < 0) return { cloze: sentence.text.replace(surface, '______'), surface };
  return {
    cloze: `${sentence.text.slice(0, idx)}______${sentence.text.slice(idx + surface.length)}`,
    surface,
  };
}

export function findSentenceById(
  bundle: ContentBundle,
  sentenceId: string | null,
  chapterId?: string | null,
): { chapter: Chapter; sentence: Sentence } | null {
  if (!sentenceId) return null;
  if (chapterId) {
    const chapter = bundle.chapters.get(chapterId);
    if (!chapter) return null;
    const sentence = sentencesOf(chapter).find((row) => row.id === sentenceId);
    return sentence ? { chapter, sentence } : null;
  }
  for (const chapter of bundle.chapters.values()) {
    for (const sentence of sentencesOf(chapter)) {
      if (sentence.id === sentenceId) return { chapter, sentence };
    }
  }
  return null;
}

function sortedChapters(bundle: ContentBundle): Chapter[] {
  return [...bundle.chapters.values()].sort((a, b) => a.number - b.number);
}

function sentencesOf(chapter: Chapter): Sentence[] {
  return chapter.paragraphs.flatMap((p) => p.sentences);
}

function toExample(chapter: Chapter, sentence: Sentence, tokenIndex: number): StoryExample {
  return {
    sentenceId: sentence.id,
    text: sentence.text,
    chapterId: chapter.id,
    chapterNumber: chapter.number,
    chapterTitleIt: chapter.titleIt,
    tokenIndex,
  };
}
