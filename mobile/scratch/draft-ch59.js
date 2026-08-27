const fs = require('fs');

const paragraphs59 = [
  // p1
  [
    {
      id: 's01',
      text: "Mercoledì mattina alle sei e mezza, l'aria dentro lo Spazio Monti era ancora fresca, pungente e immersa nella penombra dell'alba.",
      speakerId: null,
      kind: 'narration',
      en: "Wednesday morning at half past six, the air inside Spazio Monti was still cool, sharp, and immersed in dawn's dim light."
    },
    {
      id: 's02',
      text: "Luca aveva aperto il laboratorio da dieci minuti e si muoveva tra il bancone e le macchine con la sicurezza metodica acquisita nelle ultime settimane.",
      speakerId: null,
      kind: 'narration',
      en: "Luca had opened the workshop ten minutes earlier and moved between the counter and machines with the methodical confidence gained over recent weeks."
    },
    {
      id: 's03',
      text: "La caldaia principale cominciava a scaldarsi lentamente, emettendo quel ronzio basso, profondo e regolare che segnava l'inizio rassicurante di ogni giornata lavorativa.",
      speakerId: null,
      kind: 'narration',
      en: "The main boiler was beginning to heat up slowly, emitting that low, deep, and regular hum that marked the reassuring start of each working day."
    },
    {
      id: 's04',
      text: "Tutto sembrava pronto per accogliere il flusso sostenuto dei pendolari delle otto: le tazzine erano impilate con ordine geometrico, le caraffe del latte fresco erano pronte nel frigorifero e i chicchi colombiani profumavano nel dosatore.",
      speakerId: null,
      kind: 'narration',
      en: "Everything seemed ready to welcome the steady flow of eight o'clock commuters: cups were neatly stacked in geometric order, fresh milk pitchers were ready in the fridge, and Colombian beans smelled fragrant in the doser."
    }
  ],
  // p2
  [
    {
      id: 's05',
      text: "Ma quando la lancetta metallica del manometro raggiunse gli otto bar e mezzo di pressione interna, un sibilo acuto, stridente e anomalo ruppe bruscamente il silenzio della sala.",
      speakerId: null,
      kind: 'narration',
      en: "But when the pressure gauge's metallic needle reached eight and a half bars of internal pressure, a sharp, screeching, and abnormal hiss abruptly broke the room's silence."
    },
    {
      id: 's06',
      text: "Prima che Luca potesse avvicinarsi al blocco d'ottone per controllare i raccordi, un getto violento e improvviso di vapore bollente fuoriuscì dal gruppo di erogazione sinistro.",
      speakerId: null,
      kind: 'narration',
      en: "Before Luca could approach the brass block to inspect the fittings, a violent, sudden jet of boiling steam burst from the left brew group."
    },
    {
      id: 's07',
      text: "L'acqua bollente mista a vapore si riversò sul piano di lavoro in castagno costruito da Marco, bagnando i panni asciutti e minacciando di colare sul pavimento della bottega.",
      speakerId: null,
      kind: 'narration',
      en: "Boiling water mixed with steam flooded across the chestnut counter built by Marco, soaking the dry cloths and threatening to drip onto the workshop floor."
    }
  ],
  // p3
  [
    {
      id: 's08',
      text: "Per un istante interminabile, il cuore di Luca batté all'impazzata contro il petto.",
      speakerId: null,
      kind: 'narration',
      en: "For an endless instant, Luca's heart raced wildly against his chest."
    },
    {
      id: 's09',
      text: "Mancavano appena quaranta minuti all'apertura ufficiale della porta a vetri e all'arrivo impaziente dei primi clienti abituali del rione Monti.",
      speakerId: null,
      kind: 'narration',
      en: "Barely forty minutes remained before the official opening of the glass door and the impatient arrival of the first regular customers of the Monti neighborhood."
    },
    {
      id: 's10',
      text: "Se la macchina fosse rimasta fuori uso per l'intera mattina, avrebbe dovuto annullare il servizio, sprecando l'incasso fondamentale della giornata e deludendo chi cominciava ad avere piena fiducia nel suo lavoro.",
      speakerId: null,
      kind: 'narration',
      en: "If the machine stayed out of order for the entire morning, he would have had to cancel service, wasting the day's essential revenue and disappointing those who were beginning to have full trust in his work."
    }
  ],
  // p4
  [
    {
      id: 's11',
      text: "Tuttavia, invece di farsi travolgere dal panico o di imprecare inutilmente contro la cattiva sorte, Luca respirò a fondo e ricordò gli insegnamenti pratici di Bruno.",
      speakerId: null,
      kind: 'narration',
      en: "However, instead of letting himself be overwhelmed by panic or cursing bad luck in vain, Luca took a deep breath and remembered Bruno's practical lessons."
    },
    {
      id: 's12',
      text: "La prima regola fondamentale durante un'emergenza tecnica era isolare immediatamente la fonte del problema per evitare danni irreparabili alla caldaia e all'impianto elettrico.",
      speakerId: null,
      kind: 'narration',
      en: "The first fundamental rule during a technical emergency was to immediately isolate the problem source to prevent irreparable damage to the boiler and electrical system."
    },
    {
      id: 's13',
      text: "Si chinò sotto il bancone e chiuse con decisione la valvola generale dell'acqua, poi spense l'interruttore della resistenza per consentire alla pressione interna di scendere rapidamente.",
      speakerId: null,
      kind: 'narration',
      en: "He bent under the counter and decisively closed the main water valve, then switched off the heating element to allow internal pressure to drop rapidly."
    }
  ],
  // p5
  [
    {
      id: 's14',
      text: "Il sibilo diminuì progressivamente fino a spegnersi del tutto, lasciando solo una nuvola densa di vapore profumato che saliva verso le volte di tufo del soffitto.",
      speakerId: null,
      kind: 'narration',
      en: "The hissing gradually subsided until it died away completely, leaving only a thick cloud of fragrant steam rising toward the tuff ceiling vaults."
    },
    {
      id: 's15',
      text: "Luca asciugò rapidamente il legno prezioso del bancone con uno straccio spesso per evitare che l'acqua caldissima macchiasse la superficie cerata con cura.",
      speakerId: null,
      kind: 'narration',
      en: "Luca quickly dried the counter's precious wood with a thick rag to prevent the very hot water from staining the carefully waxed surface."
    },
    {
      id: 's16',
      text: "Ora bisognava diagnosticare l'origine precisa del guasto senza perdere nemmeno un minuto prezioso prima dell'arrivo della gente.",
      speakerId: null,
      kind: 'narration',
      en: "Now he had to diagnose the precise origin of the breakdown without wasting even a single precious minute before people arrived."
    }
  ],
  // p6
  [
    {
      id: 's17',
      text: "Prese la torcia tascabile dalla tasca del grembiule e illuminò l'interno del gruppo d'erogazione in ottone massiccio.",
      speakerId: null,
      kind: 'narration',
      en: "He took his pocket flashlight from his apron pocket and illuminated the inside of the solid brass brewing group."
    },
    {
      id: 's18',
      text: "La diagnosi tecnica fu immediata e inequivocabile: la guarnizione circolare in silicone che sigillava il portafiltro si era spaccata lateralmente a causa dell'usura termica e della pressione continua.",
      speakerId: null,
      kind: 'narration',
      en: "The technical diagnosis was immediate and unmistakable: the circular silicone gasket sealing the portafilter had cracked on the side due to thermal wear and continuous pressure."
    },
    {
      id: 's19',
      text: "Era un anello piccolo e apparentemente insignificante, ma senza quella tenuta stagna l'acqua non poteva raggiungere la pressione ideale per estrarre l'espresso.",
      speakerId: null,
      kind: 'narration',
      en: "It was a small and seemingly insignificant ring, but without that watertight seal water could not reach the ideal pressure to extract espresso."
    }
  ],
  // p7
  [
    {
      id: 's20',
      text: "«Se non avessi fatto scorta di ricambi originali la settimana scorsa, adesso sarei in una situazione disperata,» pensò Luca tra sé mentre apriva la cassetta degli attrezzi di metallo.",
      speakerId: null,
      kind: 'narration',
      en: "“If I hadn't stocked up on genuine spare parts last week, I would be in a desperate situation right now,” thought Luca to himself as he opened his metal toolbox."
    },
    {
      id: 's21',
      text: "Nel cassetto inferiore conservava due guarnizioni nuove di diametro identico, comprate proprio seguendo il consiglio prudente che Bruno gli aveva dato durante i primi mesi di tirocinio a San Lorenzo.",
      speakerId: null,
      kind: 'narration',
      en: "In the bottom drawer he kept two new gaskets of identical diameter, bought precisely following the prudent advice Bruno had given him during his early apprenticeship months in San Lorenzo."
    },
    {
      id: 's22',
      text: "Un buon artigiano non aspetta mai che un componente meccanico ceda improvvisamente per procurarsi il ricambio necessario: prevede il logoramento dei materiali prima che si trasformi in una dolorosa interruzione del servizio quotidiano.",
      speakerId: null,
      kind: 'narration',
      en: "A good craftsman never waits for a mechanical component to suddenly fail before obtaining the necessary replacement: he anticipates material wear before it turns into a painful interruption of daily service."
    }
  ],
  // p8
  [
    {
      id: 's23',
      text: "Con un cacciavite a punta piatta e una pinza a becco sottile, Luca estrasse con estrema delicatezza e pazienza i frammenti della vecchia guarnizione indurita e deformata dal calore costante.",
      speakerId: null,
      kind: 'narration',
      en: "With a flathead screwdriver and needle-nose pliers, Luca extracted with extreme care and patience the fragments of the old gasket hardened and deformed by constant heat."
    },
    {
      id: 's24',
      text: "Pulì la sede circolare di ottone con uno spazzolino di rame morbido per rimuovere ogni residuo di calcare indurito e di polvere di caffè carbonizzata dal vapore.",
      speakerId: null,
      kind: 'narration',
      en: "He cleaned the circular brass seat with a soft copper brush to remove every residue of hardened limescale and coffee dust charred by steam."
    },
    {
      id: 's25',
      text: "Le sue dita si muovevano con rapidità ma senza fretta convulsa: sapeva benissimo che un errore di allineamento durante l'inserimento avrebbe compromesso irreparabilmente anche il pezzo nuovo di fabbrica.",
      speakerId: null,
      kind: 'narration',
      en: "His fingers moved swiftly but without frantic haste: he knew very well that an alignment error during insertion would irreparably compromise the brand-new factory part too."
    }
  ],
  // p9
  [
    {
      id: 's26',
      text: "Infilò la nuova guarnizione flessibile nella scanalatura circolare, spingendola a fondo con la parte piatta del portafiltro fino a sentire la perfetta aderenza elastica.",
      speakerId: null,
      kind: 'narration',
      en: "He inserted the new flexible gasket into the circular groove, pressing it deep with the flat part of the portafilter until feeling the perfect elastic fit."
    },
    {
      id: 's27',
      text: "Riavvitò la doccetta d'acciaio con precisione millimetrica e verificò attentamente che non ci fossero disallineamenti tra le superfici metalliche.",
      speakerId: null,
      kind: 'narration',
      en: "He screwed the steel shower screen back on with millimetric precision and carefully verified that there were no misalignments between the metal surfaces."
    },
    {
      id: 's28',
      text: "L'orologio a parete segnava le sette e dieci: gli restavano ancora venti minuti interi prima dell'apertura al pubblico del quartiere.",
      speakerId: null,
      kind: 'narration',
      en: "The wall clock showed ten past seven: twenty full minutes remained before opening to the neighborhood public."
    }
  ],
  // p10
  [
    {
      id: 's29',
      text: "Riaprì lentamente la valvola generale dell'acqua sotto il banco e riaccese l'interruttore della caldaia per verificare la tenuta complessiva dell'impianto sotto pressione crescente.",
      speakerId: null,
      kind: 'narration',
      en: "He slowly reopened the main water valve under the counter and switched the boiler back on to verify the overall system seal under increasing pressure."
    },
    {
      id: 's30',
      text: "Il rumore sordo e rassicurante della pompa riprese a riempire la sala, mentre la lancetta del manometro saliva gradualmente: quattro bar, sei bar, otto bar, fino a fermarsi esattamente a nove bar stabili e perfetti.",
      speakerId: null,
      kind: 'narration',
      en: "The dull and reassuring hum of the pump resumed filling the room, while the pressure gauge needle rose gradually: four bars, six bars, eight bars, until stopping exactly at a stable, perfect nine bars."
    },
    {
      id: 's31',
      text: "Non c'era alcun sibilo nell'aria della bottega, nessuna perdita di vapore e nemmeno una singola goccia d'acqua fuori posto sul bancone di legno.",
      speakerId: null,
      kind: 'narration',
      en: "There was no hiss in the workshop's air, no steam leak, and not even a single drop of water out of place on the wooden counter."
    }
  ],
  // p11
  [
    {
      id: 's32',
      text: "Per collaudare la riparazione in condizioni operative reali, macinò diciotto grammi esatti di chicchi colombiani e avviò una prima estrazione di prova nella tazzina di porcellana.",
      speakerId: null,
      kind: 'narration',
      en: "To test the repair under real operating conditions, he ground exactly eighteen grams of Colombian beans and started an initial test extraction into the porcelain cup."
    },
    {
      id: 's33',
      text: "Il caffè scese fluido, denso e regolare come miele caldo, formando una crema compatta color nocciola scuro con sottili riflessi dorati in superficie.",
      speakerId: null,
      kind: 'narration',
      en: "The coffee flowed smooth, dense, and regular like warm honey, forming a compact dark hazelnut crema with fine golden highlights on the surface."
    },
    {
      id: 's34',
      text: "Il guasto meccanico era stato completamente risolto in meno di venticinque minuti grazie alla preparazione preventiva dei ricambi, alla freddezza operativa e alla cura artigianale.",
      speakerId: null,
      kind: 'narration',
      en: "The mechanical breakdown had been completely resolved in under twenty-five minutes thanks to preventive spare parts preparation, operational cool-headedness, and craft care."
    }
  ],
  // p12
  [
    {
      id: 's35',
      text: "Alle sette e mezza esatte, il campanello sopra la porta d'ingresso suonò con il consueto tintinnio allegro, squillante e limpido.",
      speakerId: null,
      kind: 'narration',
      en: "At half past seven sharp, the bell above the entrance door chimed with its customary cheerful, ringing, and clear sound."
    },
    {
      id: 's36',
      text: "Entrò la signora Teresa con il suo cappotto pesante di lana, seguita da un impiegato che aveva fretta di ordinare un cappuccino prima di salire sul tram per raggiungere gli uffici del centro.",
      speakerId: null,
      kind: 'narration',
      en: "Signora Teresa walked in with her heavy wool coat, followed by an office worker in a rush to order a cappuccino before boarding the tram to reach downtown offices."
    },
    {
      id: 's37',
      text: "Nessuno dei clienti entrati poteva lontanamente immaginare che appena mezz'ora prima quel bancone lucido e accogliente fosse allagato da un getto violento d'acqua bollente.",
      speakerId: null,
      kind: 'narration',
      en: "None of the incoming customers could remotely imagine that barely half an hour earlier that polished and welcoming counter was flooded by a violent jet of boiling water."
    }
  ],
  // p13
  [
    {
      id: 's38',
      text: "Mentre serviva i primi espressi della mattina con un sorriso sereno e gesti misurati, Luca sentì una forma del tutto nuova di sicurezza professionale crescere dentro di sé.",
      speakerId: null,
      kind: 'narration',
      en: "As he served the morning's first espressos with a calm smile and measured motions, Luca felt an entirely new form of professional confidence growing inside him."
    },
    {
      id: 's39',
      text: "La vera maturità nel mestiere non consisteva nell'illudersi ingenuamente che le macchine non si rompessero mai o che gli imprevisti tecnici non accadessero durante il lavoro quotidiano.",
      speakerId: null,
      kind: 'narration',
      en: "True maturity in the craft did not consist in naively fooling oneself that machines would never break or that technical troubles would never happen during daily work."
    },
    {
      id: 's40',
      text: "Consisteva piuttosto nella capacità di affrontare il guasto senza perdere la calma, sapendo che la resilienza tecnica e la prontezza d'azione sono le compagne silenziose di ogni vera indipendenza artigianale.",
      speakerId: null,
      kind: 'narration',
      en: "It consisted rather in the capacity to face breakdowns without losing composure, knowing that technical resilience and promptness of action are the silent companions of every true artisanal independence."
    }
  ]
];

const totalWords59 = paragraphs59.flat().reduce((acc, s) => acc + s.text.split(/\s+/).filter(Boolean).length, 0);
console.log('Chapter 59 Final Tuned Word Count:', totalWords59);

module.exports = paragraphs59;
