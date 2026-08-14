type TokenizedChapter = {
  paragraphs: { sentences: { tokens: unknown[] }[] }[];
};

export function countChapterTokens(chapter: TokenizedChapter): number {
  return chapter.paragraphs.reduce(
    (sum, paragraph) =>
      sum + paragraph.sentences.reduce((inner, sentence) => inner + sentence.tokens.length, 0),
    0,
  );
}
