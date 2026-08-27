const fs = require('fs');

function tokenizeItalian(text) {
  const tokens = [];
  const re = /[\p{L}\p{N}’']+/gu;
  let match;
  while ((match = re.exec(text)) !== null) {
    tokens.push({
      surface: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return tokens;
}

const sentenceUpdates = {
  // Ch 47
  "luca-a-roma-47:s11": {
    ch: 47,
    text: "«Questo tipo di lavorazione artigianale richiede una grande precisione e una pazienza infinita, ma se trovi un nodo nascosto all'interno del legno devi ricominciare da capo, e quel tempo perso riduce a zero il tuo guadagno.»",
    en: "This kind of artisan work requires great precision and endless patience, but if you find a hidden knot inside the wood you have to start all over again, and that lost time reduces your earnings to zero."
  },
  // Ch 50
  "luca-a-roma-50:s04": {
    ch: 50,
    text: "Luca serviva tutti con la sua consueta premura e con il sorriso caloroso che aveva ereditato dalla sua famiglia a Pietralba, ma teneva sempre pulito e regolato con cura il secondo macinatore, controllando la macinatura a ogni pausa di lavoro.",
    en: "Luca served everyone with his customary attentiveness and the warm smile he had inherited from his family in Pietralba, but he always kept the second grinder clean and carefully adjusted, checking the grind during every work break."
  },
  "luca-a-roma-50:s19": {
    ch: 50,
    text: "«Gusto fresco e molto equilibrato, corpo pieno e un finale pulito di mandorla tostata e cioccolato amaro: non c'è traccia di bruciato né di amaro sgradevole,» ha commentato con una sicurezza evidente e tranquilla.",
    en: "Fresh and very balanced flavor, full body, and a clean finish of roasted almond and dark chocolate: there is no trace of burnt taste or unpleasant bitterness, he commented with clear and calm confidence."
  },
  "luca-a-roma-50:s20": {
    ch: 50,
    text: "«La ringrazio molto,» ha risposto Luca con sincera modestia. «Regolo la macinatura e la temperatura ogni mattina all'apertura per far emergere la dolcezza naturale del chicco senza rovinarla.»",
    en: "Thank you very much, Luca replied with sincere modesty. I adjust the grind and the temperature every morning at opening to bring out the natural sweetness of the bean without ruining it."
  },
  // Ch 55
  "luca-a-roma-55:s07": {
    ch: 55,
    text: "Mentre la macchina raggiungeva stabilmente la pressione corretta, ha verificato il flusso regolare dell'acqua dal filtro, ha pulito i gruppi con un panno morbido e ha disposto le tazzine di ceramica spessa sulla griglia calda in alto.",
    en: "While the machine steadily reached the correct pressure, he checked the smooth flow of water from the filter, wiped down the group heads with a soft cloth, and arranged the thick ceramic cups on the top warming rack."
  },
  "luca-a-roma-55:s12": {
    ch: 55,
    text: "Il primo caffè di prova è sceso troppo rapidamente: il getto era chiaro e leggero, riempiendo la tazza in appena diciotto secondi con una crema sottile, poco densa e troppo acida.",
    en: "The first test espresso poured too quickly: the stream was light and watery, filling the cup in barely eighteen seconds with a thin, unstable, overly sour crema."
  },
  // Ch 56
  "luca-a-roma-56:s08": {
    ch: 56,
    text: "Prima puliva con un panno asciutto il gruppo della macchina, poi versava esattamente diciotto grammi di chicchi nel macinatore e pesava la polvere con grande attenzione.",
    en: "First he cleaned the group head with a dry cloth, then poured exactly eighteen grams of beans into the grinder and weighed the grounds with great care."
  },
  "luca-a-roma-56:s23": {
    ch: 56,
    text: "Mentre montava il latte per due cappuccini nella lattiera d'acciaio, Luca cercava di non perdere la concentrazione e controllava la pressione della macchina; tuttavia, appena sollevava lo sguardo, si accorgeva che la fila davanti al bancone continuava ad allungarsi.",
    en: "While steaming milk for two cappuccinos in a steel pitcher, Luca tried not to lose focus and checked the machine's pressure; however, as soon as he looked up, he noticed the line in front of the counter kept growing."
  },
  // Ch 57
  "luca-a-roma-57:s34": {
    ch: 57,
    text: "Claudia posò la matita sul quaderno, lo guardò dritto negli occhi e scosse la testa con decisione calma ma ferma:",
    en: "Claudia placed her pencil on the notebook, looked him straight in the eyes, and shook her head with calm but firm resolve:"
  },
  // Ch 58
  "luca-a-roma-58:s44": {
    ch: 58,
    text: "Capì con assoluta chiarezza che la vera maestria non consisteva soltanto nel regolare una macinatura perfetta o nel preparare un espresso impeccabile.",
    en: "He understood with absolute clarity that true mastery did not consist merely in adjusting a perfect grind or brewing an impeccable espresso."
  },
  // Ch 59
  "luca-a-roma-59:s05": {
    ch: 59,
    text: "Ma quando la lancetta della pressione salì rapidamente verso il livello massimo, un sibilo acuto, stridente e strano ruppe bruscamente il silenzio della sala.",
    en: "But when the pressure needle rose rapidly toward maximum, a sharp, screeching, unusual hiss abruptly shattered the room's silence."
  },
  "luca-a-roma-59:s18": {
    ch: 59,
    text: "Il problema era chiaro ed evidente: la guarnizione di gomma che chiudeva il braccio della macchina si era spaccata a causa del calore e del lavoro continuo.",
    en: "The problem was clear and obvious: the rubber gasket sealing the machine's portafilter had cracked due to heat and continuous use."
  },
  "luca-a-roma-59:s27": {
    ch: 59,
    text: "Riavvitò il filtro d'acciaio con grande cura e controllò attentamente che ogni pezzo fosse perfettamente al suo posto.",
    en: "He screwed the steel shower screen back on with great care and checked thoroughly that every piece sat perfectly in its place."
  },
  "luca-a-roma-59:s30": {
    ch: 59,
    text: "Il rumore sordo e rassicurante della pompa riprese a riempire la sala, mentre la lancetta della pressione saliva gradualmente fino a fermarsi sul livello giusto, stabile e sicuro.",
    en: "The muffled, reassuring hum of the pump filled the room once more, as the pressure needle gradually climbed until settling at the right level, steady and secure."
  },
  // Ch 61
  "luca-a-roma-61:s13": {
    ch: 61,
    text: "«Viene coltivato in alta montagna da piccoli produttori in Etiopia.",
    en: "It is grown high in the mountains by small producers in Ethiopia."
  },
  "luca-a-roma-61:s18": {
    ch: 61,
    text: "Luca pesò con cura ventiquattro grammi di caffè, macinò i chicchi a grana media e sciacquò il filtro di carta con acqua calda per togliere ogni sapore residuo.",
    en: "Luca carefully weighed twenty-four grams of coffee, ground the beans to a medium consistency, and rinsed the paper filter with hot water to remove any residual taste."
  },
  "luca-a-roma-61:s19": {
    ch: 61,
    text: "Mentre versava l'acqua calda con il beccuccio sottile del bollitore con movimenti lenti e regolari, sentiva la tentazione di fare un lungo discorso per spiegare a Chiara tutti i dettagli della preparazione del caffè filtro.",
    en: "As he poured the hot water with the kettle's thin spout in slow, steady movements, he felt the temptation to deliver a long speech explaining all the details of pour-over coffee brewing to Chiara."
  },
  "luca-a-roma-61:s28": {
    ch: 61,
    text: "L'accoglienza autentica non consisteva nell'imporre la propria passione al cliente o nel pretendere continua attenzione per il proprio lavoro.",
    en: "Authentic hospitality did not consist in imposing one's passion on the customer or demanding constant attention for one's own work."
  },
  // Ch 62
  "luca-a-roma-62:s09": {
    ch: 62,
    text: "Luca preparò il tavolo di legno per un assaggio attento, posizionando tre tazze di vetro spesso, due cucchiai e un grande bollitore d'acqua ben calda.",
    en: "Luca set the wooden table for a careful tasting, placing three thick glass cups, two spoons, and a large kettle of hot water."
  },
  "luca-a-roma-62:s12": {
    ch: 62,
    text: "Prese un cucchiaio di caffè, lo assaggiò con attenzione e rimase in silenzio per diversi secondi, valutando il sapore con la fronte aggrottata.",
    en: "He took a spoonful of coffee, tasted it carefully, and stayed silent for several seconds, evaluating the flavor with a furrowed brow."
  },
  "luca-a-roma-62:s26": {
    ch: 62,
    text: "Regolò la macinatura su una grana leggermente più fine per rallentare il passaggio dell'acqua e lasciò raffreddare un poco il bollitore per non bruciare la polvere.",
    en: "He adjusted the grind slightly finer to slow down the flow of water and let the kettle cool a little so as not to scorch the grounds."
  },
  "luca-a-roma-62:s34": {
    ch: 62,
    text: "Esisteva invece l'abilità artigianale di adattarsi alla realtà quotidiana, interpretando i limiti della materia, del clima e del lavoro per trovare il migliore equilibrio possibile.",
    en: "There existed instead the artisanal skill of adapting to everyday reality, interpreting the limits of raw material, climate, and work to find the best possible balance."
  },
  // Ch 63
  "luca-a-roma-63:s16": {
    ch: 63,
    text: "«Grazie, ragazza mia, che gentilezza d'altri tempi,» mormorò Teresa, sospirando con sollievo mentre si sfregava le mani gelate dal freddo.",
    en: "Thank you, my dear girl, what old-fashioned kindness, Teresa murmured, sighing with relief as she rubbed her hands freezing from the cold."
  },
  "luca-a-roma-63:s39": {
    ch: 63,
    text: "Luca guardò la strada bagnata attraverso la vetrata e comprese che la vera forza di una scelta indipendente non stava nel chiudersi al mondo dentro un muro invalicabile.",
    en: "Luca looked at the wet street through the window and understood that the true strength of an independent choice did not lie in shutting oneself off from the world behind an impassable wall."
  },
  // Ch 64
  "luca-a-roma-64:s06": {
    ch: 64,
    text: "Poi premette il pulsante del dosatore, pesò diciotto grammi esatti di polvere, la sistemò con cura e pressò con il pressino di bronzo cercando di usare sempre la stessa forza.",
    en: "Then he pressed the dispenser button, weighed out exactly eighteen grams of grounds, arranged them carefully, and pressed down with the bronze tamper, trying to use the exact same pressure every time."
  },
  "luca-a-roma-64:s07": {
    ch: 64,
    text: "Avviò nuovamente la macchina, fissando la lancetta della pressione e i secondi sul cronometro con lo sguardo teso e la fronte corrucciata.",
    en: "He started the machine again, staring at the pressure gauge and the seconds on the timer with a tense gaze and furrowed brow."
  },
  "luca-a-roma-64:s13": {
    ch: 64,
    text: "Aveva osservato gli ultimi dieci minuti di quella battaglia solitaria con i dettagli e i grammi, notando la tensione crescente nelle spalle di Luca.",
    en: "She had watched the last ten minutes of that solitary battle with details and grams, noticing the growing tension in Luca's shoulders."
  },
  "luca-a-roma-64:s20": {
    ch: 64,
    text: "«Quando ero agli inizi, pensavo che tradurre significasse trovare una parola perfettamente identica per ogni singolo termine del testo originale francese.",
    en: "When I was starting out, I thought translating meant finding a perfectly identical word for every single term in the original French text."
  },
  "luca-a-roma-64:s26": {
    ch: 64,
    text: "«Se io prendessi la pialla e pretendessi di eliminare ogni singolo nodo, curva o sfumatura di colore da questa tavola d'olivo per renderla liscia come un pezzo di plastica, distruggerei la sua bellezza autentica.",
    en: "If I took a planer and tried to eliminate every single knot, curve, or color nuance from this olive board to make it smooth like a piece of plastic, I would destroy its authentic beauty."
  },
  "luca-a-roma-64:s29": {
    ch: 64,
    text: "Prese la prima tazzina — quella preparata pochi minuti prima e considerata sbagliata — e ne bevve un sorso con grande attenzione.",
    en: "He picked up the first cup—the one brewed a few minutes earlier and deemed a mistake—and took a sip with great focus."
  },
  "luca-a-roma-64:s42": {
    ch: 64,
    text: "Il mestiere non consisteva nel dominare tutto per piegarlo a una volontà rigida, ma nell'avere l'umiltà di ascoltare chi ti circonda, imparando che la vera eccellenza non è il controllo totale della perfezione, ma la capacità di vivere con la realtà.",
    en: "The craft did not consist in dominating everything to bend it to a rigid will, but in having the humility to listen to those around you, learning that true excellence is not total control over perfection, but the capacity to live with reality."
  },
  // Ch 65
  "luca-a-roma-65:s22": {
    ch: 65,
    text: "I loro sguardi si incrociarono sopra la folla, e Bruno sollevò leggermente il mento con un cenno chiaro e sicuro di approvazione.",
    en: "Their gazes met over the crowd, and Bruno slightly lifted his chin with a clear, steady nod of approval."
  }
};

// 1. Update English translations
const engPath = 'c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/sentence-english.json';
const eng = JSON.parse(fs.readFileSync(engPath, 'utf8'));
for (const [id, data] of Object.entries(sentenceUpdates)) {
  eng[id] = data.en;
}
fs.writeFileSync(engPath, JSON.stringify(eng, null, 2), 'utf8');

// 2. Update Italian sentence text in chapter files
const changedChapters = new Set();
for (const [id, data] of Object.entries(sentenceUpdates)) {
  changedChapters.add(data.ch);
}

for (const chNum of changedChapters) {
  const numStr = chNum < 10 ? `0${chNum}` : `${chNum}`;
  const p = `c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-${numStr}.json`;
  const ch = JSON.parse(fs.readFileSync(p, 'utf8'));

  for (const para of ch.paragraphs) {
    for (const s of para.sentences) {
      if (sentenceUpdates[s.id]) {
        s.text = sentenceUpdates[s.id].text;
      }
    }
  }

  fs.writeFileSync(p, JSON.stringify(ch, null, 2), 'utf8');
}

console.log('Applied natural language refactor to sentence texts and English translations.');
