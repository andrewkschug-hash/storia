const fs = require('fs');

const ch66_paragraphs = [
  // P1: Opening morning in Monti - Roman autumn rhythms
  [
    "Novembre era arrivato a Roma con un’aria fresca e frizzante che spazzava via le ultime tracce dell’estate dai vicoli di Monti.",
    "Ogni mattina alle sette, quando Luca apriva la porta di Spazio Monti e accendeva le luci calde del laboratorio, sentiva il quartiere svegliarsi con i suoi ritmi antichi e immutabili.",
    "C’erano i furgoni delle consegne che scaricavano le cassette di frutta e verdura, i passi svelti degli operai diretti verso la fermata della metropolitana Cavour e il profumo familiare di pane fresco che arrivava dal forno all’angolo."
  ],
  // P2: The contrast between specialty coffee and traditional Roman habits
  [
    "Nelle prime settimane di apertura, Luca aveva pensato che tutti i residenti del rione avrebbero accolto con entusiasmo le sue selezioni di caffè dolce e aromatico.",
    "Ben presto, tuttavia, la realtà quotidiana del quartiere gli aveva mostrato che le abitudini delle persone erano radicate in decenni di gesti veloci, caffè scuri e abitudini consolidate.",
    "Molti clienti storici entravano al mattino con una fretta evidente, chiedevano un espresso al volo al banco, bevevano in un solo sorso e lasciavano una moneta da un euro sul piattino prima di correre via."
  ],
  // P3: The arrival of signor Sergio
  [
    "Il signor Sergio, un pensionato che aveva gestito per quarant’anni una tipografia in via dei Serpenti, era il cliente più severo e abitudinario del mattino.",
    "Entrava puntualmente alle sette e un quarto con il giornale sotto il braccio, salutava con un cenno appena accennato del capo e pretendeva un caffè bollente, forte e amaro.",
    "Quando Luca gli aveva servito per la prima volta un caffè leggero e floreale, Sergio aveva fatto una smorfia evidente e aveva scosso la testa con delusione sincera."
  ],
  // P4: Sergio's candid feedback
  [
    "«Ragazzo mio, questo non è il caffè della mattina che mi dà la sveglia per iniziare la giornata,» gli aveva detto Sergio appoggiando la tazzina sul bancone con un sospiro pesante.",
    "«Questo sembra un infuso d’erbe per signorine raffinate, non l’espresso schietto e sincero che noi romani beviamo da tutta la vita prima di andare al lavoro.»",
    "Luca, che all’inizio era tentato di difendere con orgoglio la superiorità delle sue selezioni pregiate, aveva ripensato alle parole di Bruno sulla necessità di ascoltare le persone prima di pretendere di educarle."
  ],
  // P5: Luca's realization: craft without snobbery
  [
    "Invece di irrigidirsi o considerare Sergio un cliente ignorante e chiuso alle novità, Luca aveva capito che il vero mestiere artigianale non doveva mai trasformarsi in arroganza o distanza.",
    "L’identità di un rione storico come Monti non poteva essere cancellata o sostituita da una moda moderna arrivata dall’estero.",
    "Se Spazio Monti voleva diventare una casa autentica per il quartiere, doveva saper accogliere sia chi cercava un rito rilassato sia chi desiderava semplicemente il proprio espresso quotidiano con rispetto e calore."
  ],
  // P6: Developing the "Miscela Monti"
  [
    "Nel corso delle settimane successive, Luca si era messo al lavoro per creare una speciale miscela della casa dedicata al quartiere.",
    "Aveva unito una base corposa e dolce di caffè brasiliano naturale con una piccola percentuale di chicchi tostati con maggiore intensità da Marco, per dare corpo, rotondità e note di cioccolato fondente.",
    "Era una ricetta pensata per offrire un sapore ricco, pieno e rassicurante, ma pulito e privo di qualunque sentore sgradevole o bruciato."
  ],
  // P7: Sergio tries the new blend
  [
    "Un giovedì mattina, quando Sergio è entrato come al solito con la sciarpa di lana al collo, Luca gli ha sorriso dietro al bancone e ha preparato la tazzina calda con gesti calmi e sicuri.",
    "«Signor Sergio, oggi ho preparato una miscela nuova pensata proprio per chi ama un espresso deciso e corposo: mi farebbe molto piacere conoscere la sua opinione sincera,» gli ha detto porgendogli il piattino.",
    "Sergio ha guardato la crema scura e densa con un misto di curiosità e diffidenza, ha soffiato leggermente sulla tazzina e ha bevuto il primo sorso in silenzio."
  ],
  // P8: Sergio's honest approval
  [
    "Per qualche secondo nella bottega si è sentito soltanto il rumore sommesso del laboratorio di Marco in fondo alla sala.",
    "Poi Sergio ha appoggiato la tazzina vuota, ha pulito le labbra con il tovagliolino di carta e un sorriso inaspettato gli ha illuminato il viso rugoso.",
    "«Ecco, questo ha carattere, forza e sostanza,» ha ammesso Sergio con voce schietta. «È deciso e forte, ma non lascia quell’amaro cattivo in bocca che ti rovina la mattinata. Adesso cominciamo a capirci.»"
  ],
  // P9: The bridge between worlds
  [
    "Quell’approvazione semplice è stata per Luca una vittoria più preziosa di qualsiasi riconoscimento tecnico.",
    "Poco a poco, Spazio Monti ha iniziato a vedere una convivenza naturale e armoniosa tra persone con abitudini completamente diverse.",
    "Al tavolo grande in fondo, Chiara e altri studenti universitari leggevano e traducevano testi con i loro caffè filtro preparati con calma, mentre al bancone d’ingresso gli artigiani del rione si scambiavano battute veloci sorseggiando la miscela della casa."
  ],
  // P10: Claudia's observation on neighborhood life
  [
    "Mentre sistemava una serie di tazzine di ceramica appena finite sugli scaffali, Claudia ha osservato la sala piena e ha sorriso a Luca con complicità.",
    "«Hai notato come è cambiata l’atmosfera da quando hai smesso di preoccuparti di dimostrare qualcosa a tutti i costi?» gli ha chiesto a voce bassa.",
    "«Prima sembravi un maestro severo che spiegava una lezione difficile; adesso sei un oste che accoglie gli amici a casa propria, e la gente lo sente subito.»"
  ],
  // P11: Marco's reflection on tradition and evolution
  [
    "Anche Marco, uscendo dal suo angolo di falegnameria con il grembiule impolverato di segatura per una pausa veloce, ha confermato quella sensazione.",
    "«Il legno e il quartiere funzionano allo stesso modo: non puoi forzarli a diventare quello che vuoi tu dall’oggi al domani,» ha detto versandosi un bicchiere d’acqua fresca.",
    "«Devi prima capire come sono fatti, rispettare la loro storia, e solo allora puoi proporre qualcosa di nuovo senza rompere l’equilibrio.»"
  ],
  // P12: Evening calm in the workshop
  [
    "Verso le sette di sera, quando l’ultimo cliente ha salutato ed è uscito nella strada illuminata dai lampioni gialli, Luca ha iniziato a pulire con cura il piano di lavoro d'acciaio.",
    "Ha lavato i portafiltri con acqua bollente, ha asciugato le superfici con uno strofinaccio pulito e ha controllato la cassa della giornata.",
    "I numeri confermavano che la scelta di aprire le porte a tutto il quartiere senza pregiudizi stava portando stabilità economica, clienti affezionati e una fiducia crescente."
  ],
  // P13: Closing reflection: belonging to Rome
  [
    "Guardando fuori dalla vetrata i vicoli acciottolati che si perdevano verso Santa Maria Maggiore, Luca ha provato un senso profondo di pace e gratitudine.",
    "Non era più il ragazzo insicuro e diffidente arrivato da Pietralba con una valigia pesante e la paura di non farcela in una metropoli sconosciuta.",
    "Adesso capiva che integrarsi a Roma non significava perdere la propria identità o imporre le proprie idee con forza, ma costruire ogni giorno un ponte paziente e generoso tra la tradizione del passato e la bellezza del presente."
  ]
];

function buildChapterJson() {
  let wordCount = 0;
  let sentenceCount = 0;
  const paragraphs = ch66_paragraphs.map((sentences, pIdx) => {
    const sObjs = sentences.map((text, sIdx) => {
      sentenceCount++;
      const sId = `s${sentenceCount < 10 ? '0' : ''}${sentenceCount}`;
      const words = text.split(/\s+/).filter(Boolean);
      wordCount += words.length;
      return {
        id: sId,
        text: text,
        lemmas: [] // will be filled by aligner
      };
    });
    return {
      id: `p${pIdx + 1 < 10 ? '0' : ''}${pIdx + 1}`,
      sentences: sObjs
    };
  });

  const json = {
    id: "luca-a-roma-66",
    storyId: "luca-a-roma",
    number: 66,
    title: "The Neighborhood's Identity",
    titleIt: "L'identità del quartiere",
    difficultyLevel: 3,
    locationIds: [
      "quartiere",
      "centro",
      "strada"
    ],
    characterIds: [
      "luca",
      "marco",
      "claudia"
    ],
    events: [
      {
        id: "ev-66-neighborhood-identity",
        summary: "Luca learns to balance traditional Roman coffee expectations with his craft by creating a rich house blend for longtime neighborhood residents, earning the trust of signor Sergio.",
        characterIds: [
          "luca",
          "marco",
          "claudia"
        ],
        locationIds: [
          "quartiere",
          "centro"
        ]
      }
    ],
    paragraphs: paragraphs
  };

  console.log(`Chapter 66 generated: ${wordCount} words, ${paragraphs.length} paragraphs, ${sentenceCount} sentences.`);
  return json;
}

const ch66 = buildChapterJson();
fs.writeFileSync('c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-66.json', JSON.stringify(ch66, null, 2), 'utf8');
