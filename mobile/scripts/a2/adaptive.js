function row(reinforces, text, english, extra = {}) {
  return {
    reinforces,
    variants: [
      {
        id: 'extended',
        text,
        english,
        reinforces,
        ...extra,
      },
    ],
  };
}

/** ~40 natural A2 adaptive opportunities. Keys must match authored sentence ids. */
const adaptive = {
  'luca-a-roma-21:s10': row(
    ['cercare'],
    'Non cerca più un bar oggi. Va al lavoro, come ogni giorno.',
    'He no longer looks for a café today. He goes to work, like every day.',
  ),
  'luca-a-roma-21:s13': row(
    ['arrivare'],
    'Quando arriva vicino al caffè oggi, vede già la porta aperta.',
    'When he arrives near the café today, he already sees the door open.',
  ),
  'luca-a-roma-21:s25': row(
    ['aiutare'],
    'Quando un cliente ha chiesto qualcosa, Giulia ha aiutato Luca ancora.',
    'When a customer asked for something, Giulia helped Luca again.',
  ),
  'luca-a-roma-21:s31': row(
    ['tornare'],
    'La sera Luca è tornato a casa e ha dormito bene, finalmente.',
    'In the evening Luca went home and slept well, finally.',
  ),
  'luca-a-roma-22:s01': row(
    ['aspettare'],
    'Quando Luca ha finito il lavoro, Sofia lo stava già aspettando vicino alla porta del caffè.',
    'When Luca finished work, Sofia was already waiting for him near the café door.',
  ),
  'luca-a-roma-22:s22': row(
    ['partire'],
    'Sofia è partita verso casa, e Luca è rimasto un momento nella strada del quartiere.',
    'Sofia left toward home, and Luca stayed a moment in the neighborhood street.',
  ),
  'luca-a-roma-22:s24': row(
    ['tornare'],
    'Mentre tornava a casa, pensava già a domenica con Sofia.',
    'While he went home, he was already thinking about Sunday with Sofia.',
  ),
  'luca-a-roma-23:s01': row(
    ['arrivare'],
    'Il giorno dopo Luca è arrivato al lavoro più tardi del solito, ma non troppo tardi.',
    'The next day Luca arrived at work later than usual, but not too late.',
  ),
  'luca-a-roma-23:s10': row(
    ['aiutare'],
    'Tu ascolti. Io aiuto se serve. Non c’è problema oggi.',
    'You listen. I’ll help if needed. No problem today.',
    {
      phraseReinforces: ['non_ce_problema'],
      phrases: [{ surface: 'Non c’è problema', literalEn: 'there is not problem', naturalEn: 'no problem' }],
    },
  ),
  'luca-a-roma-24:s13': row(
    ['tornare'],
    'Il papà ha chiesto se Luca voleva tornare a casa.',
    'Dad asked if Luca wanted to come back home.',
  ),
  'luca-a-roma-24:s19': row(
    ['arrivare', 'decidere'],
    'Nel pomeriggio Sofia è arrivata, come deciso insieme.',
    'In the afternoon Sofia arrived, as decided together.',
  ),
  'luca-a-roma-25:s15': row(
    ['tornare'],
    'La sera Luca è tornato a casa e ha contato i soldi per l’affitto, ancora una volta.',
    'In the evening Luca went home and counted the money for the rent, once more.',
  ),
  'luca-a-roma-26:s04': row(
    ['decidere'],
    'Forse lo vendo. O forse cambio tutto. Non ho deciso oggi.',
    'Maybe I will sell it. Or maybe I will change everything. I have not decided today.',
  ),
  'luca-a-roma-26:s16': row(
    ['aspettare'],
    'Allora dobbiamo fare qualcosa. Non solo aspettare il padrone.',
    'Then we must do something. Not only wait for the owner.',
  ),
  'luca-a-roma-26:s21': row(
    ['aiutare'],
    'I suoi amici potevano aiutare a pensare, non solo a lavorare al caffè.',
    'His friends could help him think, not only work at the café.',
  ),
  'luca-a-roma-27:s01': row(
    ['incontrare'],
    'Mercoledì Luca ha incontrato Sofia vicino alla piazza, dopo il lavoro, come sempre.',
    'Wednesday Luca met Sofia near the square, after work, as always.',
  ),
  'luca-a-roma-27:s23': row(
    ['decidere'],
    'Hanno deciso di vedere Nonna Rosa il giorno dopo, insieme.',
    'They decided to see Nonna Rosa the next day, together.',
  ),
  'luca-a-roma-28:s07': row(
    ['trovare', 'ricordare'],
    'Il viaggio è passato. Il biglietto e la valigia li abbiamo trovati. Ricordi ancora?',
    'The trip is over. We found the ticket and the suitcase. Do you still remember?',
  ),
  'luca-a-roma-28:s09': row(
    ['cercare', 'trovare'],
    'Sì. Ma il lavoro no. Cerco e non trovo un posto. Ogni giorno è lo stesso.',
    'Yes. But not work. I look and I do not find a place. Every day is the same.',
  ),
  'luca-a-roma-28:s16': row(
    ['aspettare', 'cercare'],
    'Magari. Adesso cerco ancora. Non voglio solo aspettare gli amici.',
    'Maybe. Now I still look. I don’t want to only wait for friends.',
  ),
  'luca-a-roma-29:s14': row(
    ['aspettare'],
    'Allora gli diciamo. Non aspettiamo troppo. Gli diamo una ragione per restare, non per vendere.',
    'Then we tell him. We don’t wait too long. We give him a reason to stay, not to sell.',
  ),
  'luca-a-roma-29:s15': row(
    ['aiutare'],
    'Io posso aiutare ancora. Non ho soldi, ma ho tempo e posso lavorare.',
    'I can still help. I don’t have money, but I have time and I can work.',
  ),
  'luca-a-roma-30:s01': row(
    ['arrivare', 'decidere', 'scegliere'],
    'Sabato non era ancora arrivato. Prima dovevano scegliere un giorno, e decidere insieme.',
    'Saturday had not arrived yet. First they had to choose a day, and decide together.',
  ),
  'luca-a-roma-30:s17': row(
    ['decidere', 'scegliere'],
    'Avevano scelto un giorno, e avevano deciso di restare insieme in questa cosa importante.',
    'They had chosen a day, and they had decided to stay together in this important thing.',
  ),
  'luca-a-roma-31:s13': row(
    ['dimenticare'],
    'Nel pomeriggio Luca ha dimenticato di dire una cosa importante a Giulia.',
    'In the afternoon Luca forgot to tell Giulia something important.',
  ),
  'luca-a-roma-31:s19': row(
    ['incontrare'],
    'La sera i quattro amici si sono incontrati un momento in piazza, dopo il lavoro.',
    'In the evening the four friends met for a moment in the square, after work.',
  ),
  'luca-a-roma-32:s04': row(
    ['aspettare'],
    'Hai ragione. Dobbiamo fare di più, non solo aspettare messaggi dal quartiere.',
    'You’re right. We must do more, not only wait for messages from the neighborhood.',
  ),
  'luca-a-roma-33:s04': row(
    ['aspettare', 'cercare'],
    'No. Ieri ha detto di venire. Adesso cerco Marco. Aspetta lì.',
    'No. Yesterday he said he would come. I’ll look for Marco now. Wait there.',
  ),
  'luca-a-roma-33:s07': row(
    ['cercare'],
    'Luca ha cercato Marco vicino ai negozi e vicino alla stazione del quartiere.',
    'Luca looked for Marco near the shops and near the neighborhood station.',
  ),
  'luca-a-roma-33:s08': row(
    ['aspettare', 'trovare'],
    'Non l’ha trovato. Poi ha visto Sofia, ancora in piazza, stanca di aspettare Marco.',
    'He did not find him. Then he saw Sofia, still in the square, tired of waiting for Marco.',
  ),
  'luca-a-roma-33:s21': row(
    ['ricordare', 'dimenticare'],
    'Ci sono. Lo ricordo bene. Non dimentico più.',
    'I am here. I remember it well. I will not forget again.',
  ),
  'luca-a-roma-34:s03': row(
    ['trovare'],
    'Ha camminato al caffè e ha trovato Giulia già dentro, con i tavoli aperti e pronti.',
    'He walked to the café and found Giulia already inside, with the tables open and ready.',
  ),
  'luca-a-roma-34:s14': row(
    ['scegliere'],
    'Giulia ha scelto un posto per la musica, non troppo forte, vicino alla finestra della sala.',
    'Giulia chose a place for the music, not too loud, near the window of the room.',
  ),
  'luca-a-roma-35:s04': row(
    ['aspettare'],
    'Aspetta un momento. È presto. Le persone del quartiere mangiano e poi escono.',
    'Wait a moment. It is early. Neighborhood people eat and then go out.',
  ),
  'luca-a-roma-35:s18': row(
    ['tornare'],
    'Una signora ha detto che il caffè le piaceva, e che tornava la settimana dopo, di sicuro.',
    'A woman said she liked the café, and that she would come back the next week, for sure.',
  ),
  'luca-a-roma-36:s09': row(
    ['tornare'],
    'Se vi piace, tornate qui. Non solo oggi. Anche lunedì, anche giovedì.',
    'If you like it, come back here. Not only today. Also Monday, also Thursday.',
  ),
  'luca-a-roma-37:s11': row(
    ['scegliere'],
    'Luca ha sentito le parole “se volete” e ha capito che poteva scegliere le ore.',
    'Luca heard the words “if you want” and understood that he could choose the hours.',
  ),
  'luca-a-roma-38:s01': row(
    ['incontrare'],
    'Due sere dopo, Luca e Sofia si sono incontrati per una cena piccola nel centro di Roma.',
    'Two evenings later, Luca and Sofia met for a small dinner in the center of Rome.',
  ),
  'luca-a-roma-38:s16': row(
    ['scegliere'],
    'Scegli tu. Non dire di sì a tutto perché hai paura di restare senza soldi.',
    'You choose. Don’t say yes to everything because you are afraid of being without money.',
  ),
  'luca-a-roma-39:s07': row(
    ['cercare', 'trovare', 'aiutare'],
    'Cerco lavoro. Non ho trovato un posto grande. Ma posso aiutare qui, nei giorni pieni, se serve.',
    'I am looking for work. I did not find a big place. But I can help here, on full days, if needed.',
  ),
  'luca-a-roma-40:s05': row(
    ['trovare'],
    'Un pomeriggio, a casa, Luca ha trovato una lettera sotto la porta della sua stanza.',
    'One afternoon, at home, Luca found a letter under the door of his room.',
  ),
  'luca-a-roma-40:s15': row(
    ['decidere'],
    'Non decidere adesso, Luca. Domani. Con le persone giuste.',
    'Don’t decide now, Luca. Tomorrow. With the right people.',
  ),
  'luca-a-roma-40:s20': row(
    ['scegliere'],
    'Hai ragione. Non dobbiamo scegliere il futuro in un momento, oggi.',
    'You’re right. We must not choose the future in a moment, today.',
  ),
  'luca-a-roma-40:s24': row(
    ['aspettare'],
    'Fuori, Roma continuava. Dentro, la lettera stava sul tavolo, chiusa di nuovo, e aspettava Luca.',
    'Outside, Rome continued. Inside, the letter lay on the table, closed again, and waited for Luca.',
  ),
};

module.exports = { adaptive };
