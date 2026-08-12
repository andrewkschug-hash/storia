/**
 * Split Italian sentence text into word tokens with character offsets.
 * Punctuation is skipped. Common elisions (l'appartamento, c'è) stay one token
 * so content authors map them to a single lemmaId (e.g. appartamento, ce).
 */
export function tokenizeItalian(text: string): { surface: string; start: number; end: number }[] {
  const tokens: { surface: string; start: number; end: number }[] = [];
  const re = /[\p{L}\p{N}’']+/gu;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    tokens.push({
      surface: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return tokens;
}

export function expandSentenceTokens(
  text: string,
  lemmas: string[],
  sentenceId: string,
  fileLabel: string,
): { surface: string; lemmaId: string; start: number; end: number }[] {
  const surfaces = tokenizeItalian(text);
  if (surfaces.length !== lemmas.length) {
    throw new ContentValidationError(
      fileLabel,
      sentenceId,
      'lemmas',
      `Token count ${surfaces.length} does not match lemmas length ${lemmas.length}. Text: "${text}"`,
    );
  }
  return surfaces.map((t, i) => ({
    surface: t.surface,
    lemmaId: lemmas[i],
    start: t.start,
    end: t.end,
  }));
}

export class ContentValidationError extends Error {
  constructor(
    public readonly file: string,
    public readonly sentenceId: string | null,
    public readonly field: string,
    public readonly problem: string,
  ) {
    super(formatContentValidationError(file, sentenceId, field, problem));
    this.name = 'ContentValidationError';
  }
}

export function formatContentValidationError(
  file: string,
  sentenceId: string | null,
  field: string,
  problem: string,
): string {
  const lines = [
    'CONTENT VALIDATION ERROR',
    '',
    file,
    '',
  ];
  if (sentenceId) {
    lines.push(`Sentence: ${sentenceId}`, '');
  }
  lines.push(`${field}:`, problem);
  return lines.join('\n');
}
