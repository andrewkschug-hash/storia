import type { Chapter } from '@/src/content/schemas';

export type ScrollTargetParams = {
  targetId: string | null | undefined;
  chapter: Chapter;
  bodyY: number;
  paragraphY: Record<string, number>;
  sentenceY: Record<string, number>;
  viewportHeight: number;
};

export function isHeaderTarget(targetId: string | null | undefined, chapter: Chapter): boolean {
  if (!targetId) return false;
  return (
    targetId === 'header' ||
    targetId.startsWith('header:') ||
    targetId === `header:${chapter.id}` ||
    targetId === `header:${chapter.number}`
  );
}

/**
 * Calculates the scroll Y offset to smoothly position the active/highlighted sentence
 * or chapter header in the user's primary reading focus zone (~25% down the viewport).
 */
export function calculateReaderScrollTarget({
  targetId,
  chapter,
  bodyY,
  paragraphY,
  sentenceY,
  viewportHeight,
}: ScrollTargetParams): number | null {
  if (!targetId) return null;

  if (isHeaderTarget(targetId, chapter)) {
    return 0;
  }

  const paragraph = chapter.paragraphs.find((p) =>
    p.sentences.some((s) => s.id === targetId),
  );
  if (!paragraph) return null;

  const pY = paragraphY[paragraph.id];
  const sY = sentenceY[targetId];
  if (pY === undefined || sY === undefined) return null;

  const absoluteSentenceY = bodyY + pY + sY;
  // Focus the sentence around the upper third (~25% from top of viewport)
  const focusOffset = Math.max(80, Math.min(180, viewportHeight > 0 ? viewportHeight * 0.25 : 150));
  return Math.max(0, Math.round(absoluteSentenceY - focusOffset));
}
