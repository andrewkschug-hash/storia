const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'content', 'stories', 'luca-a-roma', 'speak-scenes.json');
const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Canonical explicit mappings for each turn
const canonicalMap = {
  'luca-a-roma-speak-15-t01': {
    promptDirective: 'Ask Sofia:',
    sayEn: 'What is wrong?',
  },
  'luca-a-roma-speak-15-t02': {
    promptDirective: 'Tell Sofia:',
    sayEn: 'We can help.',
  },
  'luca-a-roma-speak-15-t03': {
    promptDirective: 'Tell Sofia:',
    sayEn: 'I want to buy the ticket.',
  },
  'luca-a-roma-speak-15-t04': {
    promptDirective: 'Agree:',
    sayEn: "Let's go together.",
  },
  'luca-a-roma-speak-20-t01': {
    promptDirective: 'Tell Marco:',
    sayEn: 'I was happy to help. How is your mom doing?',
  },
  'luca-a-roma-speak-20-t02': {
    promptDirective: 'Propose:',
    sayEn: "Let's have a coffee together first before going back.",
  },
  'luca-a-roma-speak-20-t03': {
    promptDirective: 'Tell Sofia:',
    sayEn: 'Now I have a home, a job, and friends in Rome.',
  },
  'luca-a-roma-speak-20-t04': {
    promptDirective: 'Tell Sofia:',
    sayEn: 'I am happy in Rome and this is home.',
  },
  'luca-a-roma-speak-24-t01': {
    promptDirective: 'Reassure Mom:',
    sayEn: 'I am fine and doing well in Rome.',
  },
  'luca-a-roma-speak-24-t02': {
    promptDirective: 'Tell Mom:',
    sayEn: 'I have a home and a job at the café.',
  },
  'luca-a-roma-speak-24-t03': {
    promptDirective: 'Reassure Mom:',
    sayEn: 'I am not alone and I have friends like Sofia and Giulia.',
  },
  'luca-a-roma-speak-24-t04': {
    promptDirective: 'Tell Mom:',
    sayEn: "Let's talk on Sunday. I love you, Mom.",
  },
  'luca-a-roma-speak-27-t01': {
    promptDirective: 'Explain:',
    sayEn: 'I think about rent and my job every single day.',
  },
  'luca-a-roma-speak-27-t02': {
    promptDirective: 'Admit:',
    sayEn: 'I am afraid, and fear is speaking first.',
  },
  'luca-a-roma-speak-27-t03': {
    promptDirective: 'Respond:',
    sayEn: 'We must make a plan, not just wait.',
  },
  'luca-a-roma-speak-27-t04': {
    promptDirective: 'Suggest:',
    sayEn: "Let's go to Nonna Rosa, she might have an idea.",
  },
  'luca-a-roma-speak-27-t05': {
    promptDirective: 'Agree:',
    sayEn: "Let's go together right now!",
  },
  'luca-a-roma-speak-30-t01': {
    promptDirective: 'Tell the owner:',
    sayEn: 'Sofia and I have an idea for the neighborhood.',
  },
  'luca-a-roma-speak-30-t02': {
    promptDirective: 'Reassure the owner:',
    sayEn: 'On Saturday there will be bread, coffee, and friends, and it costs very little.',
  },
  'luca-a-roma-speak-30-t03': {
    promptDirective: 'Explain:',
    sayEn: 'We will spread the word to the neighbors in the area.',
  },
  'luca-a-roma-speak-30-t04': {
    promptDirective: 'Negotiate:',
    sayEn: "All right, let's try Saturday; if it doesn't work, you can decide after.",
  },
  'luca-a-roma-speak-30-t05': {
    promptDirective: 'Say:',
    sayEn: 'If people come, we must be ready to work hard.',
  },
  'luca-a-roma-speak-35-t01': {
    promptDirective: 'Tell Sofia:',
    sayEn: 'Wait calmly, we did our work.',
  },
  'luca-a-roma-speak-35-t02': {
    promptDirective: 'Greet Nonna Rosa:',
    sayEn: 'Come in everyone!',
  },
  'luca-a-roma-speak-35-t03': {
    promptDirective: 'Propose:',
    sayEn: 'Marco stays at the door, and we prepare the coffees.',
  },
  'luca-a-roma-speak-35-t04': {
    promptDirective: 'Say:',
    sayEn: 'The neighborhood needs this café.',
  },
  'luca-a-roma-speak-35-t05': {
    promptDirective: 'Invite everyone:',
    sayEn: 'Come back not only today, but also on Monday and Thursday!',
  },
  'luca-a-roma-speak-35-t06': {
    promptDirective: 'Agree:',
    sayEn: 'Working together solves the problem.',
  },
  'luca-a-roma-speak-40-t01': {
    promptDirective: 'Negotiate:',
    sayEn: 'I accept, but I want free time on Monday and Wednesday evenings.',
  },
  'luca-a-roma-speak-40-t02': {
    promptDirective: 'Agree:',
    sayEn: 'This schedule works well for me.',
  },
  'luca-a-roma-speak-40-t03': {
    promptDirective: 'Confirm:',
    sayEn: 'You offered the proposal, but I made my decision.',
  },
  'luca-a-roma-speak-40-t04': {
    promptDirective: 'Explain:',
    sayEn: 'For now I stay in Rome with this work, this home, and these people.',
  },
  'luca-a-roma-speak-40-t05': {
    promptDirective: 'Declare:',
    sayEn: 'For now, this is home.',
  },
};

for (const scene of raw.scenes) {
  if (scene.turns) {
    for (const turn of scene.turns) {
      if (turn.learnerTurn) {
        const mapping = canonicalMap[turn.id];
        if (mapping) {
          turn.learnerTurn.promptDirective = mapping.promptDirective;
          turn.learnerTurn.sayEn = mapping.sayEn;
        }
      }
    }
  }
}

fs.writeFileSync(filePath, JSON.stringify(raw, null, 2) + '\n', 'utf8');
console.log('Successfully updated speak-scenes.json with promptDirective and sayEn!');
