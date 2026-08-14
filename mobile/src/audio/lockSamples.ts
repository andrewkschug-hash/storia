import { LOCK_SAMPLE_CHAPTERS } from '@/src/audio/voiceDisplay';
import { getChapterByNumber, LUCA_STORY_ID } from '@/src/content';
import { resolveSpeakerId } from '@/src/audio/logicalVoices';
import type { Sentence } from '@/src/content/schemas';

export type LockSample = {
  chapterNumber: number;
  chapterTitleIt: string;
  sentence: Sentence;
  speakerId: string;
};

function sentencesOf(chapter: { paragraphs: { sentences: Sentence[] }[] }): Sentence[] {
  return chapter.paragraphs.flatMap((paragraph) => paragraph.sentences);
}

export function lockSamplesForChapter(chapterNumber: number): LockSample[] {
  const chapter = getChapterByNumber(chapterNumber, LUCA_STORY_ID);
  if (!chapter) return [];
  const sentences = sentencesOf(chapter);
  const picked: Sentence[] = [];
  if (sentences[0]) picked.push(sentences[0]);
  const dialogue = sentences.find((s) => s.kind === 'dialogue' && s.id !== sentences[0]?.id);
  if (dialogue) picked.push(dialogue);
  const last = sentences[sentences.length - 1];
  if (last && !picked.some((s) => s.id === last.id)) picked.push(last);
  if (picked.length < 3) {
    for (const sentence of sentences) {
      if (picked.length >= 3) break;
      if (!picked.some((s) => s.id === sentence.id)) picked.push(sentence);
    }
  }
  return picked.map((sentence) => ({
    chapterNumber: chapter.number,
    chapterTitleIt: chapter.titleIt,
    sentence,
    speakerId: resolveSpeakerId(sentence.speakerId),
  }));
}

export function allLockSamples(): LockSample[] {
  return LOCK_SAMPLE_CHAPTERS.flatMap((n) => lockSamplesForChapter(n));
}
