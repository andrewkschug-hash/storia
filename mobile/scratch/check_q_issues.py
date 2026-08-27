import json
import re

manifest_path = "c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/manifest.json"
with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

for entry in manifest["chapters"]:
    ch_path = f"c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/{entry['file']}"
    with open(ch_path, "r", encoding="utf-8") as f:
        ch = json.load(f)
    num = ch["number"]
    qs = ch.get("questions", [])
    for q in qs:
        if q.get("correctChoice") != 0:
            # check non-zero correctChoice (which is normal in earlier randomized chapters)
            pass
        if not q.get("questionIt"):
            print(f"Ch {num}: missing questionIt")
        if not q.get("explanation"):
            print(f"Ch {num}: missing explanation")
