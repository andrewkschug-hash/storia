const fs = require('fs');

const suspiciousLemmas = [
  'esigere', 'cellulosa', 'sidamo', 'cupping', 'percolazione',
  'granulometria', 'manometro', 'nebulizzare', 'contingente',
  'centigrado', 'matematicamente', 'inflessibile', 'inespugnabile',
  'intirizzito', 'inequivocabile', 'disallineamento', 'cromatico',
  'microfibra', 'citrico', 'serico', 'idraulico', 'resistenza idraulica'
];

for (let i = 41; i <= 65; i++) {
  const numStr = i < 10 ? `0${i}` : `${i}`;
  const filePath = `./content/stories/luca-a-roma/chapters/chapter-${numStr}.json`;
  if (fs.existsSync(filePath)) {
    const ch = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (let pIdx = 0; pIdx < ch.paragraphs.length; pIdx++) {
      const para = ch.paragraphs[pIdx];
      for (const s of para.sentences) {
        for (const lem of s.lemmas) {
          if (suspiciousLemmas.includes(lem.toLowerCase())) {
            console.log(`Ch ${i} | ${s.id} | Lemma: ${lem}`);
            console.log(`   Text: "${s.text}"\n`);
          }
        }
      }
    }
  }
}
