import { tokenizeItalian } from '../src/content/tokenize';
import { readFileSync } from 'fs';

const src = readFileSync('./scripts/lib/pre-rome-s3.ts', 'utf8');
const re =
  /s\('([^']+)',\s*(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)"),\s*'((?:\\'|[^'])*)'/g;
let m: RegExpExecArray | null;
const errs: string[] = [];
while ((m = re.exec(src))) {
  const id = m[1];
  const text = (m[2] ?? m[3]).replace(/\\'/g, "'").replace(/\\"/g, '"');
  const lemmas = m[4].replace(/\\'/g, "'").trim().split(/\s+/);
  const tokens = tokenizeItalian(text);
  if (tokens.length !== lemmas.length) {
    errs.push(
      `${id}: ${text}\n  tokens(${tokens.length}): ${tokens.map((t) => t.surface).join(' | ')}\n  lemmas(${lemmas.length}): ${lemmas.join(' | ')}`,
    );
  }
}
if (errs.length) {
  console.log(errs.join('\n\n'));
  process.exit(1);
}
console.log('all ok');
