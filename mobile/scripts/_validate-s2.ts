import { readFileSync } from 'fs';
import { join } from 'path';
import { tokenizeItalian } from '../src/content/tokenize';

const text = readFileSync(join(__dirname, 'lib/pre-rome-s2.ts'), 'utf8');
const re = /s\(\s*'([^']+)'\s*,\s*'((?:\\'|[^'])*)'\s*,\s*'((?:\\'|[^'])*)'/g;

let errors = 0;
let m: RegExpExecArray | null;
while ((m = re.exec(text)) !== null) {
  const id = m[1];
  const sent = m[2].replace(/\\'/g, "'");
  const lemmas = m[3].replace(/\\'/g, "'").trim().split(/\s+/);
  const tokens = tokenizeItalian(sent).map((t) => t.surface);
  if (tokens.length !== lemmas.length) {
    console.log(`${id}: tokens ${tokens.length} != lemmas ${lemmas.length}`);
    console.log(sent);
    console.log(tokens.join(' | '));
    console.log(lemmas.join(' | '));
    console.log('');
    errors++;
  }
}
console.log('total errors', errors);
process.exit(errors ? 1 : 0);
