import json
import os
import re

core_path = "c:/Users/aksch/Code/storia/mobile/content/lexicon/italian-core.json"
with open(core_path, "r", encoding="utf-8") as f:
    core = json.load(f)

core_entries = {e["lemmaId"]: e for e in core["lexicon"]}

def ensure_lemma(lid, it, en, pos="noun", gender=None, diff=1, freq="high", ch=66, infs=None):
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

# Additional missing bases
ensure_lemma("tatto", "tatto", "touch / feel", "noun", gender="masculine", ch=67, infs=["tatto"])
ensure_lemma("luna", "luna", "moon", "noun", gender="feminine", ch=67, infs=["luna", "lune"])
ensure_lemma("vigilia", "vigilia", "eve", "noun", gender="feminine", ch=67, infs=["vigilia", "vigilie"])
ensure_lemma("set", "set", "set", "noun", gender="masculine", ch=67, infs=["set"])
ensure_lemma("catena", "catena", "chain", "noun", gender="feminine", ch=68, infs=["catena", "catene"])
ensure_lemma("titolo", "titolo", "title / right", "noun", gender="masculine", ch=68, infs=["titolo", "titoli"])
ensure_lemma("perfezionismo", "perfezionismo", "perfectionism", "noun", gender="masculine", ch=66, infs=["perfezionismo"])
ensure_lemma("pigrizia", "pigrizia", "laziness / complacency", "noun", gender="feminine", ch=67, infs=["pigrizia"])
ensure_lemma("soluzione", "soluzione", "solution", "noun", gender="feminine", ch=67, infs=["soluzione", "soluzioni"])
ensure_lemma("coppia", "coppia", "couple / pair", "noun", gender="feminine", ch=67, infs=["coppia", "coppie"])
ensure_lemma("meraviglia", "meraviglia", "wonder / marvel", "noun", gender="feminine", ch=67, infs=["meraviglia", "meraviglie"])
ensure_lemma("linea", "linea", "line / guideline", "noun", gender="feminine", ch=68, infs=["linea", "linee"])
ensure_lemma("temporaneo", "temporaneo", "temporary", "adjective", ch=67, infs=["temporaneo", "temporanea", "temporanei", "temporanee"])
ensure_lemma("sonoro", "sonoro", "sonorous / resonant", "adjective", ch=68, infs=["sonoro", "sonora", "sonori", "sonore"])
ensure_lemma("banco", "banco", "bench / counter", "noun", gender="masculine", ch=67, infs=["banco", "banchi"])
ensure_lemma("gancio", "gancio", "hook", "noun", gender="masculine", ch=67, infs=["gancio", "ganci"])

with open(core_path, "w", encoding="utf-8") as f:
    json.dump(core, f, indent=2, ensure_ascii=False)

core_set = set(e["lemmaId"] for e in core["lexicon"])

# Direct mapping for all 272 unmapped forms
mapping = {
    "agganciò": "agganciare", "agganci": "agganciare", "decisero": "decidere",
    "preparami": "preparare", "rileggendo": "rileggere", "sabati": "sabato",
    "accendi": "accendere", "accogli": "accogliere", "accoglierlo": "accogliere",
    "accomodi": "accomodare", "accorti": "accorgersi", "accumulati": "accumulare",
    "acquistarono": "acquistare", "adattando": "adattare", "addobbate": "addobbare",
    "affascinati": "affascinare", "affezionati": "affezionato", "all'analisi": "analisi",
    "all’analisi": "analisi", "allettante": "allettante", "amore": "amore",
    "andarono": "andare", "anziana": "anziano", "apprendista": "apprendista",
    "apprese": "apprendere", "appuntamenti": "appuntamento", "arrivarono": "arrivare",
    "arrivò": "arrivare", "arriv": "arrivare", "asciugava": "asciugare",
    "ascoltavano": "ascoltare", "assaggiavano": "assaggiare", "attenta": "attento",
    "attenti": "attento", "attraversate": "attraversare", "attraversava": "attraversare",
    "aumentati": "aumentare", "avanzato": "avanzare", "avermi": "avere",
    "avremmo": "avere", "bambina": "bambino", "banchi": "banco",
    "basato": "basare", "basi": "base", "bevevano": "bere",
    "bui": "buio", "calorosamente": "calorosamente", "cancellata": "cancellare",
    "capirci": "capire", "capitolo": "capitolo", "cartoncini": "cartoncino",
    "catena": "catena", "chiacchiere": "chiacchiera", "chiedevano": "chiedere",
    "chiesero": "chiedere", "chiudendo": "chiudere", "chiuderci": "chiudere",
    "commentando": "commentare", "commenti": "commento", "commosso": "commosso",
    "comode": "comodo", "competitiva": "competitivo", "comporterebbe": "comportare",
    "confermavano": "confermare", "confidato": "confidare", "confondono": "confondere",
    "confrontando": "confrontare", "considerava": "considerare", "contano": "contare",
    "contasse": "contare", "continuamente": "continuamente", "contrario": "contrario",
    "controllando": "controllare", "convinto": "convinto", "coppia": "coppia",
    "costretti": "costringere", "d'ulivo": "olivo", "d’ulivo": "olivo",
    "dall'annuncio": "annuncio", "dall’annuncio": "annuncio", "darle": "dare",
    "debolezza": "debolezza", "decise": "decidere", "dell'africa": "africa",
    "dell’africa": "africa", "dell'america": "america", "dell’america": "america",
    "dell'intera": "intero", "dell’intera": "intero", "difendermi": "difendere",
    "differenze": "differenza", "diffidente": "diffidente", "diffondendo": "diffondere",
    "dimostrarci": "dimostrare", "disordinato": "disordinato", "diventarono": "diventare",
    "diventati": "diventare", "diventavano": "diventare", "divertenti": "divertente",
    "donatogli": "donare", "efficiente": "efficiente", "esauriti": "esaurito",
    "estragga": "estrarre", "facce": "faccia", "fallire": "fallire",
    "farebbe": "fare", "farti": "fare", "fidati": "fidato",
    "finiscono": "finire", "finisse": "finire", "fiori": "fiore",
    "fissò": "fissare", "fiss": "fissare", "fornirti": "fornire",
    "forzarli": "forzare", "fossimo": "essere", "frattempo": "frattempo",
    "freschi": "fresco", "ganci": "gancio", "gelida": "gelido",
    "generosi": "generoso", "ghirlande": "ghirlanda", "gioventù": "gioventu",
    "giovent": "gioventu", "goccio": "goccio", "godendosi": "godere",
    "grandezza": "grandezza", "guardarono": "guardare", "guidando": "guidare",
    "guidate": "guidare", "guidato": "guidare", "imbarazzo": "imbarazzo",
    "impreviste": "imprevisto", "incidenti": "incidente", "incrociò": "incrociare",
    "incroci": "incrociare", "indescrivibile": "indescrivibile", "inesperte": "inesperto",
    "influenzi": "influenzare", "informativi": "informativo", "infrasettimanali": "infrasettimanale",
    "insegnanti": "insegnante", "insegno": "insegnare", "insicurezze": "insicurezza",
    "integrarsi": "integrare", "intrecciate": "intrecciare", "inventare": "inventare",
    "iscrivere": "iscrivere", "italiana": "italiano", "l'apprendista": "apprendista",
    "l’apprendista": "apprendista", "l'esempio": "esempio", "l’esempio": "esempio",
    "lasciarci": "lasciare", "lasciavano": "lasciare", "lavoratore": "lavoratore",
    "leggendo": "leggere", "leggevano": "leggere", "lezioni": "lezione",
    "linee": "linea", "lisce": "liscio", "luna": "luna",
    "macinati": "macinare", "meraviglia": "meraviglia", "meteorologica": "meteorologico",
    "misero": "mettere", "mondi": "mondo", "mostrandole": "mostrare",
    "muovendosi": "muovere", "nata": "nascere", "naturali": "naturale",
    "nell'espansione": "espansione", "nell’espansione": "espansione", "offrirebbero": "offrire",
    "oggetti": "oggetto", "ordinarono": "ordinare", "parlarti": "parlare",
    "partecipanti": "partecipante", "passati": "passato", "passeggiava": "passeggiare",
    "passive": "passivo", "pensassimo": "pensare", "pensata": "pensare",
    "percepisce": "percepire", "perfezionismo": "perfezionismo", "permette": "permettere",
    "permetterci": "permettere", "piegarsi": "piegare", "pigrizia": "pigrizia",
    "portarti": "portare", "portoni": "portone", "positiva": "positivo",
    "potersi": "potere", "precedettero": "precedere", "preferisce": "preferire",
    "pregiudizi": "pregiudizio", "prepararle": "preparare", "preparate": "preparare",
    "proseguiva": "proseguire", "qual": "quale", "quarantotto": "quarantotto",
    "quarant'anni": "quaranta", "quarant’anni": "quaranta", "quarantanni": "quaranta",
    "quegli": "quello", "raccolsero": "raccogliere", "raccolti": "raccolto",
    "rafforzare": "rafforzare", "realizzata": "realizzare", "recuperata": "recuperare",
    "registratore": "registratore", "relazioni": "relazione", "resistenze": "resistenza",
    "riciclata": "riciclato", "riconoscendo": "riconoscere", "riconoscimento": "riconoscimento",
    "riconosciuto": "riconoscere", "ricordando": "ricordare", "riempirgli": "riempire",
    "riempirono": "riempire", "riflessione": "riflessione", "riflessiva": "riflessivo",
    "rimpianto": "rimpianto", "riponevano": "riporre", "riportò": "riportare",
    "riport": "riportare", "ripulendo": "ripulire", "rispettata": "rispettare",
    "rispettosi": "rispettoso", "ritieni": "ritenere", "ritrovata": "ritrovare",
    "ritrovò": "ritrovare", "ritrov": "ritrovare", "rivelava": "rivelare",
    "rivestirsi": "rivestire", "rovinarne": "rovinare", "salutarono": "salutare",
    "scacciò": "scacciare", "scacci": "scacciare", "scambiavano": "scambiare",
    "scambiò": "scambiare", "scambi": "scambiare", "scandiva": "scandire",
    "scritte": "scrivere", "sedendosi": "sedere", "sembravano": "sembrare",
    "sembravi": "sembrare", "semplici": "semplice", "sentisse": "sentire",
    "separati": "separare", "set": "set", "sognato": "sognare",
    "soluzione": "soluzione", "sonoro": "sonoro", "sorrisi": "sorriso",
    "sostenibili": "sostenibile", "sostituirle": "sostituire", "sostituita": "sostituire",
    "speravo": "sperare", "spezzando": "spezzare", "stampando": "stampare",
    "storie": "storia", "studiando": "studiare", "studiata": "studiare",
    "successiva": "successivo", "superate": "superare", "tagliava": "tagliare",
    "tatto": "tatto", "tavoletta": "tavoletta", "temporanea": "temporaneo",
    "tenevano": "tenere", "timido": "timido", "titolo": "titolo",
    "toccando": "toccare", "tovagliolino": "tovagliolino", "traducevano": "tradurre",
    "trimestrali": "trimestrale", "un'amicizia": "amicizia", "un’amicizia": "amicizia",
    "uniche": "unico", "unite": "unire", "uomini": "uomo",
    "usò": "usare", "us": "usare", "valori": "valore",
    "varcasse": "varcare", "varia": "vario", "vasta": "vasto",
    "vederla": "vedere", "vellutata": "vellutato", "versandolo": "versare",
    "versandosi": "versare", "vigilia": "vigilia", "voler": "volere"
}

surface_to_lemma = {}
for e in core["lexicon"]:
    lid = e["lemmaId"]
    surface_to_lemma[lid.lower()] = lid
    surface_to_lemma[e["italian"].lower()] = lid
    for inf in e.get("inflections", []):
        surface_to_lemma[inf.lower()] = lid

for k, v in mapping.items():
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
