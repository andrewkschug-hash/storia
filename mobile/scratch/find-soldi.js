const fs = require('fs');
const path = require('path');
const lex = JSON.parse(fs.readFileSync(path.join(__dirname, '../content/lexicon/italian-core.json'), 'utf8'));

for (const entry of lex.lexicon) {
  if (entry.lemmaId.includes('sold') || entry.italian.includes('sold') || (entry.english && entry.english.includes('sold'))) {
    console.log(JSON.stringify(entry, null, 2));
  }
}
