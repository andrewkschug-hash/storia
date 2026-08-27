const fs = require('fs');

function tokenizeItalian(text) {
  const tokens = [];
  const re = /[\p{L}\p{N}’']+/gu;
  let match;
  while ((match = re.exec(text)) !== null) {
    tokens.push({
      surface: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return tokens;
}

const corePath = 'c:/Users/aksch/Code/storia/mobile/content/lexicon/italian-core.json';
const core = JSON.parse(fs.readFileSync(corePath, 'utf8'));
const coreLemmaSet = new Set(core.lexicon.map((e) => e.lemmaId));

// Build map from all core entries + inflections
const empirical = new Map();
for (const e of core.lexicon) {
  empirical.set(e.lemmaId.toLowerCase(), e.lemmaId);
  empirical.set(e.italian.toLowerCase(), e.lemmaId);
  if (e.inflections) {
    for (const inf of e.inflections) {
      empirical.set(inf.toLowerCase(), e.lemmaId);
    }
  }
}

// Build map from chapters 1-57 existing sentence tokens and lemmas
for (let i = 1; i <= 57; i++) {
  const numStr = i < 10 ? `0${i}` : `${i}`;
  const p = `c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-${numStr}.json`;
  if (fs.existsSync(p)) {
    const ch = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const para of ch.paragraphs) {
      for (const s of para.sentences) {
        const tokens = tokenizeItalian(s.text);
        if (tokens.length === s.lemmas.length) {
          for (let k = 0; k < tokens.length; k++) {
            const surface = tokens[k].surface.toLowerCase();
            const lem = s.lemmas[k];
            if (coreLemmaSet.has(lem)) {
              empirical.set(surface, lem);
            }
          }
        }
      }
    }
  }
}

console.log('Empirical dictionary entries harvested:', empirical.size);

// Extract missing words from 58, 59, 60
function getChapterMissing(chNum) {
  const p = `c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-${chNum}.json`;
  const ch = JSON.parse(fs.readFileSync(p, 'utf8'));
  const missing = [];

  for (const para of ch.paragraphs) {
    for (const s of para.sentences) {
      const tokens = tokenizeItalian(s.text);
      for (const t of tokens) {
        const lower = t.surface.toLowerCase();
        let lem = empirical.get(lower);
        if (!lem) {
          if (lower.startsWith("l'") || lower.startsWith("l’")) lem = empirical.get(lower.slice(2));
          else if (lower.startsWith("un'") || lower.startsWith("un’")) lem = empirical.get(lower.slice(3));
          else if (lower.startsWith("d'") || lower.startsWith("d’")) lem = empirical.get(lower.slice(2));
          else if (lower.startsWith("dell'") || lower.startsWith("dell’")) lem = empirical.get(lower.slice(5));
          else if (lower.startsWith("all'") || lower.startsWith("all’")) lem = empirical.get(lower.slice(4));
          else if (lower.startsWith("dall'") || lower.startsWith("dall’")) lem = empirical.get(lower.slice(5));
          else if (lower.startsWith("nell'") || lower.startsWith("nell’")) lem = empirical.get(lower.slice(5));
          else if (lower.startsWith("sull'") || lower.startsWith("sull’")) lem = empirical.get(lower.slice(5));
        }
        if (!lem) lem = lower;
        if (!coreLemmaSet.has(lem)) {
          missing.push({ surface: t.surface, lemma: lem, sentence: s.id, ch: chNum });
        }
      }
    }
  }
  return missing;
}

const m58 = getChapterMissing(58);
const m59 = getChapterMissing(59);
const m60 = getChapterMissing(60);

console.log('Missing after harvest: Ch 58 =', m58.length, 'Ch 59 =', m59.length, 'Ch 60 =', m60.length);

const allMissing = [...m58, ...m59, ...m60];
const uniqueMissingSurfaces = [...new Set(allMissing.map((m) => m.surface.toLowerCase()))];
console.log('Unique missing surfaces across Batch A:', uniqueMissingSurfaces.length);
console.log(uniqueMissingSurfaces);
