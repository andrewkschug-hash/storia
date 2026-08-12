/**
 * Tiny Italian tokenizer matching src/content/tokenize.ts
 */
function tokenizeItalian(text) {
  const tokens = [];
  const re = /[\p{L}\p{N}’']+/gu;
  let match;
  while ((match = re.exec(text)) !== null) {
    tokens.push(match[0]);
  }
  return tokens;
}

function S(id, text, lemmas, opts = {}) {
  const surfaces = tokenizeItalian(text);
  if (surfaces.length !== lemmas.length) {
    throw new Error(
      `${id}: token/lemma mismatch (${surfaces.length} vs ${lemmas.length})\n` +
        `text: ${text}\n` +
        `tokens: ${surfaces.join(' | ')}\n` +
        `lemmas: ${lemmas.join(' | ')}`,
    );
  }
  return {
    id,
    text,
    speakerId: opts.speaker ?? null,
    kind: opts.kind ?? (opts.speaker ? 'dialogue' : 'narration'),
    lemmas,
    ...(opts.phrases ? { phrases: opts.phrases } : {}),
  };
}

function P(id, order, sentences) {
  return { id, order, sentences };
}

function chapter(meta, paragraphs) {
  return { ...meta, paragraphs };
}

module.exports = { S, P, chapter, tokenizeItalian };
