/**
 * Comprehension questions for "Luca a Roma" — A1+ bridge chapters 21–24.
 * Exactly 3 questions per chapter. Mix of English and Italian prompts (questionIt).
 */

const questionsByChapterNumber = {
  21: [
    {
      id: 'ch21_q01',
      chapterId: 'luca-a-roma-21',
      type: 'event',
      question: 'Why does Luca go to work early today?',
      questionIt: 'Perché Luca va al lavoro presto oggi?',
      choices: [
        'He must talk with Marco',
        'He is leaving Rome',
        'The café is closed',
      ],
      correctChoice: 0,
      explanation: 'Luca goes early because he must speak with Marco (deve parlare con Marco).',
      difficulty: 2,
    },
    {
      id: 'ch21_q02',
      chapterId: 'luca-a-roma-21',
      type: 'character',
      question: 'Who helps Luca with the customers?',
      choices: ['Giulia', 'Sofia', 'Nonna Rosa'],
      correctChoice: 0,
      explanation: 'Giulia works with Luca and helps when a customer asks for something.',
      difficulty: 2,
    },
    {
      id: 'ch21_q03',
      chapterId: 'luca-a-roma-21',
      type: 'direct',
      question: 'What does the owner say about the café today?',
      questionIt: 'Cosa dice il padrone del caffè oggi?',
      choices: [
        'The café is busy today',
        'The café is closed today',
        'Luca must leave Rome',
      ],
      correctChoice: 0,
      explanation: 'The padrone tells Luca that the café is occupato (busy) today.',
      difficulty: 2,
    },
  ],

  22: [
    {
      id: 'ch22_q01',
      chapterId: 'luca-a-roma-22',
      type: 'event',
      question: 'What do Luca and Sofia do in the evening?',
      questionIt: 'Cosa fanno Luca e Sofia la sera?',
      choices: [
        'They walk in the neighborhood',
        'They take a train trip',
        'They look for an apartment',
      ],
      correctChoice: 0,
      explanation: 'After work they walk together in the quartiere and talk.',
      difficulty: 2,
    },
    {
      id: 'ch22_q02',
      chapterId: 'luca-a-roma-22',
      type: 'character',
      question: 'How does Luca feel about his life in Rome?',
      choices: [
        'He is happy and wants to stay',
        'He wants to leave immediately',
        'He has no home or job',
      ],
      correctChoice: 0,
      explanation: 'Luca says he has a home and work and is contento di restare qui.',
      difficulty: 2,
    },
    {
      id: 'ch22_q03',
      chapterId: 'luca-a-roma-22',
      type: 'inference',
      question: 'What does Sofia mean when she says Luca is important?',
      choices: [
        'He matters to his friends in Rome',
        'He must pay the rent today',
        'He needs to find a new job',
      ],
      correctChoice: 0,
      explanation: 'Sofia tells him he is importante per noi — important to the group of friends.',
      difficulty: 2,
    },
  ],

  23: [
    {
      id: 'ch23_q01',
      chapterId: 'luca-a-roma-23',
      type: 'event',
      question: 'Why is today difficult at the café?',
      questionIt: 'Perché oggi è difficile al caffè?',
      choices: [
        'There are many customers',
        'The café is closed',
        'Luca is on a trip',
      ],
      correctChoice: 0,
      explanation: 'The café is molto occupato with many clienti.',
      difficulty: 2,
    },
    {
      id: 'ch23_q02',
      chapterId: 'luca-a-roma-23',
      type: 'character',
      question: 'How does Giulia help Luca?',
      choices: [
        'She helps with orders and customers',
        'She finds him an apartment',
        'She buys his train ticket',
      ],
      correctChoice: 0,
      explanation: 'Giulia takes ordini, helps with pane, and supports Luca during the rush.',
      difficulty: 2,
    },
    {
      id: 'ch23_q03',
      chapterId: 'luca-a-roma-23',
      type: 'direct',
      question: 'What does the owner ask Luca and Giulia to do?',
      choices: [
        'Work together today',
        'Close the café early',
        'Leave for Rome station',
      ],
      correctChoice: 0,
      explanation: 'The padrone tells them to lavorate insieme — work together.',
      difficulty: 2,
    },
  ],

  24: [
    {
      id: 'ch24_q01',
      chapterId: 'luca-a-roma-24',
      type: 'event',
      question: 'What does Luca do on Sunday?',
      questionIt: 'Cosa fa Luca la domenica?',
      choices: [
        'He calls his family and rests',
        'He works a long shift at the café',
        'He leaves Rome on a train',
      ],
      correctChoice: 0,
      explanation: 'On domenica Luca does not work; he calls Nonna Rosa and stays home.',
      difficulty: 2,
    },
    {
      id: 'ch24_q02',
      chapterId: 'luca-a-roma-24',
      type: 'character',
      question: 'Who does Luca talk to on the phone?',
      choices: ['Nonna Rosa', 'Marco', 'The café owner'],
      correctChoice: 0,
      explanation: 'Luca chiama Nonna Rosa and tells her about his life in Rome.',
      difficulty: 2,
    },
    {
      id: 'ch24_q03',
      chapterId: 'luca-a-roma-24',
      type: 'inference',
      question: 'What does the sentence about yesterday suggest?',
      choices: [
        'Luca is starting to use past tense in the story',
        'Luca is moving back home',
        'The café closed forever',
      ],
      correctChoice: 0,
      explanation: '"Ieri Luca è andato al negozio" is a light past-tense moment before A2 chapters.',
      difficulty: 2,
    },
  ],
};

module.exports = { questionsByChapterNumber };
