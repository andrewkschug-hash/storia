const fs = require('fs');
const path = require('path');

function gen(storyId, varName, n) {
  const imports = [];
  const map = [];
  for (let i = 1; i <= n; i++) {
    const p = String(i).padStart(2, '0');
    imports.push(
      `import c${p} from '../../content/stories/${storyId}/chapters/chapter-${p}.json';`,
    );
    map.push(`  'chapter-${p}.json': c${p},`);
  }
  return `import manifest from '../../content/stories/${storyId}/manifest.json';
import english from '../../content/stories/${storyId}/sentence-english.json';
import characters from '../../content/stories/${storyId}/characters.json';
import locations from '../../content/stories/${storyId}/locations.json';
import lexiconAdditions from '../../content/stories/${storyId}/lexicon-additions.json';
import arcs from '../../content/stories/${storyId}/arcs.json';
${imports.join('\n')}

const chapterJsonByFile: Record<string, unknown> = {
${map.join('\n')}
};

export const ${varName} = {
  storyPath: 'stories/${storyId}',
  manifestJson: manifest,
  translationsJson: english,
  chapterJsonByFile,
  storyLocalCharactersJson: characters,
  storyLocalLocationsJson: locations,
  lexiconAdditionsJson: lexiconAdditions,
  arcsJson: arcs,
};
`;
}

const root = path.join(__dirname, '..', '..', 'src', 'content');
fs.writeFileSync(path.join(root, 'letteraElenaSources.ts'), gen('lettera-per-elena', 'LETTERA_PER_ELENA_SOURCE', 22));
fs.writeFileSync(path.join(root, 'villaggioSources.ts'), gen('il-villaggio-che-non-esiste', 'VILLAGGIO_SOURCE', 24));
console.log('wrote letteraElenaSources.ts and villaggioSources.ts');
