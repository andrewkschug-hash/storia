/**
 * LEGACY A2 DRAFT — NOT PRODUCTION SOURCE OF TRUTH
 *
 * Authored JSON under content/stories/luca-a-roma/chapters/ is canonical.
 * This module holds an alternate draft (past-tense ch21 opener, different ch31–40 titles).
 * Used only as optional input to a2/build.js (--force). Do not treat as shipped content.
 *
 * See docs/PHASE-10.md
 */
const { N, D, PH, Q } = require('./story-helpers');

function ch(n, title, titleIt, locationIds, characterIds, event, paragraphs, questions) {
  return {
    id: `luca-a-roma-${String(n).padStart(2, '0')}`,
    number: n,
    title,
    titleIt,
    locationIds,
    characterIds,
    events: [event],
    paragraphs,
    questions,
  };
}

const ev = (id, summary, characterIds, locationIds, rememberedFacts) => ({
  id,
  summary,
  characterIds,
  locationIds,
  rememberedFacts,
});

const chapters = [
  ch(
    21,
    'A new routine',
    'Una nuova routine',
    ['appartamento-luca', 'strada', 'lavoro-caffe', 'quartiere'],
    ['luca', 'giulia', 'padrone'],
    ev('ev-21-routine', 'Luca’s days become a work routine at the café.', ['luca', 'giulia', 'padrone'], ['appartamento-luca', 'lavoro-caffe'], ['Luca has a daily routine', 'Giulia works with him']),
    [
      [
        N('Ieri Luca si è svegliato nella sua piccola casa a Roma.', 'Yesterday Luca woke up in his small home in Rome.'),
        N('Era mattina, ma non era stanco come i primi giorni.', 'It was morning, but he was not tired like the first days.'),
        N('Ha aperto la finestra e ha guardato la strada del quartiere.', 'He opened the window and looked at the neighborhood street.'),
        N('Roma era la stessa, e però Luca era un po’ diverso.', 'Rome was the same, and yet Luca was a little different.'),
        N('Adesso ha una casa, un lavoro e una chiave.', 'Now he has a home, a job, and a key.'),
        N('Ha preparato qualcosa da mangiare perché aveva fame.', 'He prepared something to eat because he was hungry.'),
        N('Poi ha preso la sua cosa e è uscito.', 'Then he took his things and went out.'),
      ],
      [
        N('Luca ha camminato nel quartiere che adesso conosce.', 'Luca walked in the neighborhood he now knows.'),
        N('Vede la piazza, i negozi e le persone della mattina.', 'He sees the square, the shops, and the morning people.'),
        N('Non cerca più un bar. Va al lavoro, come ogni giorno.', 'He no longer looks for a café. He goes to work, like every day.'),
        N('Mentre cammina, pensa alla settimana e al caffè.', 'While he walks, he thinks about the week and the café.'),
        N('Ogni giorno è un po’ più facile di ieri.', 'Every day is a little easier than yesterday.'),
        N('Quando arriva vicino al caffè, vede già la porta aperta.', 'When he arrives near the café, he already sees the door open.'),
      ],
      [
        N('Giulia ha aperto la porta e ha visto Luca.', 'Giulia opened the door and saw Luca.'),
        D('giulia', 'Buongiorno, Luca. Oggi sei arrivato in orario.', 'Good morning, Luca. Today you arrived on time.'),
        D('luca', 'Sì. Ieri sono arrivato tardi, ma oggi no.', 'Yes. Yesterday I arrived late, but not today.'),
        N('Giulia ha sorriso e ha preparato i tavoli con Luca.', 'Giulia smiled and prepared the tables with Luca.'),
        D('giulia', 'I clienti arrivano presto il lunedì. Dobbiamo essere pronti.', 'Customers arrive early on Monday. We must be ready.'),
        N('Luca ha ascoltato e ha cominciato a lavorare senza paura grande.', 'Luca listened and started to work without great fear.'),
      ],
      [
        N('Il padrone è arrivato dopo un’ora e ha guardato la sala.', 'The owner arrived after an hour and looked at the room.'),
        D('padrone', 'Luca, oggi servi i tavoli con Giulia. Va bene?', 'Luca, today you serve the tables with Giulia. All right?'),
        D('luca', 'Va bene. Posso farlo.', 'All right. I can do it.', [PH('Va bene', 'it goes well', 'okay / all right')]),
        N('Luca aveva un po’ di paura, ma ha detto di sì.', 'Luca was a little afraid, but he said yes.'),
        N('Ha portato caffè e acqua e ha ascoltato i clienti.', 'He brought coffee and water and listened to the customers.'),
        N('Quando un cliente ha chiesto qualcosa, Giulia ha aiutato Luca.', 'When a customer asked for something, Giulia helped Luca.'),
      ],
      [
        D('giulia', 'Vedi? Non è difficile se ascolti le persone.', 'See? It is not hard if you listen to people.'),
        D('luca', 'Hai ragione. Grazie.', 'You’re right. Thank you.', [PH('Hai ragione', 'you have reason', 'you’re right')]),
        N('Nel pomeriggio c’erano meno persone al caffè.', 'In the afternoon there were fewer people at the café.'),
        N('Luca ha lavorato a un tavolo e ha guardato fuori dalla finestra.', 'Luca worked at a table and looked out the window.'),
        N('La nuova vita è iniziata così: con lavoro, amici e giorni come questi.', 'The new life began like this: with work, friends, and days like these.'),
        N('La sera Luca è tornato a casa e ha dormito bene.', 'In the evening Luca went home and slept well.'),
      ],
    ],
    [
      Q('event', 'What is new about Luca’s days?', ['He has a work routine in Rome', 'He still lives at the station', 'He left Rome again'], 0, 'He wakes in his apartment and goes to the café.'),
      Q('character', 'Who helps Luca with the customers?', ['Giulia', 'Marco', 'Nonna Rosa'], 0, 'Giulia works with him.'),
      Q('direct', 'What does the owner ask Luca to do?', ['Serve the tables with Giulia', 'Close the café', 'Leave Rome'], 0, 'The padrone tells him to serve tables with Giulia.'),
    ],
  ),
  ...require('./story-22-30').chapters,
  ...require('./story-31-40').chapters,
];

module.exports = { chapters };
