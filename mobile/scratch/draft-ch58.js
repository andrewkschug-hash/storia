const fs = require('fs');

const paragraphs58 = [
  // p1
  [
    {
      id: 's01',
      text: "Lunedì pomeriggio alle tre, approfittando della pausa di chiusura dello Spazio Monti, Luca prese l'autobus fino a San Lorenzo.",
      speakerId: null,
      kind: 'narration',
      en: "Monday afternoon at three, taking advantage of Spazio Monti's afternoon closure, Luca took the bus to San Lorenzo."
    },
    {
      id: 's02',
      text: "Il quartiere universitario appariva vivace e rumoroso sotto un cielo autunnale che si andava schiarendo dopo la pioggia.",
      speakerId: null,
      kind: 'narration',
      en: "The university neighborhood appeared lively and bustling under an autumn sky that was clearing up after the rain."
    },
    {
      id: 's03',
      text: "Quando spinse la porta a vetri del Bar Centrale, il suono familiare del campanello metallico e il profumo di tostatura lo accolsero come una vecchia abitudine rassicurante.",
      speakerId: null,
      kind: 'narration',
      en: "When he pushed the glass door of Bar Centrale, the familiar chime of the metallic bell and the roast aroma welcomed him like a reassuring old habit."
    },
    {
      id: 's04',
      text: "Dietro il banco d'acciaio, Bruno stava asciugando una fila di tazzine con la solita calma metodica che non era cambiata in quarant'anni di mestiere.",
      speakerId: null,
      kind: 'narration',
      en: "Behind the steel counter, Bruno was drying a row of cups with the usual methodical calm that had not changed in forty years of craft."
    }
  ],
  // p2
  [
    {
      id: 's05',
      text: "«Guarda chi si rivede da queste parti,» disse Bruno, sollevando lo sguardo con un mezzo sorriso e appoggiando lo strofinaccio sul piano di lavoro.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "“Look who's back in these parts,” said Bruno, looking up with a half-smile and setting the tea towel on the workspace."
    },
    {
      id: 's06',
      text: "«Sei venuto a controllare se la tua vecchia postazione è ancora libera o sei passato soltanto per bere un espresso decente lontano dai tuoi esperimenti?»",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "“Did you come to check if your old station is still open, or did you just stop by to drink a decent espresso far from your experiments?”"
    },
    {
      id: 's07',
      text: "Luca sorrise, si sedette sull'ultimo sgabello in fondo al bancone e tirò fuori dalla borsa il quaderno dei conti con la copertina nera.",
      speakerId: null,
      kind: 'narration',
      en: "Luca smiled, sat down on the last stool at the end of the counter, and pulled out from his bag the black-covered ledger."
    },
    {
      id: 's08',
      text: "«Sono venuto perché ho bisogno di un consiglio onesto da chi ha visto passare generazioni di baristi e di clienti in questa città,» ammise Luca con franchezza.",
      speakerId: 'luca',
      kind: 'dialogue',
      en: "“I came because I need honest advice from someone who has seen generations of baristas and customers pass through this city,” admitted Luca with candor."
    }
  ],
  // p3
  [
    {
      id: 's09',
      text: "Bruno preparò due caffè senza alcuna fretta, ne spinse uno verso Luca e aprì il registro contabile esattamente sulla pagina dei totali di ottobre.",
      speakerId: null,
      kind: 'narration',
      en: "Bruno made two coffees without any rush, slid one toward Luca, and opened the accounting ledger right to the October totals page."
    },
    {
      id: 's10',
      text: "I suoi occhi esperti scorsero rapidamente le entrate lorde, i costi della materia prima, le bollette dell'energia elettrica e la quota d'affitto condivisa con Claudia.",
      speakerId: null,
      kind: 'narration',
      en: "His experienced eyes quickly scanned the gross revenue, ingredient costs, electricity bills, and the rent share split with Claudia."
    },
    {
      id: 's11',
      text: "Non disse una parola per due lunghi minuti, limitandosi a tamburellare con le dita nodose sul bordo di zinco del bancone.",
      speakerId: null,
      kind: 'narration',
      en: "He did not say a word for two long minutes, merely tapping his knobby fingers on the counter's zinc edge."
    }
  ],
  // p4
  [
    {
      id: 's12',
      text: "«Hai un margine netto troppo sottile per dormire sonni tranquilli alla fine del mese,» mormorò infine Bruno, alzando lo sguardo con severità paterna.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "“Your net margin is too thin to sleep soundly at the end of the month,” murmured Bruno at last, raising his gaze with fatherly sternness."
    },
    {
      id: 's13',
      text: "«La mattina hai un buon flusso di pendolari, ma spendi troppo per la fornitura dei chicchi rispetto a quanto incassi nelle ore successive della giornata.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "“In the morning you have a good flow of commuters, but you spend too much on bean supplies compared to what you take in during the later hours of the day."
    },
    {
      id: 's14',
      text: "Cosa succede esattamente allo Spazio Monti tra le undici del mattino e le cinque del pomeriggio?»",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "What exactly happens at Spazio Monti between eleven in the morning and five in the afternoon?”"
    }
  ],
  // p5
  [
    {
      id: 's15',
      text: "Luca sospirò a fondo e raccontò la verità senza nascondere l'inquietudine economica che lo accompagnava da giorni.",
      speakerId: null,
      kind: 'narration',
      en: "Luca sighed deeply and told the truth without hiding the financial unease that had accompanied him for days."
    },
    {
      id: 's16',
      text: "«Nelle ore centrali del giorno il locale è praticamente deserto,",
      speakerId: 'luca',
      kind: 'dialogue',
      en: "“During the middle hours of the day the shop is practically deserted,"
    },
    {
      id: 's17',
      text: "abbiamo le macchine accese, la luce e il riscaldamento, ma entrano appena due o tre persone in tutta la fascia pomeridiana.",
      speakerId: 'luca',
      kind: 'dialogue',
      en: "we have machines running, lighting and heating, but barely two or three people walk in during the entire afternoon window."
    },
    {
      id: 's18',
      text: "Avevo pensato di risparmiare comprando una miscela commerciale per il mattino, ma Claudia si è opposta dicendo che distruggerebbe la nostra identità artigianale.»",
      speakerId: 'luca',
      kind: 'dialogue',
      en: "I had thought about saving money by buying a commercial blend for the morning, but Claudia opposed it, saying it would destroy our artisanal identity.”"
    }
  ],
  // p6
  [
    {
      id: 's19',
      text: "Bruno scosse la testa con vigore e batté il palmo della mano sul tavolo: «Claudia ha perfettamente ragione, ragazzo mio.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "Bruno shook his head with vigor and slapped his palm on the table: “Claudia is completely right, my boy."
    },
    {
      id: 's20',
      text: "Se cominci a comprare caffè commerciale scadente per risparmiare pochi spiccioli al chilo, diventi immediatamente un bar qualunque come ce ne sono diecimila a Roma.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "If you start buying low-grade commercial coffee to save a few pennies a kilo, you immediately become just another ordinary bar like the ten thousand others in Rome."
    },
    {
      id: 's21',
      text: "E un bar qualunque a Monti muore dopo sei mesi perché non può competere sui prezzi con i grandi distributori.»",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "And an ordinary bar in Monti dies after six months because it cannot compete on price against large distributors.”"
    }
  ],
  // p7
  [
    {
      id: 's22',
      text: "Fece scendere una goccia d'acqua calda nella propria tazzina e riprese a parlare con un tono più disteso e misurato:",
      speakerId: null,
      kind: 'narration',
      en: "He let a drop of hot water fall into his cup and resumed speaking in a calmer, measured tone:"
    },
    {
      id: 's23',
      text: "«Il tuo errore principale non riguarda la qualità del prodotto: riguarda l'illusione romantica con cui hai iniziato questa avventura.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "“Your main mistake is not about product quality: it is about the romantic illusion with which you started this venture."
    },
    {
      id: 's24',
      text: "Pensavi forse che bastasse aprire una bottega accogliente e macinare chicchi selezionati per fare in modo che la gente facesse la fila ininterrotta dalla mattina alla sera?",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "Did you perhaps think that opening a cozy shop and grinding selected beans was enough to make people queue uninterrupted from morning to evening?"
    },
    {
      id: 's25',
      text: "La realtà commerciale della città non funziona così. Devi capire esattamente chi sono i tuoi clienti e cosa cercano nelle diverse ore della giornata.»",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "The commercial reality of the city doesn't work that way. You have to understand exactly who your customers are and what they are looking for at different times of day.”"
    }
  ],
  // p8
  [
    {
      id: 's26',
      text: "Luca ascoltava in silenzio, assorbendo ogni singola frase con un misto di umiltà e rinnovata concentrazione.",
      speakerId: null,
      kind: 'narration',
      en: "Luca listened in silence, absorbing each single sentence with a mix of humility and renewed concentration."
    },
    {
      id: 's27',
      text: "«La mattina alle otto la gente compra tempo e velocità,» spiegò Bruno, tracciando una linea netta con il dito sul bancone.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "“At eight in the morning people buy time and speed,” explained Bruno, tracing a clear line with his finger on the counter."
    },
    {
      id: 's28',
      text: "«Vogliono un espresso eccellente in novanta secondi perché devono correre in ufficio o prendere il treno a Termini.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "“They want an excellent espresso in ninety seconds because they have to rush to the office or catch the train at Termini."
    },
    {
      id: 's29',
      text: "Ma il pomeriggio la clientela cerca qualcosa di completamente diverso. Il pomeriggio chi entra non cerca fretta: cerca spazio tranquillo, silenzio, concentrazione e un'accoglienza calorosa che altrove non trova.»",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "But in the afternoon customers look for something completely different. In the afternoon whoever comes in is not looking for haste: they seek quiet space, silence, concentration, and warm hospitality that they find nowhere else.”"
    }
  ],
  // p9
  [
    {
      id: 's30',
      text: "«Quindi cosa dovrei fare concretamente secondo te?» domandò Luca, cercando una direzione pratica e operativa.",
      speakerId: 'luca',
      kind: 'dialogue',
      en: "“So what should I do concretely in your opinion?” asked Luca, looking for a practical, operational direction."
    },
    {
      id: 's31',
      text: "«Se fossi al tuo posto,» rispose Bruno con sguardo fermo, «non toccherei assolutamente la qualità dei chicchi colombiani ed etiopi.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "“If I were in your place,” answered Bruno with a firm look, “I would absolutely not touch the quality of Colombian and Ethiopian beans."
    },
    {
      id: 's32',
      text: "Piuttosto, organizzerei la disposizione del locale per dare un valore economico reale a quel tempo vuoto del pomeriggio che oggi ti costa solo spese vive.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "Rather, I would organize the room layout to give real economic value to those empty afternoon hours that currently cost you only running expenses."
    },
    {
      id: 's33',
      text: "Nel rione Monti ci sono decine di studenti, ricercatori universitari e professionisti che cercano un posto calmo dove leggere o lavorare senza il frastuono dei bar tradizionali.»",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "In the Monti neighborhood there are dozens of students, university researchers, and professionals looking for a calm place to read or work without the clamor of traditional bars.”"
    }
  ],
  // p10
  [
    {
      id: 's34',
      text: "Luca ricordò lo studente che si era seduto vicino alla grande finestra il primo martedì mattina con un libro aperto e un taccuino.",
      speakerId: null,
      kind: 'narration',
      en: "Luca remembered the student who had sat near the large window that first Tuesday morning with an open book and notebook."
    },
    {
      id: 's35',
      text: "«Potremmo proporre caffè filtro a estrazione lenta e tisane pregiate per chi si siede ai tavoli con calma,» propose Luca, cominciando a visualizzare la nuova organizzazione dello spazio.",
      speakerId: 'luca',
      kind: 'dialogue',
      en: "“We could offer slow-drip filter coffee and fine herbal teas for people who sit at the tables at their leisure,” proposed Luca, beginning to visualize the space's new setup."
    },
    {
      id: 's36',
      text: "«E Claudia potrebbe tenere piccoli corsi pomeridiani di ceramica nella sala posteriore, mentre io servo bevande calde e racconto la storia delle piantagioni ai clienti interessati.»",
      speakerId: 'luca',
      kind: 'dialogue',
      en: "“And Claudia could hold small afternoon pottery workshops in the back room, while I serve hot drinks and tell the story of the plantations to interested customers.”"
    }
  ],
  // p11
  [
    {
      id: 's37',
      text: "Bruno annuì con visibile approvazione, posando una mano rassicurante sulla spalla di Luca: «Ecco la consapevolezza che ti mancava quando sei venuto qui oggi.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "Bruno nodded with visible approval, placing a reassuring hand on Luca's shoulder: “There is the awareness you were missing when you came here today."
    },
    {
      id: 's38',
      text: "Invece di subire passivamente le ore vuote come se fossero una condanna inevitabile, impari a trasformarle in una risorsa distintiva del tuo progetto.",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "Instead of passively suffering empty hours as if they were an inevitable curse, you learn to turn them into a distinctive asset of your project."
    },
    {
      id: 's39',
      text: "Un'attività artigianale indipendente non sopravvive perché il titolare lavora quattordici ore al giorno; sopravvive perché ogni ora di apertura ha uno scopo chiaro e redditizio.»",
      speakerId: 'bruno',
      kind: 'dialogue',
      en: "An independent craft business does not survive because the owner works fourteen hours a day; it survives because every open hour has a clear and profitable purpose.”"
    }
  ],
  // p12
  [
    {
      id: 's40',
      text: "Luca terminò il suo caffè, chiuse il registro contabile e ringraziò Bruno con una stretta di mano vigorosa e calorosa.",
      speakerId: null,
      kind: 'narration',
      en: "Luca finished his coffee, closed the ledger, and thanked Bruno with a vigorous, warm handshake."
    },
    {
      id: 's41',
      text: "Uscendo dal Bar Centrale, sentì che il peso dell'incertezza che lo tormentava dalla domenica si era finalmente dissolto nell'aria fresca del quartiere.",
      speakerId: null,
      kind: 'narration',
      en: "Stepping out of Bar Centrale, he felt the burden of uncertainty that had tormented him since Sunday finally dissolve into the neighborhood's fresh air."
    },
    {
      id: 's42',
      text: "La conversazione schietta con il suo vecchio maestro gli aveva restituito la lucidità mentale necessaria per guardare avanti con coraggio e senza cedere a facili scorciatoie.",
      speakerId: null,
      kind: 'narration',
      en: "The frank conversation with his old mentor had restored the mental clarity necessary to look ahead with courage and without giving in to easy shortcuts."
    }
  ],
  // p13
  [
    {
      id: 's43',
      text: "Mentre saliva sui gradini dell'autobus per tornare verso Via dei Serpenti, Luca guardava le strade e le piazze di Roma scorrere veloci oltre il finestrino.",
      speakerId: null,
      kind: 'narration',
      en: "As he climbed the bus steps to return toward Via dei Serpenti, Luca watched the streets and squares of Rome rush past outside the window."
    },
    {
      id: 's44',
      text: "Capì con assoluta chiarezza che la vera maestria non consisteva soltanto nel calibrare una macinatura millimetrica o nell'estrarre un espresso impeccabile.",
      speakerId: null,
      kind: 'narration',
      en: "He understood with absolute clarity that true mastery did not consist merely in calibrating a millimetric grind or extracting a flawless espresso."
    },
    {
      id: 's45',
      text: "La maestria autentica richiedeva soprattutto la capacità di ascoltare la realtà viva della città, di comprendere le esigenze delle persone e di costruire un equilibrio solido tra l'eccellenza del mestiere e la sostenibilità economica quotidiana.",
      speakerId: null,
      kind: 'narration',
      en: "Authentic mastery demanded above all the capacity to listen to the living reality of the city, to understand people's needs, and to build a solid balance between craft excellence and everyday economic sustainability."
    }
  ]
];

const totalWords58 = paragraphs58.flat().reduce((acc, s) => acc + s.text.split(/\s+/).filter(Boolean).length, 0);
console.log('Chapter 58 Calibrated Word Count:', totalWords58);

module.exports = paragraphs58;
