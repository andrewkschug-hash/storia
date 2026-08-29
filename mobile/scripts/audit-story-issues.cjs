const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const storiesDir = path.join(root, 'content', 'stories');

console.log('=== PRECISE AUDIT ACROSS ALL STORIES ===\n');

const storyFolders = fs.readdirSync(storiesDir).filter(f => fs.statSync(path.join(storiesDir, f)).isDirectory());

// 1. LEMMA AUDIT: Check every sentence in every chapter where "porta" or "parte" is used
const verbPortaIssues = [];
const verbParteIssues = [];

for (const story of storyFolders) {
  const chDir = path.join(storiesDir, story, 'chapters');
  if (!fs.existsSync(chDir)) continue;
  const files = fs.readdirSync(chDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(chDir, file);
    const chapter = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const paragraph of chapter.paragraphs || []) {
      for (const sentence of paragraph.sentences || []) {
        const text = sentence.text;
        const lemmas = sentence.lemmas || [];
        
        // Exact words
        const tokens = text.toLowerCase().replace(/[.,!?;:«»"']/g, ' ').split(/\s+/).filter(Boolean);
        
        // Check "porta"
        if (tokens.includes('porta')) {
          // If followed by direct object like "una valigia", "il pane", "i soldi", etc. OR preceded by subject pronoun/name without article
          const isVerb = /\b(luca|marco|giulia|sofia|lui|lei|chi|marta)\s+porta\b/i.test(text) ||
                         /\bporta\s+(un|una|il|la|i|le|due|tre|quattro|qualcosa|molto|tutto)\b/i.test(text);
          const isNoun = /\b(la|una|alla|dalla|nella|sulla|della|porta a vetri|porta di casa)\b/i.test(text);
          
          if (isVerb && !isNoun && lemmas.includes('porta')) {
            verbPortaIssues.push({
              file: `${story}/chapters/${file}`,
              chapterId: chapter.id,
              sentenceId: sentence.id,
              text,
              lemmas,
            });
          }
        }

        // Check "parte"
        if (tokens.includes('parte')) {
          const isVerb = /\b(il treno|il bus|il traghetto|la nave|luca|marco|giulia|il gruppo|chi|il viaggio)\s+parte\b/i.test(text) ||
                         /\bparte\s+(adesso|ora|subito|alle|da|per|con)\b/i.test(text);
          const isNoun = /\b(fa parte|prendere parte|da parte|in parte|gran parte|la maggior parte|sentirsi parte|una parte)\b/i.test(text);
          
          if (isVerb && !isNoun && lemmas.includes('parte')) {
            verbParteIssues.push({
              file: `${story}/chapters/${file}`,
              chapterId: chapter.id,
              sentenceId: sentence.id,
              text,
              lemmas,
            });
          }
        }
      }
    }
  }
}

console.log('--- VERB "PORTARE" tagged as noun "porta" ---');
console.log(JSON.stringify(verbPortaIssues, null, 2));

console.log('\n--- VERB "PARTIRE" tagged as noun "parte" ---');
console.log(JSON.stringify(verbParteIssues, null, 2));

// 2. QUESTION AUDIT: Check choices and question stems with parenthetical Italian
const questionChoiceIssues = [];
for (const story of storyFolders) {
  const chDir = path.join(storiesDir, story, 'chapters');
  if (!fs.existsSync(chDir)) continue;
  const files = fs.readdirSync(chDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const filePath = path.join(chDir, file);
    const chapter = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const q of chapter.questions || []) {
      (q.choices || []).forEach((c, idx) => {
        if (/\([a-zA-Zàèéìòùáéíóú\s']+\)/.test(c)) {
          questionChoiceIssues.push({
            file: `${story}/chapters/${file}`,
            questionId: q.id,
            choiceIndex: idx,
            choiceText: c,
          });
        }
      });
      if (/\([a-zA-Zàèéìòùáéíóú\s']+\)/.test(q.question)) {
        questionChoiceIssues.push({
          file: `${story}/chapters/${file}`,
          questionId: q.id,
          field: 'question',
          text: q.question,
        });
      }
    }
  }
}

console.log('\n--- QUESTION CHOICES / STEMS WITH PARENTHESES ---');
console.log(JSON.stringify(questionChoiceIssues, null, 2));
