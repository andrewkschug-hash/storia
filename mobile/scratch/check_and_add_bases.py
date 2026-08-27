import json
import os
import re

core_path = "c:/Users/aksch/Code/storia/mobile/content/lexicon/italian-core.json"
with open(core_path, "r", encoding="utf-8") as f:
    core = json.load(f)

core_entries = {e["lemmaId"]: e for e in core["lexicon"]}

def ensure_lemma(lid, it=None, en=None, pos="noun", gender=None, diff=1, freq="high", ch=66, infs=None):
    if not it:
        it = lid
    if not en:
        en = lid
    if lid not in core_entries:
        entry = {
            "lemmaId": lid,
            "italian": it,
            "english": en,
            "partOfSpeech": pos,
            "difficulty": diff,
            "frequency": freq,
            "introducedChapter": ch,
            "inflections": infs or [it.lower()]
        }
        if gender:
            entry["gender"] = gender
        core["lexicon"].append(entry)
        core_entries[lid] = entry
    else:
        if infs:
            cur = set(core_entries[lid].get("inflections", []))
            cur.update(infs)
            core_entries[lid]["inflections"] = sorted(list(cur))

# Mapping from surface to lemma ID
word_map = {
    "po'": "poco", "po’": "poco", "po": "poco", "caffè": "caffe", "caffe": "caffe",
    "percepisce": "percepire", "percepire": "percepire", "riflessione": "riflessione",
    "forzarli": "forzare", "forzare": "forzare", "pregiudizi": "pregiudizio",
    "pregiudizio": "pregiudizio", "affezionati": "affezionato", "affezionato": "affezionato",
    "gelida": "gelido", "gelido": "gelido", "permetterci": "permettere",
    "permettere": "permettere", "informativi": "informativo", "informativo": "informativo",
    "riciclata": "riciclato", "riciclato": "riciclato", "quarantotto": "quarantotto",
    "ritieni": "ritenere", "ritenere": "ritenere", "vasta": "vasto", "vasto": "vasto",
    "apprendista": "apprendista", "efficiente": "efficiente", "trimestrali": "trimestrale",
    "trimestrale": "trimestrale", "contrario": "contrario", "permette": "permettere",
    "all'analisi": "analisi", "all’analisi": "analisi", "analisi": "analisi",
    "basato": "basare", "basare": "basare", "divertenti": "divertente",
    "divertente": "divertente", "riportò": "riportare", "riport": "riportare",
    "riportare": "riportare", "tovagliolino": "tovagliolino", "varia": "vario",
    "vario": "vario", "positiva": "positivo", "positivo": "positivo",
    "passeggiava": "passeggiare", "passeggiare": "passeggiare",
    "agganciò": "agganciare", "agganciare": "agganciare", "decisero": "decidere",
    "decidere": "decidere", "preparami": "preparare", "preparare": "preparare",
    "rileggendo": "rileggere", "rileggere": "rileggere", "sabati": "sabato",
    "sabato": "sabato", "accendi": "accendere", "accendere": "accendere",
    "accogli": "accogliere", "accogliere": "accogliere", "accoglierlo": "accogliere",
    "accomodi": "accomodare", "accomodare": "accomodare", "accorti": "accorgersi",
    "accorgersi": "accorgersi", "accumulati": "accumulare", "accumulare": "accumulare",
    "acquistarono": "acquistare", "acquistare": "acquistare", "adattando": "adattare",
    "adattare": "adattare", "addobbate": "addobbare", "addobbare": "addobbare",
    "affascinati": "affascinare", "affascinare": "affascinare", "allettante": "allettante",
    "amore": "amore", "andarono": "andare", "andare": "andare",
    "anziana": "anziano", "anziano": "anziano", "apprese": "apprendere",
    "apprendere": "apprendere", "appuntamenti": "appuntamento", "appuntamento": "appuntamento",
    "arrivarono": "arrivare", "arrivare": "arrivare", "arrivò": "arrivare",
    "asciugava": "asciugare", "asciugare": "asciugare", "ascoltavano": "ascoltare",
    "ascoltare": "ascoltare", "assaggiavano": "assaggiare", "assaggiare": "assaggiare",
    "attenta": "attento", "attento": "attento", "attenti": "attento",
    "attraversate": "attraversare", "attraversare": "attraversare",
    "attraversava": "attraversare", "aumentati": "aumentare", "aumentare": "aumentare",
    "avanzato": "avanzare", "avanzare": "avanzare", "avermi": "avere",
    "avere": "avere", "avremmo": "avere", "bambina": "bambino",
    "bambino": "bambino", "banchi": "banco", "banco": "banco",
    "basi": "base", "base": "base", "bevevano": "bere",
    "bere": "bere", "bui": "buio", "buio": "buio",
    "calorosamente": "calorosamente", "cancellata": "cancellare", "cancellare": "cancellare",
    "capirci": "capire", "capire": "capire", "capitolo": "capitolo",
    "cartoncini": "cartoncino", "cartoncino": "cartoncino", "catena": "catena",
    "chiacchiere": "chiacchiera", "chiacchiera": "chiacchiera", "chiedevano": "chiedere",
    "chiedere": "chiedere", "chiesero": "chiedere", "chiudendo": "chiudere",
    "chiudere": "chiudere", "chiuderci": "chiudere", "commentando": "commentare",
    "commentare": "commentare", "commenti": "commento", "commento": "commento",
    "commosso": "commosso", "comode": "comodo", "comodo": "comodo",
    "competitiva": "competitivo", "competitivo": "competitivo", "comporterebbe": "comportare",
    "comportare": "comportare", "confermavano": "confermare", "confermare": "confermare",
    "confidato": "confidare", "confidare": "confidare", "confondono": "confondere",
    "confondere": "confondere", "confrontando": "confrontare", "confrontare": "confrontare",
    "considerava": "considerare", "considerare": "considerare", "contano": "contare",
    "contare": "contare", "contasse": "contare", "continuamente": "continuamente",
    "controllando": "controllare", "controllare": "controllare", "convinto": "convinto",
    "coppia": "coppia", "costretti": "costringere", "costringere": "costringere",
    "d'ulivo": "olivo", "d’ulivo": "olivo", "olivo": "olivo",
    "dall'annuncio": "annuncio", "dall’annuncio": "annuncio", "annuncio": "annuncio",
    "darle": "dare", "dare": "dare", "debolezza": "debolezza",
    "decise": "decidere", "dell'africa": "africa", "dell’africa": "africa",
    "africa": "africa", "dell'america": "america", "dell’america": "america",
    "america": "america", "dell'intera": "intero", "dell’intera": "intero",
    "intero": "intero", "difendermi": "difendere", "difendere": "difendere",
    "differenze": "differenza", "differenza": "differenza", "diffidente": "diffidente",
    "diffondendo": "diffondere", "diffondere": "diffondere", "dimostrarci": "dimostrare",
    "dimostrare": "dimostrare", "disordinato": "disordinato", "diventarono": "diventare",
    "diventare": "diventare", "diventati": "diventare", "diventavano": "diventare",
    "divertenti": "divertente", "donatogli": "donare", "donare": "donare",
    "esauriti": "esaurito", "esaurito": "esaurito", "estragga": "estrarre",
    "estrarre": "estrarre", "facce": "faccia", "faccia": "faccia",
    "fallire": "fallire", "farebbe": "fare", "fare": "fare",
    "farti": "fare", "fidati": "fidato", "fidato": "fidato",
    "finiscono": "finire", "finire": "finire", "finisse": "finire",
    "fiori": "fiore", "fiore": "fiore", "fissò": "fissare",
    "fissare": "fissare", "fornirti": "fornire", "fornire": "fornire",
    "fossimo": "essere", "essere": "essere", "frattempo": "frattempo",
    "freschi": "fresco", "fresco": "fresco", "ganci": "gancio",
    "gancio": "gancio", "generosi": "generoso", "generoso": "generoso",
    "ghirlande": "ghirlanda", "ghirlanda": "ghirlanda", "gioventù": "gioventu",
    "gioventu": "gioventu", "goccio": "goccio", "godendosi": "godere",
    "godere": "godere", "grandezza": "grandezza", "guardarono": "guardare",
    "guardare": "guardare", "guidando": "guidare", "guidare": "guidare",
    "guidate": "guidare", "guidato": "guidare", "imbarazzo": "imbarazzo",
    "impreviste": "imprevisto", "imprevisto": "imprevisto", "incidenti": "incidente",
    "incidente": "incidente", "incrociò": "incrociare", "incrociare": "incrociare",
    "indescrivibile": "indescrivibile", "inesperte": "inesperto", "inesperto": "inesperto",
    "influenzi": "influenzare", "influenzare": "influenzare", "infrasettimanali": "infrasettimanale",
    "infrasettimanale": "infrasettimanale", "insegnanti": "insegnante", "insegnante": "insegnante",
    "insegno": "insegnare", "insegnare": "insegnare", "insicurezze": "insicurezza",
    "insicurezza": "insicurezza", "integrarsi": "integrare", "integrare": "integrare",
    "intrecciate": "intrecciare", "intrecciare": "intrecciare", "inventare": "inventare",
    "iscrivere": "iscrivere", "italiana": "italiano", "italiano": "italiano",
    "l'apprendista": "apprendista", "l’apprendista": "apprendista", "l'esempio": "esempio",
    "l’esempio": "esempio", "esempio": "esempio", "lasciarci": "lasciare",
    "lasciare": "lasciare", "lasciavano": "lasciare", "lavoratore": "lavoratore",
    "leggendo": "leggere", "leggere": "leggere", "leggevano": "leggere",
    "lezioni": "lezione", "lezione": "lezione", "linee": "linea",
    "linea": "linea", "lisce": "liscio", "liscio": "liscio",
    "luna": "luna", "macinati": "macinare", "macinare": "macinare",
    "meraviglia": "meraviglia", "meteorologica": "meteorologico", "meteorologico": "meteorologico",
    "misero": "mettere", "mettere": "mettere", "mondi": "mondo",
    "mondo": "mondo", "mostrandole": "mostrare", "mostrare": "mostrare",
    "muovendosi": "muovere", "muovere": "muovere", "nata": "nascere",
    "nascere": "nascere", "naturali": "naturale", "naturale": "naturale",
    "nell'espansione": "espansione", "nell’espansione": "espansione", "espansione": "espansione",
    "offrirebbero": "offrire", "offrire": "offrire", "oggetti": "oggetto",
    "oggetto": "oggetto", "ordinarono": "ordinare", "ordinare": "ordinare",
    "parlarti": "parlare", "parlare": "parlare", "partecipanti": "partecipante",
    "partecipante": "partecipante", "passati": "passato", "passato": "passato",
    "passeggiava": "passeggiare", "passive": "passivo", "passivo": "passivo",
    "pensassimo": "pensare", "pensare": "pensare", "pensata": "pensare",
    "perfezionismo": "perfezionismo", "piegarsi": "piegare", "piegare": "piegare",
    "pigrizia": "pigrizia", "portarti": "portare", "portare": "portare",
    "portoni": "portone", "portone": "portone", "potersi": "potere",
    "potere": "potere", "precedettero": "precedere", "precedere": "precedere",
    "preferisce": "preferire", "preferire": "preferire", "pregiudizi": "pregiudizio",
    "prepararle": "preparare", "preparate": "preparare", "proseguiva": "proseguire",
    "proseguire": "proseguire", "qual": "quale", "quale": "quale",
    "quarantotto": "quarantotto", "quarant'anni": "quaranta", "quarant’anni": "quaranta",
    "quaranta": "quaranta", "quegli": "quello", "quello": "quello",
    "raccolsero": "raccogliere", "raccogliere": "raccogliere", "raccolti": "raccolto",
    "raccolto": "raccolto", "rafforzare": "rafforzare", "realizzata": "realizzare",
    "realizzare": "realizzare", "recuperata": "recuperare", "recuperare": "recuperare",
    "registratore": "registratore", "relazioni": "relazione", "relazione": "relazione",
    "resistenze": "resistenza", "resistenza": "resistenza", "riconoscendo": "riconoscere",
    "riconoscere": "riconoscere", "riconoscimento": "riconoscimento", "riconosciuto": "riconoscere",
    "ricordando": "ricordare", "ricordare": "ricordare", "ricordi": "ricordo",
    "ricordo": "ricordo", "riempirgli": "riempire", "riempire": "riempire",
    "riempirono": "riempire", "riflessione": "riflessione", "riflessiva": "riflessivo",
    "riflessivo": "riflessivo", "rimpianto": "rimpianto", "riponevano": "riporre",
    "riporre": "riporre", "ripulendo": "ripulire", "ripulire": "ripulire",
    "rispettata": "rispettare", "rispettare": "rispettare", "rispettosi": "rispettoso",
    "rispettoso": "rispettoso", "ritrovata": "ritrovare", "ritrovare": "ritrovare",
    "ritrovò": "ritrovare", "rivelava": "rivelare", "rivelare": "rivelare",
    "rivestirsi": "rivestire", "rivestire": "rivestire", "rovinarne": "rovinare",
    "rovinare": "rovinare", "salutarono": "salutare", "salutare": "salutare",
    "scacciò": "scacciare", "scacciare": "scacciare", "scambiavano": "scambiare",
    "scambiare": "scambiare", "scambiò": "scambiare", "scandiva": "scandire",
    "scandire": "scandire", "scritte": "scrivere", "scrivere": "scrivere",
    "sedendosi": "sedere", "sedere": "sedere", "sembravano": "sembrare",
    "sembrare": "sembrare", "sembravi": "sembrare", "semplici": "semplice",
    "semplice": "semplice", "sentisse": "sentire", "sentire": "sentire",
    "separati": "separare", "separare": "separare", "set": "set",
    "sognato": "sognare", "sognare": "sognare", "soluzione": "soluzione",
    "sonoro": "sonoro", "sorrisi": "sorriso", "sorriso": "sorriso",
    "sostenibili": "sostenibile", "sostenibile": "sostenibile", "sostituirle": "sostituire",
    "sostituire": "sostituire", "sostituita": "sostituire", "speravo": "sperare",
    "sperare": "sperare", "spezzando": "spezzare", "spezzare": "spezzare",
    "stampando": "stampare", "stampare": "stampare", "storie": "storia",
    "storia": "storia", "studiando": "studiare", "studiare": "studiare",
    "studiata": "studiare", "successiva": "successivo", "successivo": "successivo",
    "superate": "superare", "superare": "superare", "tagliava": "tagliare",
    "tagliare": "tagliare", "tatto": "tatto", "tavoletta": "tavoletta",
    "temporanea": "temporaneo", "temporaneo": "temporaneo", "tenevano": "tenere",
    "tenere": "tenere", "timido": "timido", "titolo": "titolo",
    "toccando": "toccare", "toccare": "toccare", "tovagliolino": "tovagliolino",
    "traducevano": "tradurre", "tradurre": "tradurre", "trimestrali": "trimestrale",
    "un'amicizia": "amicizia", "un’amicizia": "amicizia", "amicizia": "amicizia",
    "uniche": "unico", "unico": "unico", "unite": "unire",
    "unire": "unire", "uomini": "uomo", "uomo": "uomo",
    "usò": "usare", "usare": "usare", "valori": "valore",
    "valore": "valore", "varcasse": "varcare", "varcare": "varcare",
    "vederla": "vedere", "vedere": "vedere", "vellutata": "vellutato",
    "vellutato": "vellutato", "versandolo": "versare", "versare": "versare",
    "versandosi": "versare", "vigilia": "vigilia", "voler": "volere",
    "volere": "volere", "santa": "santo", "santo": "santo",
    "sergio": "sergio", "cavour": "cavour", "morandi": "morandi",
    "teresa": "teresa", "maggiore": "maggior", "vincoli": "vincoli"
}

# Ensure every target lemma in word_map is in core
for surf, target in word_map.items():
    ensure_lemma(target, infs=[surf])

with open(core_path, "w", encoding="utf-8") as f:
    json.dump(core, f, indent=2, ensure_ascii=False)

core_set = set(e["lemmaId"] for e in core["lexicon"])

surface_to_lemma = {}
for e in core["lexicon"]:
    lid = e["lemmaId"]
    surface_to_lemma[lid.lower()] = lid
    surface_to_lemma[e["italian"].lower()] = lid
    for inf in e.get("inflections", []):
        surface_to_lemma[inf.lower()] = lid

for k, v in word_map.items():
    surface_to_lemma[k.lower()] = v

# Harvest from 1 to 65
for i in range(1, 66):
    num_str = f"0{i}" if i < 10 else f"{i}"
    ch_path = f"c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-{num_str}.json"
    if os.path.exists(ch_path):
        with open(ch_path, "r", encoding="utf-8") as f:
            ch_data = json.load(f)
        for p in ch_data["paragraphs"]:
            for s in p["sentences"]:
                tokens = re.findall(r"[\w’']+", s["text"], re.UNICODE)
                if len(tokens) == len(s["lemmas"]):
                    for t, l in zip(tokens, s["lemmas"]):
                        if l in core_set:
                            surface_to_lemma[t.lower()] = l

prefixes = [
    ("quell'", 6), ("quell’", 6),
    ("dell'", 5), ("dell’", 5),
    ("dall'", 5), ("dall’", 5),
    ("nell'", 5), ("nell’", 5),
    ("sull'", 5), ("sull’", 5),
    ("all'", 4), ("all’", 4),
    ("un'", 3), ("un’", 3),
    ("l'", 2), ("l’", 2),
    ("d'", 2), ("d’", 2)
]

def resolve(tok):
    clean = re.sub(r'^[«"“”\'‘]+|[»"“”\'’]+$', '', tok).lower()
    if not clean:
        clean = tok.lower()
    if clean in surface_to_lemma:
        l = surface_to_lemma[clean]
        if l in core_set:
            return l
    for pr, length in prefixes:
        if clean.startswith(pr):
            rest = clean[length:]
            if rest in surface_to_lemma:
                l = surface_to_lemma[rest]
                if l in core_set:
                    return l
            if rest in core_set:
                return rest
    if clean in core_set:
        return clean
    # try with apostrophe preserved or stripped
    if clean.endswith("'") or clean.endswith("’"):
        base_clean = clean[:-1]
        if base_clean in surface_to_lemma:
            l = surface_to_lemma[base_clean]
            if l in core_set:
                return l
    return clean

total_missing = 0
for i in range(1, 71):
    num_str = f"0{i}" if i < 10 else f"{i}"
    ch_path = f"c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-{num_str}.json"
    if not os.path.exists(ch_path):
        continue
    with open(ch_path, "r", encoding="utf-8") as f:
        ch_data = json.load(f)
    missing = []
    for p in ch_data["paragraphs"]:
        for s in p["sentences"]:
            tokens = re.findall(r"[\w’']+", s["text"], re.UNICODE)
            lemmas = []
            for t in tokens:
                lem = resolve(t)
                if lem not in core_set:
                    missing.append({"ch": i, "token": t, "lemma": lem, "sentence": s["id"]})
                lemmas.append(lem)
            s["lemmas"] = lemmas
    if missing:
        print(f"Chapter {i} missing: {len(missing)}")
        for m in missing[:5]:
            print("   ", m)
        total_missing += len(missing)
    with open(ch_path, "w", encoding="utf-8") as f:
        json.dump(ch_data, f, indent=2, ensure_ascii=False)

print("=" * 40)
print(f"Total missing tokens across ALL Chapters 1-70: {total_missing}")
