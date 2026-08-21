/**
 * Phase 10C — A2 staircase repairs (authored JSON SOT).
 * Does not touch Ch 1–24. Does not generate audio.
 *
 * Run: node mobile/scripts/phase10c-staircase.cjs
 */
const fs = require('fs');
const path = require('path');
const { buildLemmaMap, lemmasFor } = require('./a2/lemma-map');

const root = path.join(__dirname, '..');
const chaptersDir = path.join(root, 'content', 'stories', 'luca-a-roma', 'chapters');
const enPath = path.join(root, 'content', 'stories', 'luca-a-roma', 'sentence-english.json');
const speakPath = path.join(root, 'content', 'stories', 'luca-a-roma', 'speak-scenes.json');
const lexicon = JSON.parse(fs.readFileSync(path.join(root, 'content', 'lexicon', 'italian-core.json'), 'utf8'));
const lemmaMap = buildLemmaMap(lexicon.lexicon);
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function loadChapter(n) {
  const file = path.join(chaptersDir, `chapter-${String(n).padStart(2, '0')}.json`);
  return { file, ch: JSON.parse(fs.readFileSync(file, 'utf8')) };
}

function saveChapter(file, ch) {
  fs.writeFileSync(file, `${JSON.stringify(ch, null, 2)}\n`);
}

function setSentence(ch, id, patch) {
  for (const p of ch.paragraphs) {
    for (const s of p.sentences) {
      if (s.id !== id) continue;
      Object.assign(s, patch);
      if (patch.text) s.lemmas = lemmasFor(lemmaMap, patch.text, `${ch.id}:${id}`);
      return s;
    }
  }
  throw new Error(`Missing ${ch.id}:${id}`);
}

function setEn(chId, id, english) {
  en[`${chId}:${id}`] = english;
}

// --- Ch 25: present on-ramp, then PP (no imperfetto) ---
{
  const { file, ch } = loadChapter(25);
  const patches = [
    ['s01', 'Lunedì mattina Luca torna al lavoro dopo la domenica.', 'On Monday morning Luca goes back to work after Sunday.'],
    ['s02', 'Il quartiere è tranquillo e il tempo è bello.', 'The neighborhood is quiet and the weather is nice.'],
    ['s03', 'Luca conosce bene il caffè, ma oggi qualcosa è diverso.', 'Luca knows the café well, but today something is different.'],
    ['s04', 'La sala è più tranquilla del solito.', 'The room is quieter than usual.'],
    ['s05', 'Ci sono meno clienti. I tavoli sono pronti, ma sono vuoti.', 'There are fewer customers. The tables are ready, but they are empty.'],
    ['s06', 'Luca aspetta vicino alla porta. Quasi nessuno entra.', 'Luca waits near the door. Almost nobody comes in.'],
    ['s07', 'Guarda i tavoli vuoti e la strada fuori.', 'He looks at the empty tables and the street outside.'],
    ['s08', 'Luca è arrivato presto.', 'Luca arrived early.'],
    ['s09', 'Ha aperto la porta e ha preparato i tavoli con calma.', 'He opened the door and prepared the tables calmly.'],
    ['s10', 'Poi ha servito caffè e acqua al primo cliente.', 'Then he served coffee and water to the first customer.'],
    ['s11', 'Sono entrati pochi clienti.', 'A few customers came in.'],
  ];
  // Shift remaining narrative: old s11 Giulia look becomes after few clients
  // Keep s12+ mostly; fix s11 was Giulia - now s11 is sono entrati. Need restore Giulia beat.
  for (const [id, text, english] of patches) {
    setSentence(ch, id, { text, speakerId: null, kind: 'narration' });
    setEn(ch.id, id, english);
  }
  // Insert Giulia observation into flow: use s11 as clients, add Giulia as part of later
  // Current structure after patches: s11 = sono entrati. Old s10 was serve, old s11 Giulia.
  // Set s12 stays dialogue. Need Giulia look before dialogue:
  setSentence(ch, 's11', {
    text: 'Sono entrati pochi clienti. Giulia ha guardato i tavoli e non ha sorriso.',
    speakerId: null,
    kind: 'narration',
  });
  setEn(ch.id, 's11', 'A few customers came in. Giulia looked at the tables and did not smile.');
  // s10 already serves - order: arrived, opened, served, few entered+Giulia look. OK.
  // Old s09 was sono entrati - now folded. s10 is serve before few entered - tweak order:
  setSentence(ch, 's09', {
    text: 'Ha aperto la porta e ha preparato i tavoli con calma.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's10', {
    text: 'Sono entrati pochi clienti.',
    speakerId: null,
    kind: 'narration',
  });
  setEn(ch.id, 's10', 'A few customers came in.');
  setSentence(ch, 's11', {
    text: 'Luca ha servito caffè e acqua al primo cliente. Giulia ha guardato i tavoli e non ha sorriso.',
    speakerId: null,
    kind: 'narration',
  });
  setEn(
    ch.id,
    's11',
    'Luca served coffee and water to the first customer. Giulia looked at the tables and did not smile.',
  );
  saveChapter(file, ch);
  console.log('Ch25 on-ramp done');
}

// --- Ch 26: strengthen PP sequencing; no imperfetto; no se ---
{
  const { file, ch } = loadChapter(26);
  setSentence(ch, 's01', {
    text: 'Martedì mattina Luca è tornato al caffè presto.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's02', {
    text: 'Ieri il padrone ha detto di parlare questa mattina al caffè.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's04', {
    text: 'Poi Luca ha aperto la porta e ha guardato la sala.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's08', {
    text: 'Il padrone è arrivato poco dopo.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's09', {
    text: 'Poi ha chiamato Luca e Giulia vicino ai tavoli.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's10', {
    text: 'Dopo ha chiuso la porta un momento.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's21', {
    text: 'Dopo il padrone ha parlato, Giulia ha guardato Luca.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's23', {
    text: 'Nel pomeriggio Giulia ha parlato con Luca nella sala.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's27', {
    text: 'Poi ha servito i pochi clienti con calma.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's28', {
    text: 'Dopo ha pulito i tavoli e ha preparato la sala.',
    speakerId: null,
    kind: 'narration',
  });
  // Avoid se-clauses in dialogue if any — check Sofia reply
  setSentence(ch, 's40', {
    text: 'Sofia ha risposto tardi: «Capisco. Parliamo domani.»',
    speakerId: null,
    kind: 'narration',
  });
  setEn(ch.id, 's04', 'Then Luca opened the door and looked at the room.');
  setEn(ch.id, 's09', 'Then he called Luca and Giulia near the tables.');
  setEn(ch.id, 's10', 'After that he closed the door for a moment.');
  setEn(ch.id, 's21', 'After the owner spoke, Giulia looked at Luca.');
  setEn(ch.id, 's23', 'In the afternoon Giulia spoke with Luca in the room.');
  setEn(ch.id, 's27', 'Then he served the few customers calmly.');
  setEn(ch.id, 's28', 'After that he cleaned the tables and prepared the room.');
  saveChapter(file, ch);
  console.log('Ch26 sequencing pass done');
}

// --- Ch 27: imperfetto recognition (exactly 2 forms: ascoltava + era) ---
{
  const { file, ch } = loadChapter(27);
  setSentence(ch, 's08', {
    text: 'Sofia ascoltava. Non ha detto niente.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's10', {
    text: 'Poi hanno camminato un po’ nella strada. Il quartiere era tranquillo.',
    speakerId: null,
    kind: 'narration',
  });
  setEn(ch.id, 's08', 'Sofia was listening. She said nothing.');
  setEn(ch.id, 's10', 'Then they walked a little on the street. The neighborhood was quiet.');
  // Remove any other accidental imperfetto if we introduce pensava etc. — keep only these two.
  saveChapter(file, ch);
  console.log('Ch27 imperfetto densify (2 forms) done');
}

// --- Ch 28: ensure contrast ≥4; light tighten ---
{
  const { file, ch } = loadChapter(28);
  setSentence(ch, 's02', {
    text: 'C’erano pochi clienti e la sala era tranquilla.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's08', {
    text: 'Ha capito subito. Marco aveva bisogno di amici.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's10', {
    text: 'Marco cercava lavoro ogni giorno da due settimane.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's16', {
    text: 'Luca ascoltava e non ha detto niente.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's17', {
    text: 'Il problema erano i soldi e il tempo ogni giorno.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's18', {
    text: 'Marco aveva paura di non trovare un posto di lavoro.',
    speakerId: null,
    kind: 'narration',
  });
  setEn(ch.id, 's02', 'There were few customers and the room was quiet.');
  setEn(ch.id, 's08', 'She understood right away. Marco needed friends.');
  setEn(ch.id, 's10', 'Marco had been looking for work every day for two weeks.');
  setEn(ch.id, 's16', 'Luca was listening and said nothing.');
  setEn(ch.id, 's17', 'The problem was money and time every day.');
  setEn(ch.id, 's18', 'Marco was afraid of not finding a job.');
  saveChapter(file, ch);
  console.log('Ch28 contrast pass done');
}

// --- Ch 29: context — house background + events ---
{
  const { file, ch } = loadChapter(29);
  setSentence(ch, 's02', {
    text: 'La casa era piccola e calda, con cose vecchie e belle.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's08', {
    text: 'Nonna Rosa ha ascoltato con calma e senza fretta.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's09', {
    text: 'Marco guardava il tavolo e non parlava molto.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's30', {
    text: 'Luca ascoltava. Non era solo il suo problema al lavoro.',
    speakerId: null,
    kind: 'narration',
  });
  setEn(ch.id, 's02', 'The house was small and warm, with old and beautiful things.');
  setEn(ch.id, 's09', 'Marco was looking at the table and was not talking much.');
  setEn(ch.id, 's30', 'Luca was listening. It was not only his problem at work.');
  saveChapter(file, ch);
  console.log('Ch29 context pass done');
}

// --- Ch 30: established contrast already strong; light clarity ---
{
  const { file, ch } = loadChapter(30);
  setSentence(ch, 's08', {
    text: 'Il padrone era vicino alla porta della cucina e ascoltava.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's09', {
    text: 'Non sembrava contento. Sembrava stanco e poco sicuro.',
    speakerId: null,
    kind: 'narration',
  });
  setSentence(ch, 's22', {
    text: 'Non era un sì grande. Era un sì stanco, ma era un sì.',
    speakerId: null,
    kind: 'narration',
  });
  setEn(ch.id, 's08', 'The owner was near the kitchen door and was listening.');
  setEn(ch.id, 's09', 'He did not seem happy. He seemed tired and unsure.');
  setEn(ch.id, 's22', 'It was not a big yes. It was a tired yes, but it was a yes.');
  saveChapter(file, ch);
  console.log('Ch30 established contrast pass done');
}

// --- Ch 39 s45: Marta dialogue ---
{
  const { file, ch } = loadChapter(39);
  if (!ch.characterIds.includes('marta')) ch.characterIds.push('marta');
  setSentence(ch, 's45', {
    text: 'Ti chiamo domani. Ho una proposta di lavoro. Non è a Roma.',
    speakerId: 'marta',
    kind: 'dialogue',
  });
  setEn(ch.id, 's45', 'I’ll call you tomorrow. I have a job proposal. It isn’t in Rome.');
  saveChapter(file, ch);
  console.log('Ch39 s45 Marta attribution done');
}

// --- Ch 40: fill sentence ID gaps + light consolidation ---
{
  const { file, ch } = loadChapter(40);
  const gapFills = [
    [
      's07',
      'La mamma parla con voce calma. Luca ascolta ogni parola.',
      'Mom speaks in a calm voice. Luca listens to every word.',
      'marta',
      'dialogue',
    ],
    // s07 as marta continuing - actually better as narration between s06 and s08
  ];
  // Insert gap sentences into paragraphs by splicing near neighbors
  function ensureSentence(id, text, speakerId, kind, english, afterId) {
    for (const p of ch.paragraphs) {
      const idx = p.sentences.findIndex((s) => s.id === afterId);
      if (idx === -1) continue;
      if (p.sentences.some((s) => s.id === id)) {
        setSentence(ch, id, { text, speakerId, kind });
        setEn(ch.id, id, english);
        return;
      }
      p.sentences.splice(idx + 1, 0, {
        id,
        text,
        speakerId,
        kind,
        lemmas: lemmasFor(lemmaMap, text, `${ch.id}:${id}`),
      });
      setEn(ch.id, id, english);
      return;
    }
    throw new Error(`afterId ${afterId} not found for ${id}`);
  }

  ensureSentence(
    's07',
    'La proposta è chiara. Luca deve scegliere con calma.',
    null,
    'narration',
    'The proposal is clear. Luca must choose calmly.',
    's06',
  );
  ensureSentence(
    's36',
    'Gli amici sono qui. Non c’è una festa, solo una scelta.',
    null,
    'narration',
    'The friends are here. There is no party, only a choice.',
    's35',
  );
  ensureSentence(
    's39',
    'Luca resta con il gruppo. Il piano del caffè continua.',
    null,
    'narration',
    'Luca stays with the group. The café plan continues.',
    's38',
  );
  ensureSentence(
    's46',
    'Il lavoro di ogni giorno è chiaro e importante.',
    null,
    'narration',
    'Everyday work is clear and important.',
    's45',
  );
  ensureSentence(
    's50',
    'Luca guarda i tavoli e pensa: per adesso questa è casa.',
    null,
    'narration',
    'Luca looks at the tables and thinks: for now this is home.',
    's49',
  );
  saveChapter(file, ch);
  console.log('Ch40 consolidation / ID fills done');
}

// --- Speak-27 ---
{
  const speak = JSON.parse(fs.readFileSync(speakPath, 'utf8'));
  const scenes = speak.scenes;
  if (!scenes.some((s) => s.id === 'luca-a-roma-speak-27')) {
    const scene = {
      id: 'luca-a-roma-speak-27',
      storyId: 'luca-a-roma',
      batchEnd: 27,
      title: 'Sofia’s Opinion',
      summaryEn:
        'Sofia helps Luca separate fear from facts about the café, and they plan a small next step.',
      sourceRange: { start: 25, end: 27 },
      lines: [
        {
          id: 'luca-a-roma-speak-27-l01',
          en: 'The owner might sell the café, or change everything.',
          it: 'Il padrone forse vende il caffè. O cambia tutto.',
          sourceChapterId: 'luca-a-roma-27',
          sourceSentenceId: 's06',
          acceptableAnswers: [
            'Il padrone forse vende il caffè.',
            'Forse vende il caffè.',
            'Il padrone forse cambia tutto.',
          ],
        },
        {
          id: 'luca-a-roma-speak-27-l02',
          en: 'We know there are few customers. You saw it.',
          it: 'Sappiamo che i clienti sono pochi. Tu l’hai visto.',
          sourceChapterId: 'luca-a-roma-27',
          sourceSentenceId: 's17',
          acceptableAnswers: [
            'Sappiamo che i clienti sono pochi.',
            'I clienti sono pochi.',
            'Tu l’hai visto.',
          ],
        },
        {
          id: 'luca-a-roma-speak-27-l03',
          en: 'We don’t know if he is selling. He hasn’t decided.',
          it: 'Non sappiamo se vende. Non ha deciso.',
          sourceChapterId: 'luca-a-roma-27',
          sourceSentenceId: 's18',
          acceptableAnswers: [
            'Non sappiamo se vende.',
            'Non ha deciso.',
            'Non sappiamo se vende. Non ha deciso.',
          ],
        },
        {
          id: 'luca-a-roma-speak-27-l04',
          en: 'Fear isn’t a plan.',
          it: 'La paura c’è. Ma non è un piano.',
          sourceChapterId: 'luca-a-roma-27',
          sourceSentenceId: 's21',
          acceptableAnswers: [
            'La paura non è un piano.',
            'Non è un piano.',
            'La paura c’è. Ma non è un piano.',
          ],
        },
        {
          id: 'luca-a-roma-speak-27-l05',
          en: 'Let’s go to Nonna Rosa. Maybe she has an idea.',
          it: 'Andiamo da Nonna Rosa. Magari lei ha un’idea.',
          sourceChapterId: 'luca-a-roma-27',
          sourceSentenceId: 's34',
          acceptableAnswers: [
            'Andiamo da Nonna Rosa.',
            'Magari lei ha un’idea.',
            'Andiamo da Nonna Rosa. Magari lei ha un’idea.',
          ],
        },
      ],
    };
    const idx30 = scenes.findIndex((s) => s.id === 'luca-a-roma-speak-30');
    scenes.splice(idx30 === -1 ? scenes.length : idx30, 0, scene);
    fs.writeFileSync(speakPath, `${JSON.stringify(speak, null, 2)}\n`);
    console.log('Speak-27 added');
  } else {
    console.log('Speak-27 already present');
  }
}

fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`);
console.log('sentence-english updated');
console.log('Done.');
