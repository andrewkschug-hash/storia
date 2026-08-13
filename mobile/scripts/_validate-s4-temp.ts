import { readFileSync } from 'fs';
import { tokenizeItalian } from '../src/content/tokenize';

const src = readFileSync('./scripts/lib/pre-rome-s4.ts', 'utf8');

type Call = { id: string; text: string; lemmaLine: string };

const calls: Call[] = [];
const re =
  /s\(\s*'([^']+)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'(?:\s*,\s*'([^']+)')?\s*\)/g;

let m: RegExpExecArray | null;
while ((m = re.exec(src)) !== null) {
  calls.push({
    id: m[1],
    text: m[2].replace(/\\'/g, "'"),
    lemmaLine: m[3],
  });
}

const errs: { id: string; text: string; tokens: string[]; lemmas: string[] }[] = [];
for (const c of calls) {
  const tokens = tokenizeItalian(c.text).map((t) => t.surface);
  const lemmas = c.lemmaLine.trim().split(/\s+/);
  if (tokens.length !== lemmas.length) {
    errs.push({ id: c.id, text: c.text, tokens, lemmas });
  }
}

console.log(`checked ${calls.length} sentences`);
if (errs.length === 0) {
  console.log('All match.');
} else {
  console.log(`errors: ${errs.length}`);
  for (const e of errs) {
    console.log(`${e.id}: ${e.text}`);
    console.log(`  tokens (${e.tokens.length}): ${e.tokens.join(' | ')}`);
    console.log(`  lemmas (${e.lemmas.length}): ${e.lemmas.join(' | ')}`);
  }
  process.exit(1);
}
