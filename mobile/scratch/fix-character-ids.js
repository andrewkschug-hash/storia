const fs = require('fs');

// Chapter 58
const ch58 = JSON.parse(fs.readFileSync('./content/stories/luca-a-roma/chapters/chapter-58.json', 'utf8'));
ch58.characterIds = ['luca', 'padrone'];
ch58.events[0].characterIds = ['luca', 'padrone'];
for (const para of ch58.paragraphs) {
  for (const s of para.sentences) {
    if (s.speakerId === 'bruno') s.speakerId = 'padrone';
  }
}
fs.writeFileSync('./content/stories/luca-a-roma/chapters/chapter-58.json', JSON.stringify(ch58, null, 2), 'utf8');

// Chapter 59
const ch59 = JSON.parse(fs.readFileSync('./content/stories/luca-a-roma/chapters/chapter-59.json', 'utf8'));
ch59.characterIds = ['luca'];
ch59.events[0].characterIds = ['luca'];
fs.writeFileSync('./content/stories/luca-a-roma/chapters/chapter-59.json', JSON.stringify(ch59, null, 2), 'utf8');

// Chapter 60
const ch60 = JSON.parse(fs.readFileSync('./content/stories/luca-a-roma/chapters/chapter-60.json', 'utf8'));
ch60.characterIds = ['luca', 'marco'];
ch60.events[0].characterIds = ['luca', 'marco'];
for (const para of ch60.paragraphs) {
  for (const s of para.sentences) {
    if (s.speakerId === 'claudia') s.speakerId = null;
  }
}
fs.writeFileSync('./content/stories/luca-a-roma/chapters/chapter-60.json', JSON.stringify(ch60, null, 2), 'utf8');

console.log('Updated characterIds and speakerIds for Chapters 58-60');
