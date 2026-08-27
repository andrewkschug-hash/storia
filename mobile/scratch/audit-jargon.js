const fs = require('fs');

const suspiciousPatterns = [
  /concentric/i,
  /percolaz/i,
  /millimetric/i,
  /collo d['’]oca/i,
  /cupping/i,
  /refratt/i,
  /granulometr/i,
  /idrorepell/i,
  /manometr/i,
  /sottocoppa/i,
  /pressostat/i,
  /termoreg/i,
  /centigrad/i,
  /matematicamente/i,
  /geometricamente/i,
  /calibraz/i,
  /contingent/i,
  /nebulizz/i,
  /esigere/i,
  /inespugnab/i,
  /intirizzit/i,
  /inequivocab/i,
  /cromatic/i,
  /inflessib/i,
  /decimal/i,
  /flangia/i,
  /raccordo/i,
  /tweed/i,
  /valvola di espansione/i,
  /preinfusione/i
];

const results = [];

for (let i = 1; i <= 65; i++) {
  const numStr = i < 10 ? `0${i}` : `${i}`;
  const filePath = `./content/stories/luca-a-roma/chapters/chapter-${numStr}.json`;
  if (fs.existsSync(filePath)) {
    const ch = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (let pIdx = 0; pIdx < ch.paragraphs.length; pIdx++) {
      const para = ch.paragraphs[pIdx];
      for (const s of para.sentences) {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(s.text)) {
            results.push({
              chapter: i,
              para: pIdx + 1,
              sentenceId: s.id,
              text: s.text,
              pattern: pattern.toString()
            });
          }
        }
      }
    }
  }
}

console.log(`Found ${results.length} instances of suspicious/jargon words across Chapters 1-65:`);
results.forEach((r) => {
  console.log(`[Ch ${r.chapter} P${r.para} ${r.sentenceId}] (${r.pattern})`);
  console.log(`   "${r.text}"\n`);
});
