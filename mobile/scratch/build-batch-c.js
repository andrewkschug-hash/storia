const fs = require('fs');

// CHAPTER 66: L'identità del quartiere
const ch66_paras = [
  [
    "Novembre era arrivato a Roma con un’aria fresca e frizzante che spazzava via le ultime tracce dell’estate dai vicoli stretti del rione Monti.",
    "Ogni mattina alle sette, quando Luca apriva la pesante porta a vetri di Spazio Monti e accendeva le luci calde del laboratorio, sentiva il quartiere svegliarsi con i suoi ritmi antichi, lenti e rassicuranti.",
    "C’erano i furgoni delle consegne che scaricavano con rumore le cassette di frutta e verdura davanti ai negozi, i passi svelti degli operai diretti verso la vicina fermata della metropolitana e il profumo familiare di pane caldo che usciva dal forno all’angolo della strada.",
    "Per Luca, quel momento dell'alba era diventato il rito più prezioso della giornata, un tempo silenzioso in cui preparare gli strumenti e respirare l’anima viva della città."
  ],
  [
    "Nelle prime settimane dopo l'inaugurazione, Luca aveva immaginato con entusiasmo che tutti i residenti del quartiere avrebbero accolto subito le sue selezioni di caffè dolce e floreale.",
    "Ben presto, tuttavia, la realtà quotidiana del rione gli aveva mostrato con chiarezza che le abitudini delle persone erano radicate in decenni di gesti rapidi, gusti forti e tradizioni familiari.",
    "Molti clienti storici entravano al mattino con una fretta evidente, chiedevano un espresso al volo al bancone, bevevano in un solo sorso e lasciavano una moneta da un euro sul piattino prima di correre via verso il lavoro.",
    "Non avevano né il tempo né il desiderio di ascoltare spiegazioni sulle origini dei chicchi o sui metodi di coltivazione in alta quota."
  ],
  [
    "Il signor Sergio, un pensionato che aveva gestito per oltre quarant’anni una tipografia artigianale in via dei Serpenti, era il cliente più severo, fedele e abitudinario del mattino.",
    "Entrava puntualmente alle sette e un quarto con il giornale sotto il braccio, salutava con un cenno appena accennato del capo e pretendeva un caffè bollente, forte e amaro.",
    "Quando Luca gli aveva servito per la prima volta un caffè leggero, Sergio aveva fatto una smorfia evidente di delusione e aveva scosso la testa con disappunto sincero.",
    "«Questo non è il caffè che mi dà la forza per iniziare la giornata,» aveva mormorato con tono schietto."
  ],
  [
    "«Ragazzo mio, il caffè per noi romani è una scossa d'energia rapida e decisa, non un tè leggero da sorseggiare leggendo un libro di poesie,» gli aveva detto Sergio appoggiando la tazzina vuota sul bancone con un sospiro pesante.",
    "«Rispetto la tua passione giovanile per le novità, ma l’espresso vero deve avere corpo, sostanza e carattere, altrimenti sembra un'invenzione per turisti stranieri.»",
    "Luca, che all’inizio era tentato di difendere con orgoglio la superiorità delle sue selezioni delicate, aveva ripensato alle parole di Bruno sulla necessità di ascoltare le persone prima di pretendere di educarle.",
    "Capì che l'arroganza tecnica era il peggior nemico di un artigiano che desidera costruire qualcosa di duraturo nel tempo."
  ],
  [
    "Invece di offendersi o considerare Sergio un cliente antiquato e chiuso alle novità, Luca decise di trasformare quella critica schietta in una preziosa opportunità di crescita.",
    "L’identità di un rione storico come Monti non poteva essere cancellata o sostituita dall’oggi al domani con una moda moderna.",
    "Se Spazio Monti voleva diventare una casa autentica per tutta la comunità, doveva saper accogliere con rispetto sia chi cercava un momento di studio rilassato sia chi desiderava semplicemente il proprio espresso quotidiano al banco.",
    "Il vero mestiere artigianale consisteva nel costruire ponti di fiducia tra mondi diversi, senza giudicare e senza imporre nulla con superiorità."
  ],
  [
    "Nel corso delle settimane successive, Luca si era messo al lavoro con pazienza per creare una speciale miscela della casa dedicata al quartiere.",
    "Aveva unito una base dolce e corposa di caffè brasiliano naturale con una piccola percentuale di chicchi tostati con maggiore intensità da Marco, per donare al caffè una rotondità avvolgente e note piene di cioccolato fondente e nocciola.",
    "Era una ricetta studiata per offrire un sapore ricco, deciso e rassicurante, ma perfettamente pulito e privo di qualunque sgradevole sentore di bruciato.",
    "Voleva dimostrare che si poteva rispettare la tradizione romana del caffè forte e corposo senza rinunciare alla qualità della materia prima e alla cura meticolosa della preparazione."
  ],
  [
    "Un giovedì mattina di fine novembre, quando Sergio è entrato come al solito con la sciarpa di lana ben stretta al collo, Luca gli ha sorriso dietro al bancone e ha scaldato la tazzina con gesti calmi e sicuri.",
    "«Signor Sergio, oggi ho preparato una miscela nuova pensata proprio per chi ama un espresso deciso, corposo e sincero: mi farebbe davvero molto piacere conoscere la sua opinione onesta,» gli ha detto porgendogli il piattino.",
    "Sergio ha guardato la crema scura, densa e compatta con un misto di curiosità e naturale diffidenza, ha soffiato leggermente sulla superficie calda e ha bevuto il primo sorso lentamente in silenzio.",
    "Luca ha trattenuto il respiro per un istante, osservando l'espressione attenta sul viso segnato del vecchio tipografo."
  ],
  [
    "Per diversi secondi nella bottega si è sentito soltanto il rumore sommesso della pialla di Marco che lavorava il legno in fondo alla sala.",
    "Poi Sergio ha appoggiato la tazzina sul piattino d'acciaio, si è pulito le labbra con il tovagliolo di carta e un sorriso inaspettato e sincero gli ha illuminato gli occhi chiari.",
    "«Ecco, ragazzo mio, questo ha carattere, forza e sostanza vera,» ha ammesso Sergio con voce calda e distesa. «È deciso e forte come piace a me, ma lascia in bocca un sapore pulito di cioccolato invece di quell’amaro cattivo che ti rovina la mattinata. Adesso cominciamo davvero a capirci.»",
    "Ha lasciato una moneta da due euro sul banco e ha salutato con una stretta di mano calorosa prima di uscire nella strada ventilata."
  ],
  [
    "Quell’approvazione semplice e schietta è stata per Luca una vittoria professionale più gratificante di qualsiasi complimento teorico.",
    "Giorno dopo giorno, Spazio Monti ha iniziato a vedere una convivenza spontanea e armoniosa tra persone con vite e abitudini completamente differenti.",
    "Al tavolo grande in fondo, Chiara e altri studenti leggevano e traducevano testi con le loro caraffe di caffè filtro preparate con calma, mentre al bancone d’ingresso gli artigiani del quartiere si scambiavano battute veloci sorseggiando la nuova miscela della casa.",
    "I due mondi, che all'inizio sembravano separati da una distanza incolmabile, avevano trovato un punto d'incontro naturale intorno al calore della bottega."
  ],
  [
    "Mentre sistemava una serie di nuove ciotole di ceramica appena uscite dal forno sugli scaffali di legno, Claudia ha osservato la sala gremita e ha sorriso a Luca con intesa affettuosa.",
    "«Hai notato come è cambiata l’atmosfera da quando hai smesso di preoccuparti di dover dimostrare la tua bravura a tutti i costi?» gli ha chiesto a voce bassa mentre asciugava un vaso.",
    "«Prima sembravi un professore severo che voleva correggere gli errori di tutti; adesso sei un oste accogliente che apre le porte di casa propria agli amici, e la gente del quartiere lo percepisce subito con il cuore.»",
    "Luca ha annuito, riconoscendo quanto quella semplice verità avesse trasformato non soltanto il suo lavoro, ma anche la sua serenità interiore."
  ],
  [
    "Anche Marco, uscendo dal suo laboratorio con il grembiule grigio coperto di segatura per bere un bicchiere d’acqua fresca, ha confermato quella riflessione comune.",
    "«Il legno e le persone di un quartiere antico funzionano allo stesso modo: non puoi forzarli a cambiare direzione dall’oggi al domani con la presunzione,» ha detto appoggiandosi al bancone.",
    "«Devi prima ascoltare la loro storia, comprendere le loro resistenze naturali, e solo allora puoi proporre una novità senza spezzare l’equilibrio dell'insieme.»",
    "Le sue parole hanno confermato a Luca che l'artigianato autentico era una forma profonda di dialogo umano, non un esercizio solitario di perfezionismo."
  ],
  [
    "Verso le sette e mezza di sera, quando l’ultimo cliente ha salutato con affetto ed è uscito nella strada illuminata dai lampioni dorati, Luca ha iniziato a pulire con calma il piano di lavoro.",
    "Ha lavato i portafiltri con acqua bollente, ha asciugato le superfici di metallo con uno strofinaccio pulito e ha controllato con precisione il registro di cassa della giornata.",
    "I numeri confermavano che la scelta di accogliere tutto il quartiere senza pregiudizi stava portando stabilità finanziaria, clienti affezionati e una fiducia reciproca che cresceva ogni giorno di più.",
    "Spazio Monti non era più un esperimento fragile e incerto, ma un punto di riferimento solido e riconosciuto nella vita quotidiana del rione."
  ],
  [
    "Guardando fuori dalla vetrata i vicoli acciottolati che scendevano dolcemente verso la basilica di Santa Maria Maggiore, Luca ha provato un senso limpido di pace e gratitudine profonda.",
    "Non era più il ragazzo timido e spaventato arrivato da Pietralba con una vecchia valigia e il timore costante di fallire nella grande metropoli.",
    "Adesso capiva con certezza che integrarsi a Roma non significava perdere le proprie radici o piegarsi al compromesso, ma costruire con pazienza e rispetto un ponte vivo tra la saggezza della tradizione e il coraggio del futuro.",
    "Era pronto ad affrontare i mesi freddi dell'inverno con la consapevolezza matura di chi ha finalmente trovato la propria casa nel mondo."
  ]
];

// CHAPTER 67: La prova dell'inverno
const ch67_paras = [
  [
    "Dicembre portò su Roma un freddo umido e pungente che scendeva dalle colline circostanti e si infilava nei vicoli ombrosi del rione Monti.",
    "Le giornate si erano accorciate rapidamente, e alle cinque del pomeriggio il cielo sopra i tetti di terracotta assumeva già una sfumatura scura e gelida.",
    "Con l'arrivo dell'inverno, il flusso continuo di passanti e visitatori occasionali che riempiva le strade durante l'autunno si ridusse drasticamente, lasciando la piazza deserta e silenziosa.",
    "Per Luca, Claudia e Marco, quella svolta stagionale rappresentava la prima vera prova di resistenza economica per il loro laboratorio condiviso."
  ],
  [
    "Le prime due settimane del mese misero subito in evidenza una realtà finanziaria impegnativa e preoccupante.",
    "Le spese vive per il riscaldamento dell'intero locale, la bolletta elettrica per i forni di ceramica e i consumi costanti della macchina del caffè erano aumentati in modo considerevole.",
    "Allo stesso tempo, gli incassi giornalieri del bancone avevano subito un calo sensibile nelle ore centrali della giornata, quando il freddo scoraggiava le persone dall'uscire di casa per una passeggiata.",
    "La domenica sera, controllando il quaderno dei conti insieme a Claudia, Luca sentì riaffiorare per un istante l'ansia antica che lo aveva tormentato nei primi mesi di apertura."
  ],
  [
    "«Se continuiamo con questo ritmo per tutto gennaio e febbraio, i nostri margini di sicurezza si azzereranno rapidamente,» disse Luca con voce seria, mostrando le colonne di cifre sul tavolo.",
    "«Le spese fisse non diminuiscono con il freddo, anzi aumentano, e non possiamo permetterci di consumare tutti i risparmi accumulati durante l'autunno.»",
    "Claudia ascoltò con attenzione, osservando i numeri con sguardo calmo e riflessivo prima di rispondere con decisione serena.",
    "«L'inverno è sempre una stagione difficile per gli artigiani, Luca, ma non dobbiamo lasciarci prendere dal panico né chiuderci nella difensiva come se fossimo vittime degli eventi.»"
  ],
  [
    "«Quando la gente non entra spontaneamente dalla strada, dobbiamo essere noi a offrire un motivo speciale per venire a trovarci,» propose Claudia versando una tisana calda per tutti.",
    "«Perché non organizziamo una serie di serate a tema nei fine settimana, combinando degustazioni guidate di caffè, laboratori pratici di ceramica e piccole dimostrazioni di falegnameria?»",
    "Marco, che stava ripulendo un banco da lavoro con la scopa, si voltò subito con gli occhi illuminati dall'idea.",
    "«Possiamo creare dei corsi brevi per piccoli gruppi: io insegno a lavorare piccoli oggetti di legno per la casa, Claudia mostra le basi del modellato dell'argilla, e Luca guida l'assaggio dei caffè del mondo con i dolci tradizionali.»"
  ],
  [
    "L'idea prese forma rapidamente nei giorni successivi con un entusiasmo contagioso che scacciò ogni traccia di scoraggiamento dal laboratorio.",
    "Decisero di chiamare l'iniziativa 'I Sabati d'Inverno a Spazio Monti', stampando semplici cartoncini informativi su carta riciclata da distribuire nei negozi del quartiere e nelle librerie vicine.",
    "La proposta era accessibile, calda e accogliente: due ore nel tardo pomeriggio per imparare un mestiere manuale, chiacchierare al caldo davanti a una bevanda profumata e condividere un'esperienza autentica.",
    "Nel giro di quarantotto ore dall'annuncio, tutti i posti disponibili per i primi tre appuntamenti di dicembre andarono completamente esauriti."
  ],
  [
    "Il primo sabato pomeriggio, mentre fuori una pioggia gelida batteva contro i vetri delle finestre, Spazio Monti si trasformò in un nido operoso e luminoso di calore umano.",
    "Dodici partecipanti di età diverse — residenti del quartiere, giovani insegnanti, studenti e una coppia di artigiani in pensione — si raccolsero intorno al grande tavolo di legno massiccio.",
    "Claudia distribuì a ciascuno un panetto di argilla fresca e spiegò con pazienza i primi movimenti per modellare una ciotola semplice con le mani, guidando le dita inesperte con dolcezza e sicurezza.",
    "Le risate e i commenti spontanei riempirono subito la stanza, sciogliendo ogni imbarazzo iniziale in un clima fraterno e sereno."
  ],
  [
    "Poco dopo, Marco prese la parola per mostrare come levigare una tavoletta di legno d'ulivo con la carta vetrata fine, spiegando come valorizzare le venature naturali senza rovinarne la fibra.",
    "I partecipanti ascoltavano affascinati, toccando le superfici ruvide che sotto la guida esperta di Marco diventavano lisce e setose al tatto.",
    "Luca osservava la scena con emozione, preparando nel frattempo tre diverse caraffe di caffè filtro proveniente da piccoli raccolti sostenibili dell'America Centrale e dell'Africa.",
    "Aveva preparato anche una torta casalinga alle mele e cannella, il cui profumo dolce si mescolava all'aroma del legno tagliato e della terra umida."
  ],
  [
    "Quando arrivò il momento dell'assaggio guidato, Luca non usò parole difficili o formule tecniche da manuale, ma parlò con semplicità e passione sincera.",
    "Spiegò come il clima di montagna influenzi la maturazione del frutto, perché un caffè raccolto a mano abbia una dolcezza naturale più ricca e come l'acqua calda estragga aromi diversi a seconda del tempo di contatto.",
    "I partecipanti assaggiavano con curiosità, confrontando le loro impressioni con naturalezza: chi sentiva note di cioccolato fondente, chi un profumo di fiori d'arancio, chi la freschezza degli agrumi.",
    "«Non avevo mai capito che il caffè potesse avere così tante sfumature diverse,» commentò una signora anziana con gli occhi pieni di meraviglia sincera."
  ],
  [
    "Alla fine della serata, nessuno dei partecipanti sembrava avere fretta di rivestirsi e tornare nel freddo della strada.",
    "Molti acquistarono un sacchetto di chicchi macinati freschi per la domenica mattina, altri ordinarono un set di tazze da regalare per Natale, e tutti chiesero di potersi iscrivere ai corsi del mese successivo.",
    "Quando l'ultimo ospite uscì salutando calorosamente, i tre amici si guardarono attorno nel laboratorio disordinato ma colmo di energia positiva.",
    "Il bilancio economico della sola serata aveva coperto per intero le spese di riscaldamento ed elettricità dell'intera settimana."
  ],
  [
    "«Questa non è soltanto una soluzione temporanea per pagare le bollette dell'inverno,» disse Marco versandosi una tazza di caffè avanzato e sedendosi su uno sgabello.",
    "«Questo è il modo migliore per far capire alla gente cosa facciamo qui ogni giorno: non vendiamo semplici oggetti o bevande, ma offriamo tempo, competenza e uno spazio per stare bene insieme.»",
    "Claudia annuì con convinzione, sistemando gli attrezzi sui ganci della parete.",
    "«L'inverno ci ha costretti a superare la pigrizia e a inventare qualcosa che non avremmo mai fatto se le cose fossero state facili e comode fin dall'inizio.»"
  ],
  [
    "Luca ripensò con lucidità a quanto era accaduto e comprese che le difficoltà operative non erano incidenti di percorso da temere, ma lezioni preziose per rafforzare la struttura del progetto.",
    "Se la prova dell'autunno era stata imparare a gestire il flusso rapido dei clienti al bancone, la prova dell'inverno gli aveva insegnato a non dipendere dalla fortuna meteorologica o dalle abitudini passive.",
    "La resilienza economica di un'attività artigianale nasceva dalla capacità di creare valore autentico e relazioni umane durature, capaci di resistere al gelo e al calo delle vendite.",
    "Spazio Monti non era più un semplice negozio al dettaglio, ma un laboratorio vivo che sapeva reinventarsi continuamente in risposta alle sfide del tempo."
  ],
  [
    "Nelle settimane che precedettero il Natale, le serate del sabato diventarono un appuntamento fisso e desiderato per decine di residenti del quartiere.",
    "Anche nei giorni infrasettimanali più freddi e piovosi, le persone entravano a Spazio Monti per cercare il calore familiare della bottega, fare due chiacchiere e fermarsi a leggere un capitolo di un libro.",
    "Il registratore di cassa rifletteva una salute economica stabile e robusta, con margini sufficienti a garantire la serenità del laboratorio per tutti i mesi invernali a venire.",
    "Luca sentiva che la cooperazione tra i loro tre mestieri diversi era diventata la loro più grande forza competitiva e umana."
  ],
  [
    "La vigilia di Natale, chiudendo la bottega dopo una giornata piena di sorrisi, auguri sinceri e piccoli regali scambiati con i vicini, Luca si fermò per qualche istante sotto la luce fredda della luna.",
    "I vicoli di Monti erano illuminati a festa, con ghirlande verdi sui portoni e le finestre addobbate che riflettevano una luce accogliente sui sanpietrini bagnati.",
    "Sentiva dentro di sé una forza calma, solida e indistruttibile, nata dalla consapevolezza di aver superato la prova più difficile insieme a compagni fidati e generosi.",
    "Guardò il cielo limpido sopra Roma e sorrise, sapendo che l'anno nuovo avrebbe portato nuove sfide, ma che nessuna tempesta avrebbe più potuto spegnere il fuoco acceso nel suo cuore."
  ]
];

// CHAPTER 68: La proposta di Bruno
const ch68_paras = [
  [
    "Gennaio portò su Roma una luce limpida e fredda che faceva risplendere il travertino antico dei monumenti sotto un cielo di un azzurro trasparente.",
    "Dopo il successo delle iniziative invernali e la stabilità economica raggiunta a dicembre, Spazio Monti aveva trovato un ritmo di lavoro costante, ordinato e sereno.",
    "Luca apriva la bottega con una sicurezza interiore che non aveva mai conosciuto prima, muovendosi dietro al bancone con gesti precisi, naturali e privi di qualunque ansia da prestazione.",
    "Il quartiere ormai lo considerava uno di famiglia, e il laboratorio condiviso era diventato un punto di riferimento per l'intero rione."
  ],
  [
    "Un martedì pomeriggio, verso le quattro, la campanella della porta a vetri trillò con il suo suono chiaro e familiare.",
    "Luca sollevò lo sguardo e vide entrare Bruno, vestito con il suo cappotto di lana scura e la sciarpa di seta che portava sempre nelle occasioni importanti.",
    "L'anziano proprietario del Bar Centrale camminava con passo lento ma misurato, osservando ogni dettaglio della stanza con i suoi occhi attenti ed esperti.",
    "«Buon pomeriggio, Luca,» disse Bruno con la sua voce profonda e calma, appoggiando il cappello su un attaccapanni vicino all'ingresso."
  ],
  [
    "«Signor Bruno, che gioia vederla qui!» esclamò Luca uscendo da dietro al bancone per accoglierlo con una stretta di mano calorosa e sincera.",
    "«Si accomodi pure al tavolo grande: le preparo subito una tazza della nostra miscela della casa, o preferisce un espresso classico al banco come ai vecchi tempi?»",
    "Bruno sorrise con una punta di dolcezza nello sguardo severo e si sedette con calma su una sedia di legno massiccio lavorata da Marco.",
    "«Preparami quello che ritieni migliore, ragazzo mio. Oggi non sono venuto soltanto per assaggiare il tuo caffè, ma per parlarti di una questione importante e seria.»"
  ],
  [
    "Luca preparò l'espresso con la massima cura, versandolo in una tazzina calda di ceramica spessa realizzata a mano da Claudia.",
    "Portò il vassoio al tavolo, si sedette di fronte al suo vecchio maestro e attese in silenzio che Bruno finisse di bere il primo sorso.",
    "L'anziano barista degustò il caffè con lentezza, chiuse gli occhi per qualche istante e annuì con approvazione sincera prima di posare la tazzina sul piattino.",
    "«Questo caffè ha equilibrio, corpo e dignità, Luca. Hai imparato davvero a far parlare la materia prima senza voler strafare con la tecnica.»"
  ],
  [
    "«Ti ringrazio di cuore, Bruno. I suoi insegnamenti sono stati la base su cui ho costruito tutto quello che c'è qui dentro,» rispose Luca con sincera riconoscenza.",
    "Bruno appoggiò le mani nodose sul tavolo e lo guardò dritto negli occhi con un'espressione grave e concentrata.",
    "«Sono qui perché ieri ho incontrato l'avvocato Morandi e i rappresentanti di un grande consorzio di torrefazioni storiche del centro Italia.»",
    "«Hanno saputo del lavoro che stai facendo a Monti e sono rimasti molto colpiti dalla qualità del progetto e dalla risposta del quartiere.»"
  ],
  [
    "Luca ascoltò con attenzione, sentendo il cuore accelerare leggermente il battito per la sorpresa inaspettata.",
    "«Vogliono farti una proposta formale di collaborazione e sviluppo commerciale su larga scala,» continuò Bruno con tono misurato e prudente.",
    "«Sarebbero disposti a finanziare l'apertura di altri due punti vendita a Roma, fornirti macchinari moderni di ultima generazione e garantire una distribuzione su vasta scala della tua miscela con il loro marchio commerciale.»",
    "«In cambio, ti offrirebbero un contratto da direttore tecnico con uno stipendio garantito molto elevato e una percentuale sui profitti complessivi del gruppo.»"
  ],
  [
    "La stanza rimase immersa in un silenzio denso e profondo per diversi secondi, rotto soltanto dal sibilo leggero del bollitore sul bancone.",
    "Un anno prima, quando era ancora un apprendista incerto e preoccupato per il proprio avvenire, una proposta simile sarebbe sembrata a Luca il sogno più straordinario della vita.",
    "Uno stipendio fisso generoso, la sicurezza economica garantita da un grande gruppo industriale e la possibilità di vedere il proprio nome diffuso in tutta la città senza rischiare il proprio capitale.",
    "Eppure, mentre ascoltava le parole di Bruno, dentro di sé non sentiva alcun entusiasmo, ma una strana sensazione di distacco e lucidità."
  ],
  [
    "«Cosa comporterebbe esattamente questa collaborazione, Bruno?» chiese Luca con voce calma e riflessiva.",
    "«Dovrei delegare la selezione dei chicchi e i parametri di tostatura alle decisioni del comitato aziendale del consorzio?»",
    "«Dovremmo standardizzare le ricette per produrre grandi volumi industriali e uniformare l'arredamento di Spazio Monti secondo le linee guida della loro catena?»",
    "Bruno non rispose subito: fissò a lungo la tazzina vuota, poi sollevò lo sguardo con un'onestà disarmante che rivelava tutto il suo affetto paterno."
  ],
  [
    "«Sai già qual è la risposta, Luca,» ammise Bruno a voce bassa con un sospiro pesante. «Quando accetti i soldi e la scala industriale di un grande gruppo, non sei più tu a decidere i tempi, i valori e la qualità del tuo lavoro.»",
    "«Diventi un ingranaggio efficiente all'interno di una macchina molto più grande di te, dove i numeri e i margini trimestrali contano sempre più delle persone e della bellezza del mestiere.»",
    "«Io avevo il dovere professionale di portarti questa offerta perché è un riconoscimento tangibile del tuo valore, ma volevo vedere come avresti reagito con la tua testa.»",
    "Luca guardò intorno a sé il laboratorio: gli scaffali con le ceramiche uniche di Claudia, i banchi di legno intagliati a mano da Marco, la luce calda che entrava dalla vetrata."
  ],
  [
    "«Signor Bruno, la ringrazio con tutto il cuore per aver pensato a me e per avermi portato questa proposta con tanta trasparenza,» disse Luca con voce ferma, serena e priva di qualunque dubbio.",
    "«Ma io non ho lasciato la sicurezza del Grand Hotel e non ho lavorato giorno e notte per creare una catena commerciale o per diventare il dipendente di un consorzio industriale.»",
    "«Ho scelto questa strada difficile perché volevo essere libero di decidere cosa mettere nella tazzina, conoscere il nome delle persone che entrano ogni mattina e condividere lo spazio con artigiani veri che rispetto profondamente.»",
    "«La nostra forza non sta nei grandi numeri o nell'espansione rapida, ma nella dimensione umana, nella cura del dettaglio e nella nostra indipendenza autentica.»"
  ],
  [
    "Mentre Luca parlava, il volto severo di Bruno si è disteso in un sorriso raro, profondo e colmo di un orgoglio commosso.",
    "L'anziano maestro ha battuto la mano aperta sul tavolo di legno con un colpo sonoro di piena approvazione.",
    "«Bravo, Luca. Questa era esattamente la risposta che speravo di ascoltare da te oggi pomeriggio,» disse Bruno con gli occhi lucidi di sincera emozione.",
    "«Molti giovani confondono il successo con la grandezza dei numeri e finiscono per vendere la propria anima per un'illusione di sicurezza che dura poco.»",
    "«Il vero artigiano sa che la libertà di sbagliare con la propria testa e di fare le cose con amore vale infinitamente più di qualsiasi stipendio aziendale.»"
  ],
  [
    "I due uomini sono rimasti a parlare per un'altra ora davanti a una seconda tazza di caffè, ricordando i primi giorni di tirocinio al Bar Centrale, gli errori di gioventù e le tante lezioni apprese dietro al bancone.",
    "Quando Bruno si è alzato per andarsene, ha stretto la mano di Luca con una forza straordinaria per la sua età.",
    "«Non hai più bisogno dei miei consigli, ragazzo mio. Sei diventato un maestro a pieno titolo, e il tuo mestiere è in ottime mani.»",
    "Ha salutato Claudia e Marco con un cenno cordiale del capo ed è uscito nella sera romana, camminando con passo fiero lungo la via illuminata."
  ],
  [
    "Rimasto solo davanti alla vetrata mentre la notte scendeva dolcemente sui tetti di Roma, Luca ha respirato profondamente l'aria della stanza.",
    "Rifiutare un'offerta economica allettante non gli aveva lasciato alcun rimpianto, ma una sensazione indescrivibile di leggerezza, forza e maturità interiore.",
    "Aveva scelto consapevolmente la strada dell'autonomia, della qualità senza compromessi e del lavoro fatto con cura a misura d'uomo.",
    "Quella scelta rinnovata era il sigillo definitivo sul suo percorso: non era più un semplice lavoratore che cercava il proprio posto nel mondo, ma un uomo libero che costruiva il proprio destino con le proprie mani."
  ]
];

// CHAPTER 69: Il bilancio di un anno
const ch69_paras = [
  [
    "La fine di gennaio portò con sé una domenica pomeriggio di pioggia sottile e silenziosa che lavava le strade storiche del rione Monti.",
    "Con la bottega chiusa al pubblico per il riposo settimanale, Luca si era seduto al tavolo grande di castagno con una lampada da lettura accesa e una pila ordinata di registri, ricevute e quaderni di lavoro.",
    "Era passato esattamente un anno da quando aveva iniziato a immaginare l'apertura di Spazio Monti, e dodici mesi completi da quando aveva lasciato il lavoro sicuro per rischiare ogni cosa sul proprio mestiere.",
    "Era giunto il momento di fare un bilancio onesto e approfondito di quell'anno straordinario, non soltanto sui conti economici, ma sulla propria crescita umana e professionale."
  ],
  [
    "Aprendo il primo quaderno con la copertina nera, Luca ritrovò le annotazioni confuse e ansiose scritte durante i primi mesi di attività.",
    "C'erano gli elenchi dei costi iniziali per la ristrutturazione del locale, le spese impreviste per gli allacciamenti dell'acqua, i calcoli ingenui sui margini di profitto e le tabelle orarie troppo rigide che non tenevano conto della realtà quotidiana.",
    "Rileggendo quelle pagine cariche di incertezza, Luca sorrise con tenerezza ripensando a quanto si sentisse impreparato e vulnerabile davanti a ogni piccolo ostacolo operativo.",
    "Ogni imprevisto gli sembrava allora una catastrofe definitiva capace di distruggere il suo sogno sul nascere."
  ],
  [
    "Sfogliando i mesi successivi, il registro mostrava chiaramente la mappa di tutte le crisi attraversate e superate con fatica e pazienza.",
    "C'era il ricordo del primo ingorgo del lunedì mattina a settembre, quando la fretta e l'ansia di dimostrare la propria bravura avevano paralizzato il servizio e allontanato i clienti frettolosi.",
    "C'era l'angoscia di ottobre per il calcolo delle tasse comunali e delle spese vive condivise, quando aveva scoperto che il fatturato lordo non coincideva affatto con il guadagno personale.",
    "E c'era la memoria viva del guasto alla guarnizione della macchina prima dell'apertura, risolto in meno di mezz'ora grazie alla calma, agli attrezzi giusti e alla competenza tecnica acquisita sul campo."
  ],
  [
    "Mentre analizzava quei ricordi con sguardo lucido e distaccato, Luca capì che nessuno di quegli errori era stato un fallimento inutile o una perdita di tempo.",
    "Al contrario, ogni momento di difficoltà era stato un passaggio pedagogico indispensabile per smantellare le sue illusioni teoriche e sostituirle con una solida competenza pratica.",
    "Senza l'ingorgo di settembre non avrebbe mai imparato a organizzare i movimenti con fluidità ed economia di gesti.",
    "Senza la paura economica di ottobre non avrebbe mai compreso l'importanza di una gestione rigorosa e trasparente dei costi aziendali.",
    "E senza il guasto di novembre non avrebbe mai sviluppato quella sicurezza calma che permette a un artigiano di dominare le emergenze senza perdere il controllo."
  ],
  [
    "Passando all'analisi dei dati finanziari complessivi dell'anno, i numeri confermavano un quadro di straordinaria solidità e salute economica.",
    "Dopo aver pagato puntualmente ogni quota dell'affitto, tutte le bollette energetiche, i fornitori di caffè verde e le imposte commerciali, l'attività aveva generato un utile netto costante e in crescita graduale.",
    "Il fondo di riserva per le emergenze contava una cifra sufficiente a coprire oltre tre mesi di spese vive senza entrate, garantendo una protezione totale contro qualunque imprevisto futuro.",
    "Spazio Monti non era soltanto un laboratorio creativo e accogliente, ma una micro-impresa sostenibile, sana e perfettamente autonoma."
  ],
  [
    "Mentre era immerso nei calcoli, la porta interna del laboratorio si è aperta e Claudia è entrata con una cartellina di disegni e due tazze di caffè fumante.",
    "«Come vanno i conti del nostro primo anno, contabile capo?» ha chiesto sorridendo mentre si sedeva di fronte a lui e posava la tazza sul tavolo.",
    "«I numeri dicono che siamo stati bravi, Claudia, molto più bravi di quanto pensassimo nei momenti di scoraggiamento,» ha risposto Luca mostrandole il riepilogo annuale.",
    "«Abbiamo superato i mesi peggiori senza debiti, abbiamo un margine solido di sicurezza e il quartiere continua a dimostrarci una fiducia crescente ogni settimana.»"
  ],
  [
    "Claudia ha guardato le cifre con soddisfazione evidente, poi ha appoggiato la mano sul quaderno aperto.",
    "«Sai qual è il numero più importante di questo bilancio, Luca? Non sono i soldi sul conto in banca, anche se quelli servono per vivere e dormire tranquilli la notte.»",
    "«Il dato più bello è che in dodici mesi non abbiamo mai fatto un compromesso sulla qualità delle nostre creazioni e non abbiamo mai perso il piacere di lavorare insieme ogni mattina con il sorriso.»",
    "«Abbiamo dimostrato che l'artigianato condiviso, basato sul rispetto e sulla cooperazione sincera, può funzionare davvero nella realtà di una grande città.»"
  ],
  [
    "Poco dopo si è unito a loro anche Marco, portando un tagliere con del pecorino romano e un pezzo di pane casereccio per fare una merenda improvvisata.",
    "I tre amici sono rimasti a lungo intorno al tavolo a ripercorrere i momenti più divertenti e significativi dell'anno trascorso.",
    "Hanno ricordato la sera del temporale d'autunno con il negozio trasformato in rifugio per il quartiere, le facce entusiaste dei partecipanti ai laboratori invernali e la visita solenne di Bruno poche settimane prima.",
    "Si sono accorti con stupore di quanto le loro vite si fossero intrecciate in modo profondo e naturale, trasformando una semplice collaborazione professionale in un'amicizia solida e fraterna."
  ],
  [
    "«Se penso a come sono arrivato a Roma un anno fa, mi sembra di guardare la vita di un'altra persona,» ha confidato Luca versandosi un altro goccio di caffè.",
    "«Ero pieno di paure, diffidente verso tutti e convinto che per farcela avrei dovuto difendermi continuamente dal mondo circostante.»",
    "«Pensavo che la bravura tecnica fosse l'unica cosa che contasse e che ammettere un limite o chiedere aiuto fosse un segno imperdonabile di debolezza.»",
    "Marco ha sorriso, spezzando un pezzo di pane con le dita robuste e piene di graffi di lavoro."
  ],
  [
    "«L'artigianato vero ti toglie l'orgoglio dalle mani e ti costringe a guardare le cose per come sono realmente,» ha commentato Marco con la sua saggezza semplice.",
    "«Finché credi di sapere tutto, il legno o la macchina ti smentiscono subito e ti fanno sbagliare; quando impari ad ascoltare con umiltà, tutto comincia a funzionare con una facilità inaspettata.»",
    "«Roma ti ha fatto lo stesso servizio: ti ha tolto le certezze facili e ti ha costretto a diventare un uomo vero.»",
    "Claudia ha alzato la sua tazza di ceramica in un brindisi spontaneo e allegro: «A Roma, a Spazio Monti e a tutti gli errori che ci hanno reso più forti!»"
  ],
  [
    "I tre amici hanno brindato insieme tra le risate, mentre fuori la pioggia di gennaio cominciava a diradarsi lasciando spazio a un cielo limpido e stellato.",
    "Dopo che Claudia e Marco sono usciti per tornare a casa, Luca è rimasto ancora un momento da solo nella bottega illuminata dalla luce soffusa delle lampade.",
    "Ha richiuso i quaderni di lavoro con cura, ha riposto le ricevute nei faldoni e ha rimesso in ordine il tavolo di castagno con gesti lenti e rispettosi.",
    "Sentiva dentro di sé una chiarezza cristallina: il bilancio di un anno non era una semplice verifica contabile, ma la consacrazione di una trasformazione interiore irreversibile."
  ],
  [
    "Aveva imparato l'arte più difficile e preziosa di tutte: l'arte dell'equilibrio dinamico.",
    "L'equilibrio tra la ricerca della qualità e la velocità del servizio al banco, tra il rigore della gestione economica e la generosità dell'accoglienza, tra la passione per il proprio mestiere e il rispetto per i bisogni degli altri.",
    "Non c'era più alcuna frattura tra la sua vita personale e il suo lavoro: Spazio Monti era l'espressione autentica, integra e armoniosa della sua identità.",
    "Poteva guardare al futuro non più con l'ansia del sopravvissuto, ma con la fiducia serena del costruttore che sa di poggiare su fondamenta solide e incrollabili."
  ],
  [
    "Prima di spegnere le luci e chiudere a chiave la porta a vetri, Luca ha accarezzato con le dita il pressino di bronzo massiccio donatogli da Bruno.",
    "Il metallo freddo e levigato dal tempo rispondeva al tocco con una sicurezza rassicurante e familiare.",
    "Sapeva che il giorno successivo sarebbe iniziata una nuova settimana di lavoro, con nuovi clienti da servire, nuove storie da ascoltare e nuove sfide da affrontare insieme alla sua comunità.",
    "Uscì nella notte fresca di Monti respirando a pieni polmoni l'aria pulita della città eterna, sentendosi finalmente, per la prima volta nella vita, un uomo completo e felice."
  ]
];

// CHAPTER 70: La scelta rinnovata (B1+ Capstone)
const ch70_paras = [
  [
    "Un lunedì mattina di febbraio, Roma si svegliò sotto un sole brillante e limpido che scaldava i sanpietrini dorati del rione Monti con la promessa precoce della primavera.",
    "Alle sei e mezza, mezz'ora prima della consueta apertura al pubblico, Luca arrivò davanti a Spazio Monti camminando a passo lento e rilassato lungo via dei Serpenti.",
    "Infilò la chiave d'ottone nella toppa, aprì la pesante porta a vetri e fu accolto dal profumo familiare, caldo e rassicurante di caffè tostato, cera d'api e legno levigato.",
    "Si fermò sulla soglia per un lungo istante, respirando quel silenzio perfetto e contemplando la bellezza semplice del laboratorio che aveva costruito con le proprie mani."
  ],
  [
    "Accese la macchina del caffè, avviando il riscaldamento dei gruppi con gesti ormai diventati naturali, armoniosi e privi di qualunque sforzo cosciente.",
    "Mentre la pressione saliva con regolarità e il vapore cominciava a scaldare i condotti interni d'acciaio, Luca si avvicinò alla vetrata d'ingresso e guardò fuori.",
    "I vicoli di Monti cominciavano lentamente ad animarsi: c'era il gatto nero del forno che attraversava pigramente la strada, l'edicolante all'angolo che sistemava i giornali della mattina e i primi residenti che scendevano verso il centro con il cappotto aperto.",
    "Tutto intorno a lui parlava di vita quotidiana, di appartenenza sincera e di una pace ritrovata dopo un lungo viaggio interiore."
  ],
  [
    "La memoria lo riportò improvvisamente al giorno del suo arrivo alla Stazione Termini, quindici mesi prima, quando era sceso dal treno regionale con una valigia di cartone legata con lo spago e il cuore stretto dall'angoscia.",
    "Ricordò la sensazione soffocante di smarrimento davanti alla folla caotica della capitale, la paura paralizzante di non trovare lavoro e il senso d'inadeguatezza che lo faceva sentire un provinciale invisibile e sperduto.",
    "Ricordò le prime settimane al Bar Centrale sotto lo sguardo severo di Bruno, le mani che tremavano versando il primo cappuccino e la tentazione costante di fuggire per tornare alle certezze rassicuranti del suo paesino natale a Pietralba.",
    "Quanto sembrava lontana e diversa quell'epoca della sua vita, eppure quanto era stata necessaria ogni singola tappa per farlo diventare l'uomo che era oggi."
  ],
  [
    "Alle sette in punto, dopo aver preparato il banco e verificato che ogni cosa fosse in perfetto ordine, Luca aprì la serratura della porta e girò il cartello di legno su 'Aperto'.",
    "Pochi istanti dopo, la campanella trillò e il signor Sergio entrò con il suo passo deciso, il giornale sotto il braccio e un sorriso cordiale sul viso rugoso.",
    "«Buongiorno, Luca! Oggi Roma sembra dipinta, ma senza il tuo caffè non si parte come si deve,» esclamò il vecchio tipografo appoggiandosi al bancone con familiarità.",
    "«Buongiorno a lei, signor Sergio! La miscela speciale della casa è calda e pronta per darle la carica giusta,» rispose Luca con un sorriso caloroso e sincero."
  ],
  [
    "I gesti di Luca dietro al bancone fluivano con un'eleganza fluida e impeccabile, frutto di centinaia di ore di pratica quotidiana e di un'intima armonia con i propri strumenti.",
    "Macinò i chicchi freschi, distribuì la polvere con delicatezza nel filtro e premette con decisione costante usando il pressino di bronzo di Bruno.",
    "Agganciò il portafiltro al gruppo ed estrasse due tazze d'espresso dalla crema bruna, densa e vellutata, servendo Sergio con un bicchierino d'acqua fresca e un tovagliolino pulito.",
    "Sergio bevve con visibile piacere, scambiò due battute allegre sulle notizie del giorno e salutò con una stretta di mano affettuosa prima di proseguire la sua passeggiata mattutina."
  ],
  [
    "Nel corso dell'ora successiva, Spazio Monti si riempì con naturalezza di una clientela varia, vivace e armoniosa che rifletteva tutta la ricchezza sociale del quartiere.",
    "Entrarono artigiani del legno, impiegati comunali, giovani architetti con i loro computer portatili e vicini di casa che si fermavano semplicemente per un saluto affettuoso e un consiglio sulla spesa.",
    "Luca serviva tutti con la stessa attenzione calorosa e professionale, adattando il ritmo del servizio alle esigenze di ciascuno senza mai perdere la calma né l'equilibrio interiore.",
    "Non c'era più alcuna tensione o fretta ansiosa: la bottega funzionava come un organismo vivo, accogliente e perfettamente integrato nel tessuto del rione."
  ],
  [
    "Verso le nove, Claudia e Marco arrivarono insieme per iniziare la loro giornata di lavoro nel laboratorio condiviso.",
    "Claudia portava una scatola di biscotti casalinghi preparati la sera prima, mentre Marco aveva sotto il braccio una tavola di ciliegio antico appena recuperata da una vecchia villa sui colli.",
    "Si salutarono con un abbraccio fraterno e una tazza di caffè condivisa in piedi dietro al bancone, commentando insieme i programmi della settimana e i nuovi progetti da realizzare.",
    "Quella complicità spontanea e profonda era il vero motore di Spazio Monti, un'energia positiva che si trasmetteva a chiunque varcasse la soglia della stanza."
  ],
  [
    "Mentre la mattinata proseguiva con il suo flusso operoso e sereno, una figura familiare e imponente apparve davanti alla vetrata illuminata dal sole.",
    "Era Bruno, che passeggiava con le mani dietro la schiena godendosi la bella giornata d'inverno prima di andare a fare una commissione in banca.",
    "Si fermò davanti all'ingresso, guardò all'interno della bottega piena di gente e incrociò lo sguardo di Luca attraverso il vetro limpido.",
    "Bruno non entrò per non interrompere il lavoro, ma sollevò la mano destra con un cenno lento, solenne e carico di un rispetto e di un affetto paterno che non avevano bisogno di parole."
  ],
  [
    "Luca rispose al saluto con un inchino leggero del capo e una mano sul cuore, sentendo un'ondata di commozione e gratitudine riempirgli il petto.",
    "Capì in quell'istante che il debito più grande che aveva verso il suo vecchio maestro non era soltanto la tecnica dell'espresso o la conoscenza della gestione aziendale.",
    "Il dono più prezioso che Bruno gli aveva trasmesso era stato l'esempio vivente di come un mestiere possa diventare una forma altissima di dignità personale, di servizio generoso verso la comunità e di fedeltà ai propri valori morali.",
    "Quell'eredità spirituale era ora viva e custodita nelle sue mani, pronta a essere tramandata a chiunque avesse il desiderio sincero di imparare."
  ],
  [
    "Verso mezzogiorno, durante una breve pausa tra una comanda e l'altra, Luca si versò una tazzina di caffè e si mise da parte per osservare la sala.",
    "Al tavolo grande, due studenti stranieri stavano studiando la grammatica italiana aiutati da Chiara, che spiegava con pazienza le differenze tra i tempi verbali del passato.",
    "In fondo alla stanza, Claudia mostrava a una bambina del quartiere come modellare un piccolo uccellino d'argilla, mentre Marco tagliava con precisione un listello di legno diffondendo un profumo gradevole di resina naturale.",
    "Tutto ciò che aveva sognato, desiderato e difeso con fatica nei momenti più bui era lì, vivo e reale davanti ai suoi occhi, fecondo e accogliente."
  ],
  [
    "Luca ripensò alla grande scelta che aveva dovuto compiere nei mesi passati: la scelta tra la comodità rassicurante della dipendenza e il rischio coraggioso della libertà artigianale.",
    "Comprese che la scelta vera non si compie una volta sola all'inizio del cammino, per poi vivere di rendita sui ricordi o sulle abitudini consolidate.",
    "La scelta autentica si rinnova ogni singola mattina all'alba: quando accendi la macchina, quando accogli il primo cliente con un sorriso sincero, quando decidi di non cedere alla pigrizia o al compromesso facile sulla qualità del lavoro.",
    "Ogni giorno era un atto cosciente di fedeltà verso se stessi, verso la propria arte e verso le persone che riponevano la loro fiducia nella bottega."
  ],
  [
    "Non era più l'apprendista che cercava disperatamente conferme all'esterno per colmare le proprie insicurezze giovanili.",
    "Era diventato un maestro artigiano completo, un punto fermo nella vita del rione e una guida autorevole e rispettata per i suoi compagni di viaggio.",
    "Le sue radici di Pietralba, con la loro semplicità operosa e i loro valori contadini di pazienza e modestia, si erano unite indissolubilmente all'anima generosa, antica e universale di Roma.",
    "Le due vite che all'inizio gli sembravano inconciliabili avevano trovato la loro sintesi perfetta e definitiva in quell'angolo di mondo che adesso chiamava con orgoglio 'casa'."
  ],
  [
    "Mentre la campana della vicina chiesa di San Pietro in Vincoli scandiva i dodici rintocchi di mezzogiorno diffondendo un suono bronzeo e solenne nell'aria limpida, Luca riprese il pressino in mano con fermezza serena.",
    "Un nuovo cliente entrò dalla porta spalancata, portando con sé la luce dorata del sole romano e una ventata di aria fresca.",
    "«Buongiorno! Cosa posso prepararle di buono?» chiese Luca con la voce chiara, calda e accogliente di chi è finalmente padrone del proprio destino.",
    "Poi sorrise con gioia pura e si mise al lavoro, pronto a scrivere ogni giorno un nuovo capitolo meraviglioso della sua storia a Roma."
  ]
];

const batchData = [
  { num: 66, titleEn: "The Neighborhood's Identity", titleIt: "L'identità del quartiere", paras: ch66_paras },
  { num: 67, titleEn: "The Trial of Winter", titleIt: "La prova dell'inverno", paras: ch67_paras },
  { num: 68, titleEn: "Bruno's Proposal", titleIt: "La proposta di Bruno", paras: ch68_paras },
  { num: 69, titleEn: "One Year Balance", titleIt: "Il bilancio di un anno", paras: ch69_paras },
  { num: 70, titleEn: "The Choice Renewed", titleIt: "La scelta rinnovata", paras: ch70_paras },
];

let totalWords = 0;
let totalSentences = 0;

for (const b of batchData) {
  let wCount = 0;
  let sCount = 0;
  const paragraphs = b.paras.map((sentences, pIdx) => {
    const sObjs = sentences.map((text) => {
      sCount++;
      totalSentences++;
      const sId = `s${sCount < 10 ? '0' : ''}${sCount}`;
      const words = text.split(/\s+/).filter(Boolean);
      wCount += words.length;
      totalWords += words.length;
      return {
        id: sId,
        text: text,
        lemmas: [] // will be resolved
      };
    });
    return {
      id: `p${pIdx + 1 < 10 ? '0' : ''}${pIdx + 1}`,
      sentences: sObjs
    };
  });

  const json = {
    id: `luca-a-roma-${b.num}`,
    storyId: "luca-a-roma",
    number: b.num,
    title: b.titleEn,
    titleIt: b.titleIt,
    difficultyLevel: 3,
    locationIds: [
      "quartiere",
      "centro",
      "strada"
    ],
    characterIds: [
      "luca",
      "padrone",
      "marco",
      "claudia"
    ],
    events: [
      {
        id: `ev-${b.num}-event`,
        summary: `Narrative movement in chapter ${b.num} of Luca a Roma.`,
        characterIds: [
          "luca",
          "padrone",
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

  const p = `c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-${b.num}.json`;
  fs.writeFileSync(p, JSON.stringify(json, null, 2), 'utf8');
  console.log(`Generated Chapter ${b.num}: ${wCount} words, ${paragraphs.length} paragraphs, ${sCount} sentences.`);
}

console.log(`Batch C total: ${totalWords} words, ${totalSentences} sentences.`);
