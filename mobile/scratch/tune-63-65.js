const fs = require('fs');

const draft63 = require('./draft-ch63.js');
const draft65 = require('./draft-ch65.js');

// Expand Ch 63
draft63[3][2].text = "«Prendete pure questi teli asciutti per riscaldarvi e togliere l'umidità dai vestiti,» disse con voce calma, rassicurante e sorridente a tutti i presenti. «Accomodatevi vicino al grande tavolo di legno, c'è posto a sedere per tutti finché fuori la pioggia non si placa del tutto.»";
draft63[6][0].text = "«Bevete qualcosa di caldo e profumato per riprendervi dal gelo della strada,» annunciò Luca con un sorriso aperto e cordiale mentre passava tra i tavoli offrendo le tazze fumanti a chiunque si trovasse all'interno della bottega.";
draft63[7][0].text = "Fuori, la pioggia torrenziale continuava a martellare con violenza incessante contro i sanpietrini neri della strada, mentre lampi azzurri e improvvisi illuminavano a giorno i tetti scuri del rione Monti.";
draft63[12][2].text = "Stava piuttosto nel saper aprire le porte e accogliere le persone proprio quando infuria la tempesta, abbracciando la vita nella sua imprevedibile e fragile bellezza e scoprendo che la generosità disinteressata è il fondamento più solido e duraturo di ogni vera comunità.";

// Expand Ch 65
draft65[2][0].text = "Luca si muoveva dietro il bancone di castagno con una sicurezza fluida, serena, armoniosa e priva di ogni rigida tensione, preparando estrazioni lente e continue con il cono di porcellana e servendo piccoli assaggi aromatici a tutti gli intervenuti.";
draft65[3][1].text = "La signora Teresa sedeva comodamente sulla poltrona di velluto vicino alla finestra, sorseggiando il suo caffè caldo in una tazza di ceramica blu notte e chiacchierando amabilmente con due giovani grafici che lavoravano in uno studio creativo di Via del Boschetto.";
draft65[8][2].text = "Non hai semplicemente aperto un bar per vendere bevande frettolose ai passanti di passaggio: hai creato con pazienza un luogo vivo in cui le persone desiderano rimanere, ascoltare, parlare e sentirsi parte di qualcosa di bello.";
draft65[11][1].text = "Si voltò lentamente e guardò attraverso la grande vetrata illuminata di giallo: dentro la bottega, Claudia e Chiara ridevano insieme asciugando le ceramiche con gli strofinacci di lino, mentre Marco sistemava i vassoi di legno d'olivo con cura meticolosa e paziente.";

fs.writeFileSync('./scratch/draft-ch63.js', 'const paragraphs63 = ' + JSON.stringify(draft63, null, 2) + ';\nmodule.exports = paragraphs63;\n', 'utf8');
fs.writeFileSync('./scratch/draft-ch65.js', 'const paragraphs65 = ' + JSON.stringify(draft65, null, 2) + ';\nmodule.exports = paragraphs65;\n', 'utf8');

console.log('Fine-tuned Ch 63 and 65.');
