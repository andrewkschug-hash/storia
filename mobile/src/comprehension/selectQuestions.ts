import type { Chapter, ComprehensionQuestion } from '@/src/content/schemas';
import type { ReadingProgressRecord } from '@/src/progress/types';

/**
 * Orders comprehension questions for a checkpoint.
 * Story-memory questions come last and only when their source chapters are complete.
 */
export function selectComprehensionQuestions(
  chapter: Chapter,
  progress: ReadingProgressRecord | null,
): ComprehensionQuestion[] {
  const readable = new Set(progress?.completedChapterIds ?? []);
  readable.add(chapter.id);

  const regular: ComprehensionQuestion[] = [];
  const memory: ComprehensionQuestion[] = [];

  for (const question of chapter.questions) {
    if (question.type === 'story_memory') {
      memory.push(question);
    } else {
      regular.push(question);
    }
  }

  const eligibleMemory = memory.filter((question) => {
    const sources = question.sourceChapterIds ?? [];
    return sources.length > 0 && sources.every((id) => readable.has(id));
  });

  return [...regular, ...eligibleMemory];
}
