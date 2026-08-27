const fs = require('fs');

const wordsToInspect = [
  'millimetrica', 'millimetrico', 'millimetriche', 'millimetrici',
  'concentrici', 'concentrico', 'concentriche', 'concentrica',
  'percolazione', 'percolazioni',
  'cupping',
  'granulometria', 'granulometrie',
  'manometro', 'manometri',
  'nebulizzarlo', 'nebulizzare',
  'contingente', 'contingenti',
  'centigradi', 'centigrado',
  'matematicamente',
  'geometricamente',
  'cromatiche', 'cromatico', 'cromatici', 'cromatica',
  'cellulosa',
  'inflessibile', 'inflessibili',
  'inespugnabile', 'inespugnabili',
  'intirizzite', 'intirizzito', 'intirizziti', 'intirizzita',
  'inequivocabile', 'inequivocabili',
  'pressostato', 'pressostati',
  'sottocoppa',
  'decimali', 'decimale',
  'idrorepellente', 'idrorepellenti',
  'microfibra',
  'calibrazione', 'calibrazioni',
  'disallineamenti', 'disallineamento',
  'cigno', 'oca',
  'sidamo',
  'citrica',
  'serico'
];

for (let i = 41; i <= 65; i++) {
  const numStr = i < 10 ? `0${i}` : `${i}`;
  const filePath = `./content/stories/luca-a-roma/chapters/chapter-${numStr}.json`;
  if (fs.existsSync(filePath)) {
    const ch = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (let pIdx = 0; pIdx < ch.paragraphs.length; pIdx++) {
      const para = ch.paragraphs[pIdx];
      for (const s of para.sentences) {
        for (const w of wordsToInspect) {
          const re = new RegExp(`\\b${w}\\b`, 'i');
          if (re.test(s.text)) {
            console.log(`[Ch ${i} - s:${s.id}]: word="${w}"`);
            console.log(`   Text: "${s.text}"\n`);
          }
        }
      }
    }
  }
}
