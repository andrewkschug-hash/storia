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

# Add any additional missing bases
ensure_lemma("scaffale", "scaffale", "shelf", "noun", gender="masculine", ch=66, infs=["scaffale", "scaffali"])
ensure_lemma("professore", "professore", "professor / teacher", "noun", gender="masculine", ch=66, infs=["professore", "professori"])
ensure_lemma("libreria", "libreria", "bookstore / bookcase", "noun", gender="feminine", ch=67, infs=["libreria", "librerie"])
ensure_lemma("comitato", "comitato", "committee / board", "noun", gender="masculine", ch=68, infs=["comitato", "comitati"])
ensure_lemma("ricetta", "ricetta", "recipe", "noun", gender="feminine", ch=68, infs=["ricetta", "ricette"])
ensure_lemma("programma", "programma", "program / plan", "noun", gender="masculine", ch=70, infs=["programma", "programmi"])
ensure_lemma("differente", "differente", "different", "adjective", ch=66, infs=["differente", "differenti"])

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
    return None

# Find all remaining unmapped tokens across 66-70
unmapped = set()
for i in range(66, 71):
    ch_path = f"c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-{i}.json"
    with open(ch_path, "r", encoding="utf-8") as f:
        ch_data = json.load(f)
    for p in ch_data["paragraphs"]:
        for s in p["sentences"]:
            tokens = re.findall(r"[\w’']+", s["text"], re.UNICODE)
            for t in tokens:
                if not resolve(t):
                    unmapped.add(t)

print(f"Total unique unmapped: {len(unmapped)}")
print(sorted(list(unmapped)))
