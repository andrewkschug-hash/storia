/** Chapters are grouped into batches of five for grammar notes and recap. */

export const LESSON_BATCH_SIZE = 5;

export type LessonBatchRange = {
  start: number;
  end: number;
};

export function isLessonBatchEnd(chapterNumber: number): boolean {
  return chapterNumber > 0 && chapterNumber % LESSON_BATCH_SIZE === 0;
}

export function batchRangeForChapter(chapterNumber: number): LessonBatchRange {
  const end = chapterNumber;
  const start = Math.max(1, end - LESSON_BATCH_SIZE + 1);
  return { start, end };
}

export type GrammarNote = {
  batchKey: string;
  title: string;
  intro: string;
  points: { heading: string; body: string; examples: string[] }[];
};

const GRAMMAR_BY_BATCH: Record<string, GrammarNote> = {
  '1-5': {
    batchKey: '1-5',
    title: 'Being and having',
    intro:
      'In the first five chapters you kept seeing two small verbs do most of the work: essere (to be) and avere (to have).',
    points: [
      {
        heading: 'Essere — who / where / how someone is',
        body: 'Luca è stanco. Sofia è al bar. Italian often drops “I” because the verb ending already shows the person.',
        examples: ['Luca è a Roma.', 'Sono stanco.', 'È mattina.'],
      },
      {
        heading: 'Avere — what someone has or feels',
        body: 'Ho fame means “I am hungry” literally “I have hunger.” The pattern is very common in Italian.',
        examples: ['Ho fame.', 'Luca ha una casa.', 'Non ho molti soldi.'],
      },
    ],
  },
  '6-10': {
    batchKey: '6-10',
    title: 'Wanting and looking',
    intro:
      'These chapters added volere (to want) and cercare (to look for) — the verbs behind Luca’s plans in Rome.',
    points: [
      {
        heading: 'Volere + infinitive',
        body: 'To say what you want to do, use voglio / vuole + another verb in the infinitive form (-are, -ere, -ire).',
        examples: ['Voglio mangiare.', 'Luca vuole un lavoro.', 'Vuole restare a Roma.'],
      },
      {
        heading: 'Cercare — looking for something',
        body: 'Cerco un lavoro is a straight present-tense sentence. Word order stays flexible: Cerco un lavoro al caffè.',
        examples: ['Luca cerca un lavoro.', 'Cerchi un lavoro?', 'Scusa, cerco un lavoro.'],
      },
    ],
  },
  '11-15': {
    batchKey: '11-15',
    title: 'People and places',
    intro:
      'You met more dialogue and prepositions like a, in, con, per — small words that glue sentences together.',
    points: [
      {
        heading: 'Prepositions with cities and places',
        body: 'Use a for cities (a Roma) and in for being inside a place (in cucina, nel caffè).',
        examples: ['Luca va al caffè.', 'Sono in casa.', 'Marco è a Roma.'],
      },
      {
        heading: 'Con and per',
        body: 'Con means with someone; per often means for (a purpose or recipient).',
        examples: ['Luca è con Sofia.', 'Soldi per l’affitto.', 'Grazie per l’aiuto.'],
      },
    ],
  },
  '16-20': {
    batchKey: '16-20',
    title: 'Everyday rhythm',
    intro:
      'Time words (oggi, domani, ieri) and routine verbs tied the story to daily life — without any tense tables.',
    points: [
      {
        heading: 'Time words at the start',
        body: 'Italian often opens with when something happens: Oggi Luca cerca lavoro. Domani parte.',
        examples: ['Oggi è lunedì.', 'Domani Luca lavora.', 'Ieri Sofia dice…'],
      },
      {
        heading: 'Andare / venire / tornare',
        body: 'Movement verbs repeat constantly: andare (go), venire (come), tornare (return).',
        examples: ['Luca va al bar.', 'Sofia viene domani.', 'Luca torna a casa.'],
      },
    ],
  },
};

export function grammarNoteForBatch(start: number, end: number): GrammarNote | null {
  return (
    GRAMMAR_BY_BATCH[`${start}-${end}`] ?? {
      batchKey: `${start}-${end}`,
      title: 'Patterns from the story',
      intro: `In chapters ${start}–${end} you kept meeting the same kinds of sentences — here is a light label for what you already noticed.`,
      points: [
        {
          heading: 'Small words carry a lot',
          body: 'Articles, prepositions, and verb endings repeat constantly. You do not need to memorize tables — recognition in context is the goal.',
          examples: ['Luca va al caffè.', 'Sono a Roma.', 'Ho bisogno di soldi.'],
        },
      ],
    }
  );
}

export function grammarNoteForChapter(chapterNumber: number): GrammarNote | null {
  if (!isLessonBatchEnd(chapterNumber)) return null;
  const { start, end } = batchRangeForChapter(chapterNumber);
  return grammarNoteForBatch(start, end);
}
