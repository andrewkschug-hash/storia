/**
 * Form-level English glosses for high-frequency irregular verbs.
 * Keyed by lemmaId → normalized Italian form → gloss.
 * Ambiguous forms list multiple readings separated by " / ".
 */

export const FORM_GLOSS_LEMMAS = [
  'essere',
  'avere',
  'andare',
  'fare',
  'potere',
  'volere',
  'dovere',
  'sapere',
  'venire',
  'uscire',
] as const;

export type FormGlossLemmaId = (typeof FORM_GLOSS_LEMMAS)[number];

const FORM_GLOSSES: Record<string, Record<string, string>> = {
  essere: {
    sono: 'I am / they are',
    sei: 'you are (tu)',
    è: 'he/she/it is',
    e: 'he/she/it is',
    siamo: 'we are',
    siete: 'you are / you all are (voi)',
    ero: 'I was',
    eri: 'you were (tu)',
    era: 'he/she/it was',
    eravamo: 'we were',
    eravate: 'you were (voi)',
    erano: 'they were',
    stato: 'been (m.)',
    stata: 'been (f.)',
    stati: 'been (m. pl.)',
    state: 'been (f. pl.) / you are (voi, imperative)',
  },
  avere: {
    ho: 'I have',
    hai: 'you have (tu)',
    ha: 'he/she/it has',
    abbiamo: 'we have',
    avete: 'you have / you all have (voi)',
    hanno: 'they have',
    avevo: 'I had',
    avevi: 'you had (tu)',
    aveva: 'he/she/it had',
    avevamo: 'we had',
    avevate: 'you had (voi)',
    avevano: 'they had',
    avuto: 'had (participle)',
    avuta: 'had (f.)',
    avuti: 'had (m. pl.)',
    avute: 'had (f. pl.)',
  },
  andare: {
    vado: 'I go',
    vai: 'you go (tu)',
    va: 'he/she/it goes',
    andiamo: 'we go / let’s go',
    andate: 'you go (voi) / go! (pl.) / gone (f. pl.)',
    vanno: 'they go',
    andavo: 'I used to go',
    andavi: 'you used to go (tu)',
    andava: 'he/she used to go',
    andavamo: 'we used to go',
    andavate: 'you used to go (voi)',
    andavano: 'they used to go',
    andato: 'gone (m.)',
    andata: 'gone (f.)',
    andati: 'gone (m. pl.)',
  },
  fare: {
    faccio: 'I do / I make',
    fai: 'you do / you make (tu)',
    fa: 'he/she/it does / makes',
    facciamo: 'we do / we make',
    fate: 'you do / you make (voi)',
    fanno: 'they do / they make',
    facevo: 'I used to do/make',
    facevi: 'you used to do/make (tu)',
    faceva: 'he/she used to do/make',
    facevamo: 'we used to do/make',
    facevate: 'you used to do/make (voi)',
    facevano: 'they used to do/make',
    fatto: 'done / made (m.)',
    fatta: 'done / made (f.)',
    fatti: 'done / made (m. pl.)',
    fatte: 'done / made (f. pl.)',
  },
  potere: {
    posso: 'I can',
    puoi: 'you can (tu)',
    può: 'he/she can',
    puo: 'he/she can',
    possiamo: 'we can',
    potete: 'you can (voi)',
    possono: 'they can',
    potevo: 'I could / used to be able',
    potevi: 'you could (tu)',
    poteva: 'he/she could',
    potevamo: 'we could',
    potevate: 'you could (voi)',
    potevano: 'they could',
    potuto: 'been able',
  },
  volere: {
    voglio: 'I want',
    vuoi: 'you want (tu)',
    vuole: 'he/she wants',
    vogliamo: 'we want',
    volete: 'you want (voi)',
    vogliono: 'they want',
    volevo: 'I wanted',
    volevi: 'you wanted (tu)',
    voleva: 'he/she wanted',
    volevamo: 'we wanted',
    volevate: 'you wanted (voi)',
    volevano: 'they wanted',
    voluto: 'wanted (participle)',
    vorrei: 'I would like',
    vorresti: 'you would like (tu)',
    vorrebbe: 'he/she would like',
    vorremmo: 'we would like',
    vorreste: 'you would like (voi)',
    vorrebbero: 'they would like',
  },
  dovere: {
    devo: 'I must / I have to',
    devi: 'you must / you have to (tu)',
    deve: 'he/she must / has to',
    dobbiamo: 'we must / we have to',
    dovete: 'you must / you have to (voi)',
    devono: 'they must / they have to',
    dovevo: 'I had to',
    dovevi: 'you had to (tu)',
    doveva: 'he/she had to',
    dovevamo: 'we had to',
    dovevate: 'you had to (voi)',
    dovevano: 'they had to',
    dovuto: 'had to (participle)',
  },
  sapere: {
    so: 'I know',
    sai: 'you know (tu)',
    sa: 'he/she knows',
    sappiamo: 'we know',
    sapete: 'you know (voi)',
    sanno: 'they know',
    sapevo: 'I knew',
    sapevi: 'you knew (tu)',
    sapeva: 'he/she knew',
    sapevamo: 'we knew',
    sapevate: 'you knew (voi)',
    sapevano: 'they knew',
    saputo: 'known (participle)',
  },
  venire: {
    vengo: 'I come',
    vieni: 'you come (tu) / come!',
    viene: 'he/she comes',
    veniamo: 'we come',
    venite: 'you come (voi) / come! (pl.)',
    vengono: 'they come',
    venivo: 'I used to come',
    venivi: 'you used to come (tu)',
    veniva: 'he/she used to come',
    venivamo: 'we used to come',
    venivate: 'you used to come (voi)',
    venivano: 'they used to come',
    venuto: 'come (m.)',
    venuta: 'come (f.)',
    venuti: 'come (m. pl.)',
    venute: 'come (f. pl.)',
  },
  uscire: {
    esco: 'I go out',
    esci: 'you go out (tu) / go out!',
    esce: 'he/she goes out',
    usciamo: 'we go out',
    uscite: 'you go out (voi) / go out! (pl.) / gone out (f. pl.)',
    escono: 'they go out',
    uscivo: 'I used to go out',
    uscivi: 'you used to go out (tu)',
    usciva: 'he/she used to go out',
    uscivamo: 'we used to go out',
    uscivate: 'you used to go out (voi)',
    uscivano: 'they used to go out',
    uscito: 'gone out (m.)',
    uscita: 'gone out (f.)',
    usciti: 'gone out (m. pl.)',
  },
};

export function normalizeFormKey(surface: string): string {
  return surface
    .trim()
    .toLocaleLowerCase('it')
    .normalize('NFC')
    .replace(/[’']/g, "'")
    .replace(/[.,;:!?…«»""]+$/g, '');
}

/**
 * Form gloss for a tapped surface of a known irregular lemma.
 * Returns null when no form-level gloss is authored (caller keeps lemma english).
 */
export function formGlossFor(lemmaId: string, surface: string): string | null {
  const table = FORM_GLOSSES[lemmaId];
  if (!table) return null;
  const key = normalizeFormKey(surface);
  if (!key) return null;
  return table[key] ?? null;
}

export function hasFormGlossLemma(lemmaId: string): boolean {
  return Boolean(FORM_GLOSSES[lemmaId]);
}

/** @internal tests / reporting */
export function listFormGlossEntries(): Array<{ lemmaId: string; form: string; gloss: string }> {
  const rows: Array<{ lemmaId: string; form: string; gloss: string }> = [];
  for (const lemmaId of Object.keys(FORM_GLOSSES).sort()) {
    const table = FORM_GLOSSES[lemmaId];
    for (const form of Object.keys(table).sort()) {
      rows.push({ lemmaId, form, gloss: table[form] });
    }
  }
  return rows;
}
