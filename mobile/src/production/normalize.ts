/**
 * Pure text normalization for production scoring.
 * Does not stem, lemmatize, or collapse meaningful Italian contrasts (non, ho/ha, standalone è/e).
 */

const APOSTROPHES = /[\u2018\u2019\u201B\u0060\u00B4]/g;
const LEADING_QUOTES = /^[\u201C\u201D\u00AB\u00BB"]+/;
const TRAILING_QUOTES = /[\u201C\u201D\u00AB\u00BB"]+$/;
const BOUNDARY_PUNCT = /[.,!?;:…]+/g;
/** c'e / dov'e → c'è / dov'è. Does not touch standalone e vs è. */
const APOSTROPHE_E = /([a-zàòùì])'e\b/g;

export type NormalizeProductionOptions = {
  /** Restore missing grave on e after an apostrophe. Default true. */
  restoreApostropheE?: boolean;
};

export function normalizeProductionText(
  input: string,
  options: NormalizeProductionOptions = {},
): string {
  const restoreApostropheE = options.restoreApostropheE !== false;
  let text = (input ?? '').normalize('NFKC');
  text = text.replace(APOSTROPHES, "'");
  text = text.trim().replace(LEADING_QUOTES, '').replace(TRAILING_QUOTES, '').trim();
  text = text.toLocaleLowerCase('it-IT');
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/^[.,!?;:…]+/, '').replace(/[.,!?;:…]+$/, '');
  text = text.replace(BOUNDARY_PUNCT, (match, offset, whole: string) => {
    if (offset === 0 || offset + match.length === whole.length) return '';
    return ' ';
  });
  text = text.replace(/\s+/g, ' ').trim();
  if (restoreApostropheE) {
    text = text.replace(APOSTROPHE_E, "$1'è");
  }
  return text;
}
