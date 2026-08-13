/**
 * Chapter identity is (storyId, chapterId), not chapter number.
 * Luca a Roma Ch1 and a future pre-Rome Ch1 must never collide in progress.
 */

export type ChapterRef = {
  storyId: string;
  chapterId: string;
};

export function chapterKey(ref: ChapterRef): string {
  return `${ref.storyId}::${ref.chapterId}`;
}

export function parseChapterKey(key: string): ChapterRef | null {
  const index = key.indexOf('::');
  if (index <= 0 || index === key.length - 2) return null;
  return { storyId: key.slice(0, index), chapterId: key.slice(index + 2) };
}

export function sameChapter(a: ChapterRef, b: ChapterRef): boolean {
  return a.storyId === b.storyId && a.chapterId === b.chapterId;
}
