const fs = require('fs');

const paragraphs60 = [
  // p1
  [
    {
      id: 's01',
      text: "Giovedì sera alle sette, dopo aver chiuso la bottega al pubblico, Luca e Claudia rimasero nella prima sala dello Spazio Monti per ridisegnare la disposizione complessiva dello spazio.",
      speakerId: null,
      kind: 'narration',
      en: "Thursday evening at seven, after closing the shop to the public, Luca and Claudia stayed in Spazio Monti's front room to redesign the overall layout of the space."
    },
    {
      id: 's02',
      text: "Fuori, i lampioni di Via dei Serpenti proiettavano ombre calde contro le pareti di tufo, mentre il traffico serale della capitale scorreva lento in lontananza lungo Via Nazionale.",
      speakerId: null,
      kind: 'narration',
      en: "Outside, the streetlamps of Via dei Serpenti cast warm shadows against the tuff walls, while the capital's evening traffic flowed slowly in the distance along Via Nazionale."
    },
    {
      id: 's03',
      text: "Sul tavolo di castagno non c'erano più bollette da temere: c'era una pianta dettagliata del locale disegnata a mano da Claudia con matite colorate e righello.",
      speakerId: null,
      kind: 'narration',
      en: "On the chestnut table there were no longer bills to fear: there was a detailed floor plan of the shop hand-drawn by Claudia with colored pencils and ruler."
    },
    {
      id: 's04',
      text: "Dopo la conversazione chiarificatrice con Bruno a San Lorenzo e la riparazione della macchina, Luca sentiva che era arrivato il momento di passare dall'ansia difensiva alla costruzione condivisa del futuro.",
      speakerId: null,
      kind: 'narration',
      en: "After the clarifying talk with Bruno in San Lorenzo and repairing the machine, Luca felt the time had come to move from defensive anxiety to shared construction of the future."
    }
  ],
  // p2
  [
    {
      id: 's05',
      text: "«Se vogliamo che questo progetto sia economicamente sostenibile senza sacrificare l'identità artigianale,» esordì Luca, indicando la zona centrale della piantina, «dobbiamo dare uno scopo preciso a ogni ora del giorno.",
      speakerId: 'luca',
      kind: 'dialogue',
      en: "“If we want this project to be economically sustainable without sacrificing artisanal identity,” began Luca, pointing to the floor plan's central area, “we must give a precise purpose to every hour of the day."
    },
    {
      id: 's06',
      text: "La mattina presto continueremo a gestire il flusso rapido dei pendolari al bancone con massima efficienza, velocità e rigore professionale.",
      speakerId: 'luca',
      kind: 'dialogue',
      en: "Early in the morning we will continue managing the commuters' rapid flow at the counter with maximum efficiency, speed, and professional rigor."
    },
    {
      id: 's07',
      text: "Ma dalle undici in poi, lo Spazio Monti deve trasformarsi in un rifugio accogliente per chi cerca silenzio, concentrazione e qualità senza la fretta dei bar tradizionali.»",
      speakerId: 'luca',
      kind: 'dialogue',
      en: "But from eleven onward, Spazio Monti must transform into a welcoming haven for those seeking silence, concentration, and quality without the rush of traditional bars.”"
    }
  ],
  // p3
  [
    {
      id: 's08',
      text: "Claudia sorrise con intesa profonda e prese un foglio bianco per annotare i punti fondamentali del nuovo patto operativo tra le loro due attività.",
      speakerId: null,
      kind: 'narration',
      en: "Claudia smiled with deep understanding and took a blank sheet to write down the fundamental points of the new operational pact between their two activities."
    },
    {
      id: 's09',
      text: "«Sono perfettamente d'accordo con la tua visione, Luca,» rispose mentre tracciava tre colonne distinte con precisione.",
      speakerId: 'claudia',
      kind: 'dialogue',
      en: "“I completely agree with your vision, Luca,” she replied while drawing three distinct columns with precision."
    },
    {
      id: 's10',
      text: "«Affinché la convivenza funzioni nel lungo periodo, è fondamentale che stabiliamo regole chiare di convivenza, orari precisi e una corretta suddivisione dello spazio comune tra il caffè e la ceramica.»",
      speakerId: 'claudia',
      kind: 'dialogue',
      en: "“In order for our cohabitation to work in the long run, it is fundamental that we establish clear rules of co-living, precise schedules, and proper division of shared space between coffee and ceramics.”"
    }
  ],
  // p4
  [
    {
      id: 's11',
      text: "Cominciarono a spostare insieme i mobili della prima sala per testare sul campo la nuova disposizione pratica e visiva.",
      speakerId: null,
      kind: 'narration',
      en: "Together they began moving the furniture in the front room to test in the field the new practical and visual arrangement."
    },
    {
      id: 's12',
      text: "Avvicinarono il grande tavolo di castagno alla vetrata principale per catturare tutta la luce naturale del pomeriggio che scendeva dalle vie storiche.",
      speakerId: null,
      kind: 'narration',
      en: "They moved the large chestnut table closer to the main window to catch all the natural afternoon light descending from the historic streets."
    },
    {
      id: 's13',
      text: "Aggiunsero quattro lampade da lettura in ottone, due prese elettriche protette per i computer portatili e una mensola di legno per esporre riviste d'arte, libri di architettura e testi dedicati al caffè.",
      speakerId: null,
      kind: 'narration',
      en: "They added four brass reading lamps, two protected power outlets for laptops, and a wooden shelf to display art magazines, architecture books, and coffee texts."
    },
    {
      id: 's14',
      text: "Il bancone del bar non era più una barriera rigida tra barista e cliente, ma diventava un punto aperto di incontro, di assaggio e di dialogo.",
      speakerId: null,
      kind: 'narration',
      en: "The bar counter was no longer a rigid barrier between barista and customer, but became an open point of meeting, tasting, and dialogue."
    }
  ],
  // p5
  [
    {
      id: 's15',
      text: "Poi definirono nei minimi dettagli il patto per la fascia oraria pomeridiana.",
      speakerId: null,
      kind: 'narration',
      en: "Then they defined the pact for the afternoon hours down to the smallest detail."
    },
    {
      id: 's16',
      text: "Dalle undici alle cinque e mezza, Luca avrebbe proposto estrazioni lente con filtro di carta e caraffa di vetro, accompagnate da schede descrittive che spiegavano l'altitudine, il processo di lavorazione e la varietà botanica di ogni raccolto.",
      speakerId: null,
      kind: 'narration',
      en: "From eleven to half past five, Luca would offer slow filter extractions with paper filters and glass carafes, accompanied by tasting cards explaining the altitude, processing method, and botanical variety of each harvest."
    },
    {
      id: 's17',
      text: "Chi si sedeva a lavorare o a studiare pagava un prezzo equo e trasparente per una caraffa che durava un'ora, garantendo al locale un margine utile dignitoso senza costringere nessuno ad andarsene con fretta.",
      speakerId: null,
      kind: 'narration',
      en: "Whoever sat down to work or study paid a fair, transparent price for a carafe that lasted an hour, guaranteeing the shop a dignified operating margin without forcing anyone to leave hastily."
    }
  ],
  // p6
  [
    {
      id: 's18',
      text: "Nella sala posteriore, separata da una tenda pesante di lino naturale che attutiva i rumori, Claudia avrebbe tenuto i suoi corsi pomeridiani di modellazione dell'argilla due volte alla settimana.",
      speakerId: null,
      kind: 'narration',
      en: "In the back room, separated by a heavy natural linen curtain that dampened sounds, Claudia would hold her afternoon clay modeling classes twice a week."
    },
    {
      id: 's19',
      text: "«Così uniamo le nostre energie e le nostre competenze,» osservò Claudia con evidente soddisfazione mentre rileggeva la bozza dell'accordo.",
      speakerId: 'claudia',
      kind: 'dialogue',
      en: "“This way we join our energies and our skills,” observed Claudia with evident satisfaction as she reread the draft agreement."
    },
    {
      id: 's20',
      text: "«I miei allievi assaggeranno il tuo caffè filtro durante le pause del laboratorio, e i tuoi clienti vedranno nascere dal vivo le tazzine di ceramica su cui serviamo ogni giorno le nostre bevande calde.»",
      speakerId: 'claudia',
      kind: 'dialogue',
      en: "“My students will taste your filter coffee during workshop breaks, and your customers will watch the ceramic cups in which we serve our hot drinks every day come to life right before their eyes.”"
    }
  ],
  // p7
  [
    {
      id: 's21',
      text: "Stabilirono anche regole chiare per la gestione amministrativa dei costi comuni e delle spese energetiche condivise.",
      speakerId: null,
      kind: 'narration',
      en: "They also established clear rules for administrative management of shared costs and communal utility expenses."
    },
    {
      id: 's22',
      text: "L'affitto del palazzo e le bollette dell'elettricità sarebbero stati divisi equamente ogni trenta giorni, creando contemporaneamente un piccolo fondo di riserva per le future manutenzioni delle attrezzature del bar e del forno della ceramica.",
      speakerId: null,
      kind: 'narration',
      en: "Building rent and electricity bills would be split equally every thirty days, simultaneously creating a small reserve fund for future maintenance of bar equipment and the ceramics kiln."
    },
    {
      id: 's23',
      text: "Entrambi sentivano che la collaborazione non rappresentava una rinuncia alla propria autonomia, ma l'unico strumento concreto per proteggerla e renderla duratura nel tempo.",
      speakerId: null,
      kind: 'narration',
      en: "Both felt that collaboration represented not a surrender of autonomy, but the only concrete tool to protect it and make it endure over time."
    }
  ],
  // p8
  [
    {
      id: 's24',
      text: "Venerdì pomeriggio alle tre, la nuova organizzazione dello Spazio Monti fu messa alla prova reale per la primissima volta.",
      speakerId: null,
      kind: 'narration',
      en: "Friday afternoon at three, Spazio Monti's new setup was put to real testing for the very first time."
    },
    {
      id: 's25',
      text: "Una luce dorata e obliqua entrava dalla grande vetrata ad arco, illuminando il legno caldo di castagno e i vasi smaltati esposti sulle mensole di pietra.",
      speakerId: null,
      kind: 'narration',
      en: "A golden, slanted light entered through the large arched window, illuminating the warm chestnut wood and glazed pottery displayed on stone shelves."
    },
    {
      id: 's26',
      text: "Al grande tavolo vicino alla finestra sedevano due studentesse universitarie con i loro testi d'esame e una ricercatrice che traduceva un manoscritto con le cuffie alle orecchie.",
      speakerId: null,
      kind: 'narration',
      en: "At the large table near the window sat two university students with their exam texts and a researcher translating a manuscript with headphones on."
    }
  ],
  // p9
  [
    {
      id: 's27',
      text: "Davanti a ciascuna di loro c'era una piccola caraffa di caffè filtro monorigine profumato e una tazza di ceramica artigianale modellata a mano da Claudia.",
      speakerId: null,
      kind: 'narration',
      en: "In front of each of them was a small carafe of fragrant single-origin filter coffee and an artisan ceramic cup handmade by Claudia."
    },
    {
      id: 's28',
      text: "Nella sala regnava una calma profonda, rilassante e produttiva, interrotta soltanto dal fruscio sommesso delle pagine sfogliate e dal gocciolio controllato dell'acqua calda attraverso il cono di porcellana.",
      speakerId: null,
      kind: 'narration',
      en: "In the room reigned a deep, relaxing, and productive calm, interrupted only by the quiet rustle of turned pages and the controlled dripping of hot water through the porcelain cone."
    },
    {
      id: 's29',
      text: "Dalla sala posteriore giungeva il rumore lieve e continuo del tornio di Claudia che modellava una nuova serie di ciotole d'argilla.",
      speakerId: null,
      kind: 'narration',
      en: "From the back room came the gentle, steady sound of Claudia's wheel shaping a new series of clay bowls."
    }
  ],
  // p10
  [
    {
      id: 's30',
      text: "Luca osservava la sala da dietro il bancone con un sentimento di profonda e intima gratitudine per il percorso fatto.",
      speakerId: null,
      kind: 'narration',
      en: "Luca observed the room from behind the counter with a feeling of deep, intimate gratitude for the journey traveled."
    },
    {
      id: 's31',
      text: "Quel tempo vuoto che pochi giorni prima gli sembrava una condanna economica insormontabile si era trasformato nel cuore pulsante dell'attività.",
      speakerId: null,
      kind: 'narration',
      en: "Those empty hours that just days earlier seemed an insurmountable financial curse had transformed into the business's beating heart."
    },
    {
      id: 's32',
      text: "I clienti non entravano più soltanto per consumare in fretta e fuggire: entravano per appartenere a uno spazio che rispettava i loro ritmi e offriva autentica bellezza quotidiana.",
      speakerId: null,
      kind: 'narration',
      en: "Customers no longer entered merely to consume in haste and flee: they entered to belong to a space that respected their rhythms and offered authentic everyday beauty."
    }
  ],
  // p11
  [
    {
      id: 's33',
      text: "Verso le quattro e mezza entrò Marco, portando sotto il braccio una cornice di legno grezzo appena levigata per lo specchio dell'ingresso.",
      speakerId: null,
      kind: 'narration',
      en: "Around half past four Marco walked in, carrying under his arm a freshly sanded raw wood frame for the entrance mirror."
    },
    {
      id: 's34',
      text: "Si fermò sulla soglia, si guardò intorno con sorpresa e mormorò con approvazione sincera: «Avete trovato la disposizione perfetta. Questo posto ha finalmente un'anima che respira senza affanno.»",
      speakerId: 'marco',
      kind: 'dialogue',
      en: "He stopped on the threshold, looked around with surprise, and murmured with genuine approval: “You found the perfect arrangement. This place finally has a soul that breathes without breathless panic.”"
    },
    {
      id: 's35',
      text: "Luca gli preparò un caffè al volo con il pressino di bronzo, sorridendo con totale serenità interiore per la prima volta dall'inizio dell'autunno.",
      speakerId: null,
      kind: 'narration',
      en: "Luca made him a coffee on the spot with the bronze tamper, smiling with total inner serenity for the first time since the start of autumn."
    }
  ],
  // p12
  [
    {
      id: 's36',
      text: "Alle cinque e mezza, mentre le prime ombre della sera scendevano sui tetti di Monti, Luca fece i conti dell'incasso pomeridiano sul suo quaderno a righe.",
      speakerId: null,
      kind: 'narration',
      en: "At half past five, as evening's first shadows fell over the roofs of Monti, Luca tallied the afternoon income in his lined notebook."
    },
    {
      id: 's37',
      text: "Le caraffe di estrazione lenta, le tisane biologiche e la quota del corso di ceramica avevano coperto ampiamente le spese dell'energia e generato un margine netto rispettabile.",
      speakerId: null,
      kind: 'narration',
      en: "Slow brew carafes, organic herbal teas, and the pottery class fee had comfortably covered energy costs and generated a respectable net margin."
    },
    {
      id: 's38',
      text: "Non c'era stato alcun bisogno di abbassare la qualità o di comprare chicchi scadenti: era bastato ascoltare i bisogni della clientela e ripensare con intelligenza l'uso del tempo e dello spazio.",
      speakerId: null,
      kind: 'narration',
      en: "There had been no need to lower quality or buy cheap beans: it had been enough to listen to customer needs and intelligently rethink the use of time and space."
    }
  ],
  // p13
  [
    {
      id: 's39',
      text: "Guardando Claudia che ripuliva il tornio con cura e il bancone che brillava di luce calda, Luca capì che il primo vero ostacolo della loro scelta era stato superato con successo.",
      speakerId: null,
      kind: 'narration',
      en: "Watching Claudia carefully clean the wheel and the counter glowing with warm light, Luca understood that the first true hurdle of their choice had been successfully overcome."
    },
    {
      id: 's40',
      text: "La domanda iniziale che lo tormentava dopo il primo mese — «Funziona davvero?» — aveva finalmente trovato una risposta solida, concreta e condivisa.",
      speakerId: null,
      kind: 'narration',
      en: "The initial question that had tormented him after the first month — “Does it really work?” — had finally found a solid, concrete, and shared answer."
    },
    {
      id: 's41',
      text: "Non era una vittoria definitiva, ma la prova tangibile che con pazienza, equilibrio, dialogo continuo e rispetto reciproco, la realtà poteva diventare la casa autentica del mestiere.",
      speakerId: null,
      kind: 'narration',
      en: "It was not a final victory, but tangible proof that with patience, balance, ongoing dialogue, and mutual respect, reality could become the authentic home of the craft."
    }
  ]
];

const totalWords60 = paragraphs60.flat().reduce((acc, s) => acc + s.text.split(/\s+/).filter(Boolean).length, 0);
console.log('Final Chapter 60 Words:', totalWords60);

module.exports = paragraphs60;
