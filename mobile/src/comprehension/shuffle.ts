/**
 * Display-time shuffle for comprehension choices.
 * Does not rewrite authored chapter JSON. correctChoice is remapped to the new order.
 */

export function shuffleQuestionChoices<T>(
  choices: readonly T[],
  correctChoice: number,
  random: () => number = Math.random,
): { choices: T[]; correctChoice: number } {
  if (choices.length === 0) return { choices: [], correctChoice: 0 };
  const indexed = choices.map((choice, index) => ({ choice, index }));
  for (let i = indexed.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = indexed[i]!;
    indexed[i] = indexed[j]!;
    indexed[j] = current;
  }
  return {
    choices: indexed.map((row) => row.choice),
    correctChoice: indexed.findIndex((row) => row.index === correctChoice),
  };
}
