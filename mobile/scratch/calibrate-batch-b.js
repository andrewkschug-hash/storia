const fs = require('fs');

// Load drafts
const draft61 = require('./draft-ch61.js');
const draft62 = require('./draft-ch62.js');
const draft63 = require('./draft-ch63.js');
const draft64 = require('./draft-ch64.js');
const draft65 = require('./draft-ch65.js');

// Tune Ch 61: expand paras 1, 6, 8, 10
draft61[0][0].text = "Venerdì mattina alle undici esatte, dopo che l'ondata frenetica e ininterrotta dei pendolari si era finalmente dissolta verso gli uffici di Via Nazionale, lo Spazio Monti entrò nella sua nuova dimensione di quiete e concentrazione.";
draft61[0][1].text = "La luce dorata dell'autunno filtrava obliqua attraverso la grande vetrata ad arco, disegnando rettangoli luminosi sul pavimento di cotto antico e scaldando la superficie del bancone di castagno levigato con cura da Marco.";
draft61[5][1].text = "Mentre versava l'acqua caldissima con il bollitore a collo di cigno in cerchi concentrici lenti, uniformi e regolari, sentiva una naturale tentazione di preparare un lungo discorso descrittivo per spiegare a Chiara tutti i dettagli tecnici della curva di percolazione.";
draft61[7][0].text = "Luca appoggiò con estrema delicatezza la caraffa di vetro e la tazza sul sottobicchiere di legno d'olivo, pronto a illustrare il tempo esatto di infusione e il momento ideale per degustare il primo sorso aromatico.";
draft61[9][0].text = "Tornò silenziosamente dietro il bancone di castagno, respirando a fondo e riprendendo il suo lavoro metodico di manutenzione e pulizia con un atteggiamento completamente rinnovato.";

// Tune Ch 62: expand paras 1, 3, 7, 8
draft62[0][0].text = "Sabato pomeriggio verso le due, mentre una brezza fresca e umida spazzava i vicoli acciottolati e storici del rione Monti, Marco entrò allo Spazio Monti portando sotto il braccio un sacchetto di tela grezza legato saldamente con uno spago di canapa naturale.";
draft62[2][0].text = "Luca preparò il tavolo di castagno per un assaggio tecnico alla brasiliana, posizionando tre ciotole di vetro spesso, due cucchiai d'argento specifici per il cupping professionale e un grande bollitore d'acqua purificata a novantatré gradi centigradi esatti.";
draft62[6][1].text = "«Se la tostatura ha sviluppato meno zuccheri a causa dell'umidità dell'aria, possiamo abbassare la temperatura dell'acqua a novantuno gradi per attenuare l'acidità troppo aggressiva e prolungare il tempo di contatto per estrarre le note più dolci, rotonde e profonde del chicco.»";
draft62[7][0].text = "Regolò la ghiera della macinatura su una grana leggermente più fine per aumentare la resistenza idraulica del letto di caffè e impostò il bollitore a collo di cigno sulla nuova temperatura ridotta.";

// Tune Ch 63: expand paras 1, 2, 6, 8, 10, 12
draft63[0][0].text = "Martedì pomeriggio verso le cinque, il cielo sopra la capitale si oscurò improvvisamente in pochi minuti, tingendosi di un grigio piombo cupo, denso e minaccioso che cancellò ogni traccia della luce dorata autunnale.";
draft63[1][0].text = "La porta a vetri della bottega si aprì di colpo con impeto, lasciando entrare una decina di persone sorprese dalla violenza della bufera lungo la via: passanti bagnati fradici, due giovani fattorini in bicicletta con mantelle gocciolanti e residenti storici del quartiere carichi di buste della spesa.";
draft63[5][0].text = "Luca non perse nemmeno un secondo prezioso: accese entrambi i grandi bollitori d'acciaio e preparò due caraffe capienti di caffè filtro caldissimo, usando una miscela dolce e corposa con note aromatiche di nocciola tostata e cioccolato al latte.";
draft63[5][1].text = "Contemporaneamente, mise in infusione sul fuoco una grande brocca di tisana speziata con cannella, zenzero fresco e scorze d'arancia biologica, il cui vapore profumato si diffuse rapidamente in tutta la sala, scacciando l'odore acre di umidità e pioggia fredda.";
draft63[7][2].text = "La barriera invisibile di diffidenza e silenzio che spesso separa gli sconosciuti in una grande metropoli si sciolse del tutto sotto l'effetto del calore avvolgente, del profumo del caffè e del tepore condiviso.";
draft63[9][1].text = "Quello spazio, nato pochi mesi prima tra mille incertezze economiche, paure personali e dubbi logistici, era diventato nel tempo molto più di un semplice laboratorio di caffè artigianale e ceramica contemporanea.";
draft63[11][1].text = "Prima di andarsene, ciascuno volle passare dal bancone per ringraziare di cuore Luca e Claudia per l'accoglienza, lasciando spontaneamente un'offerta generosa nel barattolo delle mance per ricambiare la calda ospitalità ricevuta.";

// Tune Ch 64: expand paras 1, 3, 6, 8
draft64[0][0].text = "Giovedì pomeriggio alle tre, lo Spazio Monti era completamente avvolto in un silenzio operoso e rassicurante, rischiarato dalla luce limpida, tersa e autunnale che filtrava dopo i temporali intensi dei giorni precedenti.";
draft64[2][1].text = "Emise un sospiro visibilmente frustrato, buttò via la pastiglia di caffè esausta nel cassetto battifiltro con un colpo secco e prese la penna per cancellare l'ennesima riga di appunti meticolosi.";
draft64[5][3].text = "«Ma il risultato finale era un testo rigido, freddo, artificioso e privo di vita: per inseguire l'illusione ostinata del controllo totale, avevo soffocato il ritmo naturale e l'anima autentica della narrazione.»";
draft64[7][1].text = "Prese la prima tazzina — quella estratta in ventisette secondi e mezzo che pochi minuti prima aveva bollato con severità inflessibile come difettosa e inadeguata — e ne bevve un sorso estremamente attento e concentrato.";

// Tune Ch 65: expand paras 1, 2, 4, 6, 8, 10, 12, 13
draft65[0][0].text = "Venerdì sera alle sei e mezza, l'aria lungo i vicoli storici di Via dei Serpenti era frizzante, limpida e festosa, profumata di caldarroste arrostite all'angolo della strada e di pietra lavata dalle ultime piogge autunnali.";
draft65[1][0].text = "Claudia aveva disposto con ordine e cura meticolosa le sue nuove serie di tazze da espresso in gres smaltato, con tonalità terrose e calde che sfumavano dal verde salvia al blu notte profondo, ciascuna modellata interamente a mano al tornio.";
draft65[1][1].text = "Accanto alle ceramiche lucide, Marco aveva fornito una serie di eleganti sottotazza in legno di castagno e olivo intagliati con forme geometriche essenziali, levigati con cera d'api naturale che sprigionava un profumo morbido, pulito e legnoso.";
draft65[3][0].text = "Verso le sette in punto, lo Spazio Monti era gremito di persone entusiaste: studenti universitari, artigiani delle botteghe vicine, ricercatori che frequentavano il grande tavolo pomeridiano e residenti storici del quartiere Monti.";
draft65[5][1].text = "Sulla soglia della bottega illuminata comparve una figura familiare e inconfondibile, con il suo cappotto scuro di panno pesante e la consueta coppola di lana grigia calzata con sobria eleganza sulla testa.";
draft65[7][2].text = "Bruno prese la tazzina con le sue mani nodose e calme, assaggiò il caffè senza zucchero, lasciando che il liquido caldo gli scaldasse il palato, poi si guardò di nuovo intorno con uno sguardo colmo di memoria prima di parlare.";
draft65[9][1].text = "Claudia, Marco, Chiara e Luca rimasero insieme nella bottega finalmente tranquilla, brindando con un bicchiere di vino bianco fresco dei Castelli Romani per festeggiare il successo straordinario dell'iniziativa.";
draft65[11][2].text = "Dall'esterno della via, con quel punto di vista diverso, distaccato e sereno, la scena dentro la bottega appariva straordinariamente nitida, viva, solida, accogliente e densa di significato umano.";
draft65[12][3].text = "Guardando la luce calda che illuminava l'antico lastricato di Roma e rifletteva sui muri di tufo, comprese finalmente che il suo mestiere non era una dimostrazione d'orgoglio individuale, ma un ponte prezioso, solido e duraturo per appartenere a una vera comunità umana.";

// Write back calibrated drafts
fs.writeFileSync('./scratch/draft-ch61.js', 'const paragraphs61 = ' + JSON.stringify(draft61, null, 2) + ';\nmodule.exports = paragraphs61;\n', 'utf8');
fs.writeFileSync('./scratch/draft-ch62.js', 'const paragraphs62 = ' + JSON.stringify(draft62, null, 2) + ';\nmodule.exports = paragraphs62;\n', 'utf8');
fs.writeFileSync('./scratch/draft-ch63.js', 'const paragraphs63 = ' + JSON.stringify(draft63, null, 2) + ';\nmodule.exports = paragraphs63;\n', 'utf8');
fs.writeFileSync('./scratch/draft-ch64.js', 'const paragraphs64 = ' + JSON.stringify(draft64, null, 2) + ';\nmodule.exports = paragraphs64;\n', 'utf8');
fs.writeFileSync('./scratch/draft-ch65.js', 'const paragraphs65 = ' + JSON.stringify(draft65, null, 2) + ';\nmodule.exports = paragraphs65;\n', 'utf8');

console.log('Calibrated all Batch B drafts.');
