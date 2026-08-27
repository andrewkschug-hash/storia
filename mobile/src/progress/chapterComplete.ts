import { LUCA_STORY_ID } from '@/src/content';
import {
  batchRangeForChapter,
  grammarNoteForChapter,
  isLessonBatchEnd,
} from '@/src/content/lessonBatches';
import { getSpeakSceneForBatch } from '@/src/content/speakScenes';

export type ChapterCompleteView = {
  headline: string;
  detail: string;
  button: string;
};

function batchMilestoneDetail(
  chapterNumber: number,
  nextChapterNumber: number | null,
  storyId: string,
): string {
  const { start, end } = batchRangeForChapter(chapterNumber);
  const note = grammarNoteForChapter(chapterNumber, storyId);
  const steps = note
    ? [`a short grammar note and word recap for Chapters ${start}–${end}`]
    : [`a word recap for Chapters ${start}–${end}`];
  const scene = getSpeakSceneForBatch(storyId, chapterNumber);
  if (scene) {
    steps.push(`retell "${scene.title}"`);
  }
  if (storyId === LUCA_STORY_ID && chapterNumber === 20) {
    steps.push('choose what to read next');
  }
  const tail = nextChapterNumber ? `Chapter ${nextChapterNumber}` : 'home';
  return `Next: ${steps.join(', ')}, then ${tail}.`;
}

function chapter24CompleteDetail(storyId: string): string {
  const scene = getSpeakSceneForBatch(storyId, 24);
  const speakPart = scene ? `, retell "${scene.title}"` : '';
  return `Next: choose what to read next${speakPart}, then Chapter 25.`;
}

export function chapterCompleteView(
  chapterNumber: number,
  nextChapterNumber: number | null,
  storyId = LUCA_STORY_ID,
): ChapterCompleteView {
  if (storyId === LUCA_STORY_ID && chapterNumber === 70) {
    return {
      headline: '✦ Percorso B1+ completato!',
      detail: 'Hai completato tutti i 70 capitoli di Luca a Roma (40.000+ parole) e costruito una solida esperienza di lettura a livello B1+. Prosegui per l’ultima revisione e apri il tuo quaderno.',
      button: 'Completa il percorso',
    };
  }
  if (storyId === LUCA_STORY_ID && chapterNumber === 24) {
    return {
      headline: 'Chapter 24 completed!',
      detail: chapter24CompleteDetail(storyId),
      button: 'Continue',
    };
  }
  if (isLessonBatchEnd(chapterNumber)) {
    return {
      headline: `Chapter ${chapterNumber} completed!`,
      detail: batchMilestoneDetail(chapterNumber, nextChapterNumber, storyId),
      button: 'Continue',
    };
  }
  if (nextChapterNumber == null) {
    return {
      headline: `Chapter ${chapterNumber} completed!`,
      detail: 'You’ve finished this story.',
      button: 'Back to home',
    };
  }
  return {
    headline: `Chapter ${chapterNumber} completed!`,
    detail: `Continue to Chapter ${nextChapterNumber}.`,
    button: `Continue to Chapter ${nextChapterNumber}`,
  };
}

/** Label for comprehension results when production exercises are not next. */
export function comprehensionResultsContinueLabel(
  chapterNumber: number,
  nextChapterNumber: number | null,
  hasProduction: boolean,
  storyId = LUCA_STORY_ID,
): string {
  if (hasProduction) return 'Continue';
  if (nextChapterNumber == null) return 'Back to home';
  if (storyId === LUCA_STORY_ID && chapterNumber === 24) return 'Continue';
  if (isLessonBatchEnd(chapterNumber)) {
    return 'Continue';
  }
  return 'Continue story';
}
