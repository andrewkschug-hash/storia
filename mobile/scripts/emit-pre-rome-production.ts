/**
 * Emit pre-Rome A1 production overlays. Run: npx tsx scripts/emit-pre-rome-production.ts
 */
import { writeFileSync } from 'fs';
import { join } from 'path';

import type { ProductionExercise, ProductionExercisesFile } from '../src/content/schemas';

type Draft = Omit<ProductionExercise, 'storyId' | 'chapterId' | 'exerciseId' | 'level'> & {
  ch: number;
  n: number;
};

function emitStory(storyId: string, drafts: Draft[]): ProductionExercisesFile {
  return {
    storyId,
    version: 1,
    exercises: drafts.map((draft) => {
      const chapterId = `${storyId}-${String(draft.ch).padStart(2, '0')}`;
      const exerciseId = `${storyId}-ch${String(draft.ch).padStart(2, '0')}-prod-${String(draft.n).padStart(2, '0')}`;
      const { ch: _ch, n: _n, ...rest } = draft;
      return {
        exerciseId,
        storyId,
        chapterId,
        level: 'A1',
        ...rest,
      };
    }),
  };
}

const s01: Draft[] = [
  { ch: 1, n: 1, sourceSentenceId: 's16', promptEn: 'My name is Luca.', expectedIt: 'Mi chiamo Luca.', acceptableAnswers: ['Io mi chiamo Luca.'], match: 'flexible', focus: ['chiamarsi', 'introductions'] },
  { ch: 1, n: 2, sourceSentenceId: 's17', promptEn: 'I am Luca.', expectedIt: 'Io sono Luca.', acceptableAnswers: ['Sono Luca.'], match: 'flexible', focus: ['essere', 'introductions'] },
  { ch: 1, n: 3, sourceSentenceId: 's11', promptEn: 'Good morning.', expectedIt: 'Buongiorno.', match: 'exact', focus: ['greeting'] },
  { ch: 2, n: 1, sourceSentenceId: 's04', promptEn: 'I am 24 years old.', expectedIt: 'Ho ventiquattro anni.', acceptableAnswers: ['Io ho ventiquattro anni.'], match: 'flexible', focus: ['avere', 'age', 'numbers'] },
  { ch: 2, n: 2, sourceSentenceId: 's03', promptEn: 'How old are you?', expectedIt: 'Quanti anni hai?', match: 'exact', focus: ['age', 'questions'] },
  { ch: 2, n: 3, sourceSentenceId: 's07', promptEn: 'I am 16 years old.', expectedIt: 'Ho sedici anni.', acceptableAnswers: ['Io ho sedici anni.'], match: 'flexible', focus: ['avere', 'age', 'numbers'] },
  { ch: 3, n: 1, sourceSentenceId: 's09', promptEn: 'Marta is my mom.', expectedIt: 'Marta è la mia mamma.', match: 'flexible', focus: ['family', 'possessives'] },
  { ch: 3, n: 2, sourceSentenceId: 's12', promptEn: 'Paolo is my dad.', expectedIt: 'Paolo è il mio papà.', match: 'flexible', focus: ['family', 'possessives'] },
  { ch: 3, n: 3, sourceSentenceId: 's15', promptEn: 'Chiara is my sister.', expectedIt: 'Chiara è la mia sorella.', match: 'flexible', focus: ['family', 'possessives'] },
  { ch: 3, n: 4, sourceSentenceId: 's19', promptEn: 'Lidia is my grandmother.', expectedIt: 'Lidia è la mia nonna.', match: 'flexible', focus: ['family', 'possessives'] },
  { ch: 4, n: 1, sourceSentenceId: 's01', promptEn: 'This is my house.', expectedIt: 'Questa è casa mia.', match: 'flexible', focus: ['descriptions', 'possessives'] },
  { ch: 4, n: 2, sourceSentenceId: 's04', promptEn: 'There is a kitchen.', expectedIt: "C'è una cucina.", acceptableAnswers: ['C’è una cucina.'], match: 'flexible', focus: ['ce', 'descriptions'] },
  { ch: 4, n: 3, sourceSentenceId: 's31', promptEn: 'There are four rooms.', expectedIt: 'Ci sono quattro stanze.', match: 'flexible', focus: ['ci_sono', 'numbers'] },
  { ch: 5, n: 1, sourceSentenceId: 's08', promptEn: 'Davide is my friend.', expectedIt: 'Davide è il mio amico.', match: 'flexible', focus: ['social', 'possessives'] },
  { ch: 5, n: 2, sourceSentenceId: 's09', promptEn: 'Nice to meet you.', expectedIt: 'Piacere.', match: 'exact', focus: ['social'] },
  { ch: 5, n: 3, sourceSentenceId: 's13', promptEn: 'Davide is tall.', expectedIt: 'Davide è alto.', match: 'flexible', focus: ['essere', 'descriptions'] },
  { ch: 6, n: 1, sourceSentenceId: 's04', promptEn: 'There are five people.', expectedIt: 'Ci sono cinque persone.', match: 'flexible', focus: ['ci_sono', 'numbers'] },
  { ch: 6, n: 2, sourceSentenceId: 's06', promptEn: 'There are five of us at dinner.', expectedIt: 'Siamo cinque a cena.', match: 'flexible', focus: ['essere', 'numbers'] },
  { ch: 6, n: 3, sourceSentenceId: 's08', promptEn: 'The house number is twelve.', expectedIt: 'Il numero della casa è dodici.', match: 'flexible', focus: ['numbers'] },
];

const s02: Draft[] = [
  { ch: 1, n: 1, sourceSentenceId: 's02', promptEn: "It's seven o'clock.", expectedIt: 'Sono le sette.', match: 'flexible', focus: ['clock'] },
  { ch: 1, n: 2, sourceSentenceId: 's06', promptEn: "It's half past seven.", expectedIt: 'Sono le sette e mezzo.', match: 'flexible', focus: ['clock'] },
  { ch: 1, n: 3, sourceSentenceId: 's05', promptEn: 'What time is it?', expectedIt: 'Che ore sono?', match: 'exact', focus: ['clock', 'questions'] },
  { ch: 1, n: 4, sourceSentenceId: 's18', promptEn: 'I have to be ready.', expectedIt: 'Devo essere pronta.', match: 'flexible', focus: ['routine', 'gender'] },
  { ch: 2, n: 1, sourceSentenceId: 's03', promptEn: 'I wake up.', expectedIt: 'Mi sveglio.', acceptableAnswers: ['Io mi sveglio.'], match: 'flexible', focus: ['routine', 'reflexives'] },
  { ch: 2, n: 2, sourceSentenceId: 's13', promptEn: 'I have breakfast.', expectedIt: 'Faccio colazione.', acceptableAnswers: ['Io faccio colazione.'], match: 'flexible', focus: ['routine', 'food'] },
  { ch: 2, n: 3, sourceSentenceId: 's04', promptEn: 'I get up.', expectedIt: 'Mi alzo.', acceptableAnswers: ['Io mi alzo.', 'Luca si alza.'], match: 'flexible', focus: ['routine', 'reflexives'] },
  { ch: 3, n: 1, sourceSentenceId: 's03', promptEn: 'Today is Monday.', expectedIt: 'Oggi è lunedì.', match: 'flexible', focus: ['days'] },
  { ch: 3, n: 2, sourceSentenceId: 's07', promptEn: 'Tomorrow is Tuesday.', expectedIt: 'Domani è martedì.', match: 'flexible', focus: ['days'] },
  { ch: 3, n: 3, sourceSentenceId: 's04', promptEn: 'What day is today?', expectedIt: 'Che giorno è oggi?', match: 'exact', focus: ['days', 'questions'] },
  { ch: 4, n: 1, sourceSentenceId: 's05', promptEn: 'Today is May 12.', expectedIt: 'Oggi è il dodici maggio.', match: 'flexible', focus: ['dates'] },
  { ch: 4, n: 2, sourceSentenceId: 's22', promptEn: "It's May.", expectedIt: 'È maggio.', match: 'exact', focus: ['dates'] },
  { ch: 4, n: 3, sourceSentenceId: 's15', promptEn: 'Tomorrow is May 13.', expectedIt: 'Domani è il tredici maggio.', match: 'flexible', focus: ['dates'] },
  { ch: 5, n: 1, sourceSentenceId: 's03', promptEn: 'Chiara is at school at eight.', expectedIt: 'Lunedì alle otto Chiara è a scuola.', acceptableAnswers: ['Alle otto Chiara è a scuola.'], match: 'flexible', focus: ['schedules', 'clock'] },
  { ch: 5, n: 2, sourceSentenceId: 's04', promptEn: 'Chiara has Italian at nine.', expectedIt: 'Alle nove Chiara ha italiano.', match: 'flexible', focus: ['schedules', 'clock'] },
  { ch: 5, n: 3, sourceSentenceId: 's25', promptEn: 'What time do you have Italian?', expectedIt: 'A che ora hai italiano?', match: 'exact', focus: ['schedules', 'questions'] },
  { ch: 6, n: 1, sourceSentenceId: 's02', promptEn: "It's three o'clock.", expectedIt: 'Sono le tre.', match: 'flexible', focus: ['clock'] },
  { ch: 6, n: 2, sourceSentenceId: 's12', promptEn: 'Chiara comes home at four.', expectedIt: 'Chiara torna a casa alle quattro.', match: 'flexible', focus: ['routine', 'clock'] },
  { ch: 6, n: 3, sourceSentenceId: 's18', promptEn: "I'm well.", expectedIt: 'Sto bene.', acceptableAnswers: ['Io sto bene.'], match: 'flexible', focus: ['essere', 'social'] },
  { ch: 7, n: 1, sourceSentenceId: 's04', promptEn: 'Dinner is at eight.', expectedIt: 'La cena è alle otto.', match: 'flexible', focus: ['clock', 'routine'] },
  { ch: 7, n: 2, sourceSentenceId: 's21', promptEn: 'Tomorrow I get up at seven.', expectedIt: 'Domani mi alzo alle sette.', acceptableAnswers: ['Domani Luca si alza alle sette.', 'Mi alzo alle sette domani.'], match: 'flexible', focus: ['routine', 'reflexives', 'domani'] },
  { ch: 7, n: 3, sourceSentenceId: 's33', promptEn: 'Good night.', expectedIt: 'Buona notte.', match: 'exact', focus: ['greeting'] },
];

const s03: Draft[] = [
  { ch: 1, n: 1, sourceSentenceId: 's15', promptEn: 'A little bread.', expectedIt: "Un po' di pane.", match: 'flexible', focus: ['quantities', 'food'] },
  { ch: 1, n: 2, sourceSentenceId: 's17', promptEn: 'Sugar is on the list.', expectedIt: 'Lo zucchero è sulla lista.', match: 'flexible', focus: ['food', 'shopping'] },
  { ch: 1, n: 3, sourceSentenceId: 's13', promptEn: 'There is also sugar.', expectedIt: "C'è anche zucchero.", acceptableAnswers: ['C’è anche zucchero.'], match: 'flexible', focus: ['ce', 'food'] },
  { ch: 2, n: 1, sourceSentenceId: 's10', promptEn: 'I would like some bread, please.', expectedIt: 'Vorrei del pane per favore.', acceptableAnswers: ['Vorrei del pane.', 'Vorrei pane per favore.'], match: 'semantic', focus: ['vorrei', 'ordering'], semantic: { requiredConcepts: ['vorrei', 'pane'], conceptAliases: { vorrei: ['vorrei'], pane: ['pane'] }, requiredPerson: ['1sg'], requiredTense: 'conditional', requiredPolarity: 'affirmative' } },
  { ch: 2, n: 2, sourceSentenceId: 's20', promptEn: 'I would like some milk, please.', expectedIt: 'Vorrei del latte per favore.', acceptableAnswers: ['Vorrei del latte.'], match: 'flexible', focus: ['vorrei', 'ordering'] },
  { ch: 2, n: 3, sourceSentenceId: 's23', promptEn: 'Anything else?', expectedIt: 'Altro?', match: 'exact', focus: ['ordering'] },
  { ch: 2, n: 4, sourceSentenceId: 's24', promptEn: 'No, thank you.', expectedIt: 'No grazie.', match: 'exact', focus: ['ordering', 'social'] },
  { ch: 3, n: 1, sourceSentenceId: 's01', promptEn: 'How much does the bread cost?', expectedIt: 'Quanto costa il pane?', match: 'flexible', focus: ['quanto_costa', 'prices'] },
  { ch: 3, n: 2, sourceSentenceId: 's02', promptEn: 'The bread costs two euros.', expectedIt: 'Il pane costa due euro.', match: 'flexible', focus: ['prices', 'numbers'] },
  { ch: 3, n: 3, sourceSentenceId: 's05', promptEn: 'How much does the milk cost?', expectedIt: 'Quanto costa il latte?', match: 'flexible', focus: ['quanto_costa', 'prices'] },
  { ch: 3, n: 4, sourceSentenceId: 's16', promptEn: "It's too expensive.", expectedIt: 'È troppo caro.', match: 'flexible', focus: ['prices'] },
  { ch: 4, n: 1, sourceSentenceId: 's02', promptEn: 'One kilo of apples.', expectedIt: 'Un chilo di mele.', match: 'flexible', focus: ['quantities'] },
  { ch: 4, n: 2, sourceSentenceId: 's04', promptEn: 'One hundred grams of cheese.', expectedIt: 'Un etto di formaggio.', match: 'flexible', focus: ['quantities'] },
  { ch: 4, n: 3, sourceSentenceId: 's08', promptEn: 'A bottle of milk.', expectedIt: 'Una bottiglia di latte.', match: 'flexible', focus: ['quantities'] },
  { ch: 5, n: 1, sourceSentenceId: 's02', promptEn: 'Can I pay?', expectedIt: 'Si può pagare?', match: 'exact', focus: ['shopping'] },
  { ch: 5, n: 2, sourceSentenceId: 's05', promptEn: 'Everything costs ten euros.', expectedIt: 'Tutto costa dieci euro.', match: 'flexible', focus: ['prices', 'numbers'] },
  { ch: 5, n: 3, sourceSentenceId: 's16', promptEn: 'Is there a receipt?', expectedIt: "C'è lo scontrino?", acceptableAnswers: ['C’è lo scontrino?'], match: 'flexible', focus: ['shopping', 'ce'] },
  { ch: 6, n: 1, sourceSentenceId: 's05', promptEn: 'The sugar is missing.', expectedIt: 'Manca lo zucchero.', match: 'flexible', focus: ['shopping', 'food'] },
  { ch: 6, n: 2, sourceSentenceId: 's18', promptEn: 'I would like the sugar, please.', expectedIt: 'Vorrei lo zucchero per favore.', acceptableAnswers: ['Vorrei lo zucchero.'], match: 'flexible', focus: ['vorrei', 'food'] },
  { ch: 6, n: 3, sourceSentenceId: 's26', promptEn: 'I like apples.', expectedIt: 'Mi piacciono le mele.', acceptableAnswers: ['A Luca piacciono le mele.', 'A me piacciono le mele.'], match: 'flexible', focus: ['mi_piace'] },
];

const s04: Draft[] = [
  { ch: 1, n: 1, sourceSentenceId: 's11', promptEn: 'Where is the pharmacy?', expectedIt: "Dov'è la farmacia?", acceptableAnswers: ['Dove è la farmacia?', 'Dov’è la farmacia?'], match: 'flexible', focus: ['dove', 'places'] },
  { ch: 1, n: 2, sourceSentenceId: 's16', promptEn: 'Where is the park?', expectedIt: "Dov'è il parco?", acceptableAnswers: ['Dove è il parco?', 'Dov’è il parco?'], match: 'flexible', focus: ['dove', 'places'] },
  { ch: 1, n: 3, sourceSentenceId: 's12', promptEn: 'The pharmacy is on Via Nazionale.', expectedIt: 'La farmacia è in Via Nazionale.', match: 'flexible', focus: ['places'] },
  { ch: 2, n: 1, sourceSentenceId: 's03', promptEn: 'Go straight.', expectedIt: 'Vai dritto.', match: 'exact', focus: ['directions'] },
  { ch: 2, n: 2, sourceSentenceId: 's05', promptEn: 'Then go right.', expectedIt: 'Poi vai a destra.', acceptableAnswers: ['Vai a destra.'], match: 'flexible', focus: ['directions'] },
  { ch: 2, n: 3, sourceSentenceId: 's07', promptEn: 'The park is on the left.', expectedIt: 'Il parco è a sinistra.', match: 'flexible', focus: ['directions', 'places'] },
  { ch: 2, n: 4, sourceSentenceId: 's06', promptEn: 'The pharmacy is on the right.', expectedIt: 'La farmacia è a destra.', match: 'flexible', focus: ['directions', 'places'] },
  { ch: 3, n: 1, sourceSentenceId: 's03', promptEn: "What's the weather like today?", expectedIt: 'Che tempo fa oggi?', acceptableAnswers: ['Che tempo fa?'], match: 'flexible', focus: ['weather'] },
  { ch: 3, n: 2, sourceSentenceId: 's05', promptEn: "It's hot.", expectedIt: 'Fa caldo.', match: 'exact', focus: ['weather'] },
  { ch: 3, n: 3, sourceSentenceId: 's04', promptEn: "It's sunny.", expectedIt: "C'è il sole.", acceptableAnswers: ['C’è il sole.'], match: 'flexible', focus: ['weather', 'ce'] },
  { ch: 4, n: 1, sourceSentenceId: 's01', promptEn: "It's spring today.", expectedIt: 'Oggi è primavera.', match: 'flexible', focus: ['seasons'] },
  { ch: 4, n: 2, sourceSentenceId: 's11', promptEn: "In summer it's very hot.", expectedIt: 'In estate fa molto caldo.', match: 'flexible', focus: ['seasons', 'weather'] },
  { ch: 4, n: 3, sourceSentenceId: 's16', promptEn: "In winter it's cold.", expectedIt: 'In inverno fa freddo.', match: 'flexible', focus: ['seasons', 'weather'] },
  { ch: 5, n: 1, sourceSentenceId: 's26', promptEn: 'I take the bus.', expectedIt: "Prendo l'autobus.", acceptableAnswers: ["Io prendo l'autobus.", 'Luca prende l’autobus.', "Luca prende l'autobus."], match: 'flexible', focus: ['transport'] },
  { ch: 5, n: 2, sourceSentenceId: 's03', promptEn: 'Where is the bus?', expectedIt: "Dov'è l'autobus?", acceptableAnswers: ["Dove è l'autobus?", "Dov’è l'autobus?"], match: 'flexible', focus: ['dove', 'transport'] },
  { ch: 5, n: 3, sourceSentenceId: 's16', promptEn: 'I buy a ticket.', expectedIt: 'Compro un biglietto.', acceptableAnswers: ['Io compro un biglietto.', 'Luca compra un biglietto.'], match: 'flexible', focus: ['transport'] },
  { ch: 6, n: 1, sourceSentenceId: 's10', promptEn: 'Where is the bar?', expectedIt: "Dov'è il bar?", acceptableAnswers: ['Dove è il bar?', 'Dov’è il bar?'], match: 'flexible', focus: ['dove', 'places'] },
  { ch: 6, n: 2, sourceSentenceId: 's12', promptEn: 'Go straight and then left.', expectedIt: 'Vai dritto e poi a sinistra.', match: 'flexible', focus: ['directions'] },
  { ch: 6, n: 3, sourceSentenceId: 's20', promptEn: "It's next to the park.", expectedIt: 'Il bar è accanto al parco.', acceptableAnswers: ['È accanto al parco.', 'Il bar è vicino al parco.'], match: 'flexible', focus: ['directions', 'places'] },
  { ch: 7, n: 1, sourceSentenceId: 's04', promptEn: 'Where is the platform?', expectedIt: "Dov'è il binario?", acceptableAnswers: ['Dove è il binario?', 'Dov’è il binario?'], match: 'flexible', focus: ['dove', 'transport'] },
  { ch: 7, n: 2, sourceSentenceId: 's11', promptEn: 'The train leaves at eleven.', expectedIt: 'Il treno parte alle undici.', match: 'flexible', focus: ['transport', 'clock'] },
  { ch: 7, n: 3, sourceSentenceId: 's14', promptEn: 'Today I stay in Pietralba.', expectedIt: 'Oggi resto a Pietralba.', acceptableAnswers: ['Io resto a Pietralba oggi.', 'Oggi Luca resta a Pietralba.'], match: 'flexible', focus: ['transport'] },
];

const s05: Draft[] = [
  { ch: 1, n: 1, sourceSentenceId: 's01', promptEn: 'Today is my birthday.', expectedIt: 'Oggi è il mio compleanno.', acceptableAnswers: ['Oggi è il compleanno di Luca.'], match: 'flexible', focus: ['birthdays'] },
  { ch: 1, n: 2, sourceSentenceId: 's10', promptEn: 'Happy birthday.', expectedIt: 'Auguri.', acceptableAnswers: ['Auguri Luca.'], match: 'flexible', focus: ['birthdays', 'social'] },
  { ch: 1, n: 3, sourceSentenceId: 's06', promptEn: 'I am 24 years old.', expectedIt: 'Ho ventiquattro anni.', acceptableAnswers: ['Io ho ventiquattro anni.'], match: 'flexible', focus: ['age', 'avere'] },
  { ch: 2, n: 1, sourceSentenceId: 's05', promptEn: 'Do you want to come on Saturday?', expectedIt: 'Vieni sabato?', acceptableAnswers: ['Vuoi venire sabato?', 'Elisa vieni sabato?'], match: 'semantic', focus: ['invitations'], semantic: { requiredConcepts: ['come', 'saturday'], conceptAliases: { come: ['vieni', 'venire'], saturday: ['sabato'] }, requiredPerson: ['2sg'], requiredTense: 'present', requiredPolarity: 'affirmative' } },
  { ch: 2, n: 2, sourceSentenceId: 's06', promptEn: "Yes, I'm coming.", expectedIt: 'Sì vengo.', acceptableAnswers: ['Sì, vengo.', 'Io vengo.'], match: 'flexible', focus: ['invitations'] },
  { ch: 2, n: 3, sourceSentenceId: 's21', promptEn: 'Maybe I’m coming.', expectedIt: 'Forse vengo.', acceptableAnswers: ['Forse vengo sabato.'], match: 'flexible', focus: ['invitations'] },
  { ch: 3, n: 1, sourceSentenceId: 's29', promptEn: 'I like music.', expectedIt: 'Mi piace la musica.', acceptableAnswers: ['A me piace la musica.', 'Sì mi piace la musica.'], match: 'flexible', focus: ['mi_piace'] },
  { ch: 3, n: 2, sourceSentenceId: 's28', promptEn: 'I like the cake.', expectedIt: 'Mi piace la torta.', acceptableAnswers: ['A me piace la torta.', 'Sì mi piace la torta.'], match: 'flexible', focus: ['mi_piace', 'food'] },
  { ch: 3, n: 3, sourceSentenceId: 's30', promptEn: "I don't like the oil.", expectedIt: "Non mi piace l'olio.", acceptableAnswers: ["No non mi piace l'olio."], match: 'flexible', focus: ['mi_piace', 'polarity'] },
  { ch: 3, n: 4, sourceSentenceId: 's03', promptEn: 'What do you like?', expectedIt: 'Cosa ti piace?', match: 'exact', focus: ['mi_piace', 'questions'] },
  { ch: 4, n: 1, sourceSentenceId: 's17', promptEn: 'Two bottles of juice.', expectedIt: 'Due bottiglie di succo.', match: 'flexible', focus: ['quantities', 'food'] },
  { ch: 4, n: 2, sourceSentenceId: 's19', promptEn: 'A little fruit.', expectedIt: "Un po' di frutta.", match: 'flexible', focus: ['quantities', 'food'] },
  { ch: 4, n: 3, sourceSentenceId: 's03', promptEn: "Let's prepare the party.", expectedIt: 'Prepariamo la festa.', match: 'flexible', focus: ['birthdays'] },
  { ch: 5, n: 1, sourceSentenceId: 's16', promptEn: 'Nice to meet you.', expectedIt: 'Piacere.', match: 'exact', focus: ['social', 'introductions'] },
  { ch: 5, n: 2, sourceSentenceId: 's18', promptEn: 'My name is Elisa.', expectedIt: 'Io mi chiamo Elisa.', acceptableAnswers: ['Mi chiamo Elisa.'], match: 'flexible', focus: ['chiamarsi', 'introductions'] },
  { ch: 5, n: 3, sourceSentenceId: 's28', promptEn: 'Happy birthday, Luca.', expectedIt: 'Auguri Luca.', acceptableAnswers: ['Auguri.'], match: 'flexible', focus: ['birthdays', 'social'] },
  { ch: 6, n: 1, sourceSentenceId: 's03', promptEn: 'Tomorrow I leave.', expectedIt: 'Domani parto.', acceptableAnswers: ['Io parto domani.', 'Parto domani.'], match: 'flexible', focus: ['domani', 'transport'] },
  { ch: 6, n: 2, sourceSentenceId: 's04', promptEn: 'Tomorrow I leave for Rome.', expectedIt: 'Domani parto per Roma.', acceptableAnswers: ['Parto per Roma domani.', 'Io parto per Roma domani.'], match: 'flexible', focus: ['domani', 'transport'] },
  { ch: 6, n: 3, sourceSentenceId: 's22', promptEn: 'Goodbye.', expectedIt: 'Arrivederci.', match: 'exact', focus: ['social'] },
];

const stories: Array<[string, Draft[]]> = [
  ['luca-prima-di-roma-01', s01],
  ['luca-prima-di-roma-02', s02],
  ['luca-prima-di-roma-03', s03],
  ['luca-prima-di-roma-04', s04],
  ['luca-prima-di-roma-05', s05],
];

const root = join(__dirname, '..', 'content', 'stories');
for (const [storyId, drafts] of stories) {
  const file = emitStory(storyId, drafts);
  const out = join(root, storyId, 'production-exercises.json');
  writeFileSync(out, `${JSON.stringify(file, null, 2)}\n`);
  console.log(`${storyId}: ${file.exercises.length}`);
}
