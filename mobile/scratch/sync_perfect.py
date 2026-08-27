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

ensure_lemma("tovagliolo", "tovagliolo", "napkin", "noun", gender="masculine", ch=66, infs=["tovagliolo", "tovaglioli"])
ensure_lemma("distanza", "distanza", "distance", "noun", gender="feminine", ch=66, infs=["distanza", "distanze"])
ensure_lemma("delegare", "delegare", "to delegate", "verb", diff=2, ch=68, infs=["delegare", "delega", "delegava", "delegato"])
ensure_lemma("parametro", "parametro", "parameter / setting", "noun", gender="masculine", ch=68, infs=["parametro", "parametri"])
ensure_lemma("uniformare", "uniformare", "to standardize / make uniform", "verb", diff=2, ch=68, infs=["uniformare", "uniforma", "uniformava", "uniformato"])

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

# 1-65 harvest
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

extra_mappings = {
    "tovagliolo": "tovagliolo", "differenti": "differente", "preparate": "preparare",
    "sembravano": "sembrare", "distanza": "distanza", "gelida": "gelido",
    "permetterci": "permettere", "insegno": "insegnare", "oggetti": "oggetto",
    "basi": "base", "ritieni": "ritenere", "vasta": "vasto",
    "apprendista": "apprendista", "riflessiva": "riflessivo", "delegare": "delegare",
    "ricordi": "ricordo", "contrario": "contrario", "permette": "permettere",
    "all'analisi": "analisi", "all’analisi": "analisi", "basato": "basare",
    "riportò": "riportare", "tovagliolino": "tovagliolino", "scambiò": "scambiare",
    "varia": "vario", "adattando": "adattare", "caffè": "caffe", "caffe": "caffe",
    "po'": "poco", "po’": "poco", "po": "poco", "più": "piu", "perché": "perche",
    "già": "gia", "è": "essere", "quarant'anni": "quaranta", "quarant’anni": "quaranta",
    "spaventato": "spaventare", "lasciavano": "lasciare", "decise": "decidere",
    "cancellata": "cancellare", "sostituita": "sostituire", "mondi": "mondo",
    "studiata": "studiare", "sentore": "sentore", "ripulendo": "ripulire",
    "scacciò": "scacciare", "decisero": "decidere", "sabati": "sabato",
    "stampando": "stampare", "semplici": "semplice", "cartoncini": "cartoncino",
    "informativi": "informativo", "riciclata": "riciclato", "quarantotto": "quarantotto",
    "esauriti": "esaurito", "batteva": "battere", "dodici": "dodici",
    "raccolsero": "raccogliere", "massiccio": "massiccio", "distribuì": "distribuire",
    "panetto": "panetto", "fresca": "fresco", "guidando": "guidare",
    "inesperte": "inesperto", "riempirono": "riempire", "sciogliendo": "sciogliere",
    "tavoletta": "tavoletta", "venature": "venatura", "fibra": "fibra",
    "ascoltavano": "ascoltare", "affascinati": "affascinare", "toccando": "toccare",
    "ruvide": "ruvido", "diventavano": "diventare", "lisce": "liscio",
    "tatto": "tatto", "preparando": "preparare", "proveniente": "provenire",
    "raccolti": "raccolto", "torta": "torta", "casalinga": "casalingo",
    "mele": "mela", "cannella": "cannella", "mescolava": "mescolare",
    "tagliato": "tagliare", "assaggio": "assaggio", "usò": "usare",
    "formule": "formula", "parlò": "parlare", "abbia": "avere",
    "estragga": "estrarre", "assaggiavano": "assaggiare", "confrontando": "confrontare",
    "impressioni": "impressione", "fiori": "fiore", "agrumi": "agrume",
    "anziana": "anziano", "rivestirsi": "rivestire", "acquistarono": "acquistare",
    "ordinarono": "ordinare", "regalare": "regalare", "chiesero": "chiedere",
    "iscriversi": "iscrivere", "uscì": "uscire", "salutando": "salutare",
    "calorosamente": "calorosamente", "disordinato": "disordinato", "avanzato": "avanzare",
    "sedendosi": "sedere", "facciamo": "fare", "vendiamo": "vendere",
    "offriamo": "offrire", "sistemando": "sistemare", "costretti": "costringere",
    "avremmo": "avere", "fossero": "essere", "ripensò": "ripensare",
    "comprese": "comprendere", "operative": "operativo", "rafforzare": "rafforzare",
    "insegnato": "insegnare", "abitudini": "abitudine", "passive": "passivo",
    "durature": "duraturo", "reinventarsi": "reinventare", "precedettero": "precedere",
    "diventarono": "diventare", "infrasettimanali": "infrasettimanale", "piovosi": "piovoso",
    "entravano": "entrare", "chiacchiere": "chiacchiera", "fermarsi": "fermare",
    "registratore": "registratore", "rifletteva": "riflettere", "sufficienti": "sufficiente",
    "chiudendo": "chiudere", "auguri": "augurio", "scambiati": "scambiare",
    "fermò": "fermare", "ghirlande": "ghirlanda", "verdi": "verde",
    "portoni": "portone", "addobbate": "addobbare", "riflettevano": "riflettere",
    "sanpietrini": "sanpietrino", "compagni": "compagno", "generosi": "generoso",
    "avrebbe": "avere", "nuove": "nuovo", "nessuna": "nessuno",
    "potuto": "potere", "acceso": "accendere", "accoglierlo": "accogliere",
    "accomodi": "accomodare", "preferisce": "preferire", "preparami": "preparare",
    "fornirti": "fornire", "offrirebbero": "offrire", "comporterebbe": "comportare",
    "parametri": "parametro", "dovremmo": "dovere", "volumi": "volume",
    "uniformare": "uniformare", "fissò": "fissare", "accetti": "accettare",
    "trimestrali": "trimestrale", "contano": "contare", "portarti": "portare",
    "volevo": "volere", "avresti": "avere", "reagito": "reagire",
    "intagliati": "intagliare", "ringrazio": "ringraziare", "lavorato": "lavorare",
    "profondamente": "profondamente", "parlava": "parlare", "battuto": "battere",
    "speravo": "sperare", "confondono": "confondere", "finiscono": "finire",
    "rimasti": "rimanere", "gioventù": "gioventu", "gioventu": "gioventu",
    "apprese": "apprendere", "alzato": "alzare", "andarsene": "andarsene",
    "consigli": "consiglio", "camminando": "camminare", "fiero": "fiero",
    "illuminata": "illuminato", "rimasto": "rimanere", "rifiutare": "rifiutare",
    "lavoratore": "lavoratore", "annuale": "annuale", "divertenti": "divertente",
    "facce": "faccia", "partecipanti": "partecipante", "intrecciate": "intrecciare",
    "goccio": "goccio", "diffidente": "diffidente", "convinto": "convinto",
    "difendermi": "difendere", "continuamente": "continuamente", "contasse": "contare",
    "debolezza": "debolezza", "spezzando": "spezzare", "rispettosi": "rispettoso",
    "donatogli": "donare", "storie": "storia", "successiva": "successivo",
    "programmi": "programma", "positiva": "positivo", "passeggiava": "passeggiare",
    "l'esempio": "esempio", "l’esempio": "esempio", "passati": "passato",
    "accendi": "accendere", "accogli": "accogliere", "pigrizia": "pigrizia",
    "riponevano": "riporre", "l'apprendista": "apprendista", "l’apprendista": "apprendista",
    "insicurezze": "insicurezza", "rispettata": "rispettare", "unite": "unire",
    "scandiva": "scandire", "prepararle": "preparare", "capitolo": "capitolo",
    "pensata": "pensare", "farebbe": "fare", "opinione": "opinione",
    "attenta": "attento", "capirci": "capire", "gratificante": "gratificante",
    "leggevano": "leggere", "traducevano": "tradurre", "scambiavano": "scambiare",
    "sorseggiando": "sorseggiare", "separati": "separare", "asciugava": "asciugare",
    "correggere": "correggere", "segatura": "segatura", "appoggiandosi": "appoggiare",
    "spezzare": "spezzare", "dorati": "dorato", "asciugato": "asciugare",
    "strofinaccio": "strofinaccio", "confermavano": "confermare", "reciproca": "reciproco",
    "cresceva": "crescere", "riconosciuto": "riconoscere", "scendevano": "scendere",
    "basilica": "basilica", "spaventato": "spaventare", "piegarsi": "piegare",
    "affrontare": "affrontare", "ritrovò": "ritrovare", "scritte": "scrivere",
    "impreviste": "imprevisto", "tenevano": "tenere", "rileggendo": "rileggere",
    "sentisse": "sentire", "attraversate": "attraversare", "superate": "superare",
    "quegli": "quello", "pensassimo": "pensare", "mostrandole": "mostrare",
    "dimostrarci": "dimostrare", "qual": "quale", "un'amicizia": "amicizia",
    "un’amicizia": "amicizia", "arrivarono": "arrivare", "recuperata": "recuperare",
    "salutarono": "salutare", "commentando": "commentare", "varcasse": "varcare",
    "proseguiva": "proseguire", "godendosi": "godere", "incrociò": "incrociare",
    "riempirgli": "riempire", "valori": "valore", "studiando": "studiare",
    "italiana": "italiano", "differenze": "differenza", "bambina": "bambino",
    "tagliava": "tagliare", "diffondendo": "diffondere", "sognato": "sognare",
    "bui": "buio", "arrivò": "arrivare", "diventati": "diventare",
    "attraversava": "attraversare", "ritrovata": "ritrovare", "chiedevano": "chiedere",
    "bevevano": "bere", "parlarti": "parlare", "versandolo": "versare",
    "realizzata": "realizzare", "finisse": "finire", "voler": "volere",
    "farti": "fare", "larga": "largo", "scala": "scala", "difficoltà": "difficolta",
    "sostituirle": "sostituire", "solidità": "solidita", "graduale": "graduale",
    "sana": "sano", "bravi": "bravo", "familiarità": "familiarita",
    "darle": "dare", "fluivano": "fluire", "freschi": "fresco",
    "agganciò": "agganciare", "bruna": "bruno", "aperto": "aperto",
    "misero": "mettere", "aumentati": "aumentare", "controllando": "controllare",
    "accumulati": "accumulare", "lasciarci": "lasciare", "chiuderci": "chiudere",
    "fossimo": "essere", "guidate": "guidare", "muovendosi": "muovere",
    "naturali": "naturale", "considerava": "considerare", "attenti": "attento",
    "vederla": "vedere", "santa": "santo", "sant'andrea": "santo"
}

for k, v in extra_mappings.items():
    surface_to_lemma[k.lower()] = v

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
