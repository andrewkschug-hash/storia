export type ChapterCompleteView = {
  headline: string;
  detail: string;
  button: string;
};

export function chapterCompleteView(
  chapterNumber: number,
  nextChapterNumber: number | null,
): ChapterCompleteView {
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
