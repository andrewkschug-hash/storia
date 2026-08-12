function tokenizeItalian(text) {
  const tokens = [];
  const re = /[\p{L}\p{N}’']+/gu;
  let match;
  while ((match = re.exec(text)) !== null) tokens.push(match[0]);
  return tokens;
}

function fold(value) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[’']/g, "'");
}

function buildLemmaMap(lexicon) {
  const map = new Map();
  const remember = (form, lemmaId) => {
    const keys = [form.toLowerCase(), fold(form)];
    for (const key of keys) {
      if (!key) continue;
      if (!map.has(key)) map.set(key, lemmaId);
    }
  };
  for (const entry of lexicon) {
    remember(entry.lemmaId, entry.lemmaId);
    remember(entry.italian, entry.lemmaId);
    for (const inf of entry.inflections ?? []) remember(inf, entry.lemmaId);
  }
  return map;
}

function lookupLemma(map, surface) {
  const raw = surface;
  const folded = fold(surface);
  // "e" (and) vs "è" (is): folding would otherwise collapse both to essere.
  if (folded === 'e' && raw.normalize('NFD').replace(/\p{M}/gu, '') === raw) {
    return 'e';
  }
  if (map.has(raw.toLowerCase())) return map.get(raw.toLowerCase());
  if (map.has(folded)) return map.get(folded);

  const stripped = folded.replace(/^(l'|un'|d'|dell'|all'|nell'|agl'|dall')/, '');
  if (stripped !== folded && map.has(stripped)) return map.get(stripped);

  const clitic = folded.match(/^(.+?)(lo|la|li|le|mi|ti|ci|vi|gli|ne)$/);
  if (clitic && map.has(clitic[1])) return map.get(clitic[1]);

  return null;
}

function lemmasFor(map, text, sentenceId, unknown) {
  const surfaces = tokenizeItalian(text);
  const lemmas = surfaces.map((surface) => {
    const lemma = lookupLemma(map, surface);
    if (!lemma) {
      if (unknown) {
        unknown.set(fold(surface), `${sentenceId}: "${surface}" in "${text}"`);
        return 'UNKNOWN';
      }
      throw new Error(`${sentenceId}: unknown form "${surface}" in "${text}"`);
    }
    return lemma;
  });
  return lemmas;
}

module.exports = { tokenizeItalian, fold, buildLemmaMap, lookupLemma, lemmasFor };
