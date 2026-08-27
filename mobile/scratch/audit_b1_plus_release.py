import json
import os
import re
from collections import defaultdict, Counter

# Load manifest and all 70 chapters
manifest_path = "c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/manifest.json"
core_path = "c:/Users/aksch/Code/storia/mobile/content/lexicon/italian-core.json"
characters_path = "c:/Users/aksch/Code/storia/mobile/content/characters.json"

with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

with open(core_path, "r", encoding="utf-8") as f:
    core = json.load(f)

with open(characters_path, "r", encoding="utf-8") as f:
    characters = json.load(f)

chapters = []
for entry in manifest["chapters"]:
    ch_path = f"c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/{entry['file']}"
    with open(ch_path, "r", encoding="utf-8") as f:
        chapters.append(json.load(f))

print(f"Total loaded chapters: {len(chapters)}")

# 1. DIFFICULTY STAIRCASE & STATS
phase_groups = {
    "A1 (1-20)": range(1, 21),
    "A1+ (21-24)": range(21, 25),
    "A2 (25-40)": range(25, 41),
    "B1 (41-55)": range(41, 56),
    "B1+ Mov 1 (56-60)": range(56, 61),
    "B1+ Mov 2 (61-65)": range(61, 66),
    "B1+ Mov 3 (66-70)": range(66, 71)
}

group_stats = defaultdict(lambda: {"words": 0, "chapters": 0, "sentences": 0, "paragraphs": 0})
chapter_word_counts = []

for ch in chapters:
    num = ch["number"]
    w_count = 0
    s_count = 0
    p_count = len(ch["paragraphs"])
    for p in ch["paragraphs"]:
        for s in p["sentences"]:
            s_count += 1
            words = [w for w in re.findall(r"[\w’']+", s["text"]) if w]
            w_count += len(words)
    chapter_word_counts.append((num, ch["titleIt"], w_count, p_count, s_count))
    for group_name, r in phase_groups.items():
        if num in r:
            group_stats[group_name]["words"] += w_count
            group_stats[group_name]["chapters"] += 1
            group_stats[group_name]["sentences"] += s_count
            group_stats[group_name]["paragraphs"] += p_count

print("\n=== 1. DIFFICULTY STAIRCASE BY LEVEL ===")
for g, stat in group_stats.items():
    avg_words = stat["words"] // stat["chapters"] if stat["chapters"] else 0
    avg_sent_len = stat["words"] // stat["sentences"] if stat["sentences"] else 0
    print(f"[{g:18}] Chapters: {stat['chapters']:2} | Total Words: {stat['words']:6} | Avg Words/Ch: {avg_words:4} | Avg Words/Sent: {avg_sent_len:2}")

# 2. VOCABULARY RECYCLING (Key B1/B1+ Themes)
key_target_lemmas = [
    "consapevolezza", "resilienza", "equilibrio", "autonomia", "sostenibile",
    "mestiere", "comunita", "vincolo", "fiducia", "abitudine",
    "imprevisto", "margine", "tradizione", "bilancio", "accogliere",
    "artigianale", "flusso", "guasto", "accordo", "rifugio"
]

lemma_appearances = defaultdict(set)
for ch in chapters:
    num = ch["number"]
    for p in ch["paragraphs"]:
        for s in p["sentences"]:
            for lem in s.get("lemmas", []):
                lemma_appearances[lem].add(num)

print("\n=== 2. KEY B1/B1+ VOCABULARY RECYCLING ===")
for lem in key_target_lemmas:
    ch_list = sorted(list(lemma_appearances[lem]))
    count = len(ch_list)
    b1_plus_occurrences = [c for c in ch_list if c >= 56]
    print(f"Lemma: {lem:16} | Total Chapters: {count:2} | In B1+ (56-70): {len(b1_plus_occurrences):2} chapters ({b1_plus_occurrences})")

# 3. NARRATIVE CONTINUITY & CHARACTER REGISTRY
print("\n=== 3. CHARACTER INTEGRITY & VALIDATION ===")
all_char_ids = set(c["id"] for c in characters["characters"])
missing_char_declarations = []
character_appearances = defaultdict(set)

for ch in chapters:
    num = ch["number"]
    ch_char_ids = set(ch.get("characterIds", []))
    for cid in ch_char_ids:
        if cid not in all_char_ids:
            missing_char_declarations.append((num, cid))
        character_appearances[cid].add(num)
    for p in ch["paragraphs"]:
        for s in p["sentences"]:
            spk = s.get("speakerId")
            if spk and spk not in all_char_ids:
                missing_char_declarations.append((num, f"Speaker: {spk}"))

print(f"Missing character declarations: {len(missing_char_declarations)}")
for cid, chs in sorted(character_appearances.items()):
    print(f"Character: {cid:12} | Appears in {len(chs):2} chapters | Chapters: {sorted(list(chs))[:10]}...")

# 4. COMPREHENSION QUESTION AUDIT
print("\n=== 4. COMPREHENSION QUESTION QUALITY & COVERAGE ===")
total_questions = 0
question_types = Counter()
question_issues = []

for ch in chapters:
    num = ch["number"]
    qs = ch.get("questions", [])
    if len(qs) < 2:
        question_issues.append((num, f"Only {len(qs)} questions"))
    for q in qs:
        total_questions += 1
        question_types[q.get("type", "unknown")] += 1
        if len(q.get("choices", [])) != 3:
            question_issues.append((num, f"Choice count != 3: {len(q.get('choices'))}"))
        if q.get("correctChoice") != 0:
            question_issues.append((num, f"Correct choice is not 0 (canonical default)"))
        if not q.get("questionIt"):
            question_issues.append((num, "Missing questionIt"))
        if not q.get("explanation"):
            question_issues.append((num, "Missing explanation"))

print(f"Total Questions in Curriculum: {total_questions}")
print(f"Question Types Distribution: {dict(question_types)}")
print(f"Question Schema Issues: {len(question_issues)}")

print("\nAudit script complete.")
