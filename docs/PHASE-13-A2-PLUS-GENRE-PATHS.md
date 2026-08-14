# Phase 13 — A2+ genre paths (architecture / audit only)

**Status:** planning. Not in the catalog. Not available. No prose, JSON, audio, exercises, player wiring, or CEFR threshold changes.

**Authoring (thriller first):** `docs/PHASE-13A-1-CASA-DELLE-FINESTRE-AUTHORING.md` — chapter-by-chapter spec. Do not start from “write 24 A2+ chapters.” Author one chapter at a time. Romance (13A-2) and fantasy (13A-3) wait until that spec is done.

**Do not implement this file.** Do not edit Luca a Roma (including **Ch 25–40**), Pre-Rome, Elena, A1 readiness, scoring, or reader.

**Relation to Phase 13A:** `docs/PHASE-13A-THREE-GENRE-PATHS.md` is a different bible (Valdombra; *Il caso della casa vuota* / *Messaggi da non mandare* / *La mappa di pietra*; A1+→A2). **Do not merge, replace, or catalog either set** until a product decision. This document is **A2+ after the existing A1 (+ Luca A2) foundation**, with the three premises named in this brief.

**Continuity:** These paths are **not** Luca Ch 41+. They are **not** replacements for Luca A2. No Luca/Sofia/Marco cast unless requested later.

**Elena name:** Romance title uses Elena. Catalog already has `elena` / `elena-torna-a-casa` (A1 draft). Romance protagonist must be a **new ID** (recommended: `elena-marini`).

---

# Architecture audit (inspect only)

## What exists today

| Piece | Finding |
|---|---|
| Catalog | `available`: five Pre-Rome + `luca-a-roma` (40). `draft`: Elena. **No A2+ story rows.** |
| Luca arcs | A2 = Ch 25–40 **available**. A2+ arc `luca-a-roma-a2-plus` is **planned**, `chapterStart` 41 / `chapterEnd` 40 (empty placeholder). **Do not fill it with these genre paths.** |
| CEFR profiles | `A2+` already exists (`wordCountRange` 500–900, avg sentence 12). `narrativeStage` is still Luca’s “New problems.” Paths should use **story-local** stage copy later, not rewrite `CEFR_PROFILES` in this phase. |
| Loader | `getContentBundle(storyId)` + Metro-static maps (`preRomeSources.ts` pattern). New stories need **new registrations**, not Luca files. |
| IDs | Progress is `(storyId, chapterId)`. Chapter numbers are **not** globally unique. |
| Journey | `buildLearnerJourney()` is A1 Pre-Rome + Luca 1–20 / 21–24 / 25–40. **No genre picker.** |
| Validation | `validateStoryCatalog`: planned `chapterCount` must be **0**; **`chapterCountTarget` must be 5–8**. That rule is Pre-Rome-shaped. **A2+ novels cannot ship as `planned` without relaxing that check later.** |
| A1 readiness | Cross-story A1 model is separate. **Do not hook genre paths into it.** |
| Luca A2 files | `content/stories/luca-a-roma/chapters/chapter-25.json` … `chapter-40.json` + `docs/A2-CONTINUITY.md`. **Frozen for this phase.** |

## A. Files/directories that would eventually be needed

(Not created now.)

```
mobile/content/stories/la-casa-delle-finestre/
  manifest.json
  arcs.json
  sentence-english.json
  chapters/chapter-01.json …
  characters.json          (story-local)
  locations.json           (story-local)

mobile/content/stories/lettera-per-elena/     (same shape)
mobile/content/stories/il-villaggio-che-non-esiste/   (same shape)

Later (implementation phase, not now):
- story-catalog.json  — new arc + three stories, status planned then available
- a registry like preRomeSources.ts (or a generic registered-story map)
- journey / Stories UI — selectable A2+ paths (after Luca A2, not inside it)
- validateCatalog — allow novel-length chapterCountTarget
```

Optional later: `production-exercises.json` per story. **Out of scope.**

## B. Existing files that must not be touched (this phase and when authoring)

- `mobile/content/stories/luca-a-roma/chapters/chapter-25.json` … `chapter-40.json`
- Luca `manifest.json`, `arcs.json`, `sentence-english.json`, `adaptive-variants.json`
- `docs/A2-CONTINUITY.md`
- All `luca-prima-di-roma-*`
- `elena-torna-a-casa/**`
- CEFR threshold / `DIFFICULTY_WEIGHTS` / readiness algorithms
- Reader, audio, STT, production scoring

## C. Architectural risks

1. **`chapterCountTarget` 5–8** — blockers for 24-chapter novels while `planned`.
2. **Luca A2+ empty arc (41–40)** — easy to misuse as “put genre stories here.” They need **their own storyIds**.
3. **Metro static imports** — each new chapter is a bundler entry. 24×3 = 72 chapter files; fine if registered deliberately, painful if someone dumps into Luca.
4. **`protagonistId: "elena"`** — collision with draft Elena.
5. **Journey model** is sequential bands, not “choose one of three.” Selection is new product, not a catalog tweak.
6. **A2+ profile word counts (500–900)** — use as a **ceiling band**, not a pad-to-900 rule. Early chapters should start **under** Luca A2 mid-length if needed, then climb.
7. **Two Phase-13 bibles** — writers must be told which premises are live.

## D. Recommended story IDs

| Path | Title (IT) | storyId | protagonistId | chapter IDs |
|---|---|---|---|---|
| Thriller | La casa delle finestre | `la-casa-delle-finestre` | `irene-colombo` | `la-casa-delle-finestre-01` … |
| Romance | Una lettera per Elena | `lettera-per-elena` | `elena-marini` | `lettera-per-elena-01` … |
| Fantasy | Il villaggio che non esiste | `il-villaggio-che-non-esiste` | `giada-rinaldi` | `il-villaggio-che-non-esiste-01` … |

Arc ID (later): `a2-plus-genre-paths`  
Arc status: `planned` until a path is authored.  
`narrativeOrder` of the three stories: **equal choice** (e.g. 10, 11, 12) **after** Luca (`6`), **not** a forced 1→2→3 sequence.

## E. Ordering / metadata model (later)

- `cefrLevel`: `A2+`
- `cefrLevels`: `["A2+", "B1"]` only if late chapters truly reach B1 **on purpose**; default keep **A2+ only** and bridge *toward* B1 in language, not by relabeling Luca.
- `status`: `planned`, `chapterCount`: 0 until ship.
- `entitySource`: `shared+story-local` (new places/people; **do not** add Luca).
- New optional flag (not implemented now): `selectionGroup: "a2-plus-genre"` — Stories UI shows one picker, progress keyed per `storyId`.
- Completing thriller must **not** complete romance chapters. Already true if IDs stay distinct.

---

# Cross-path rules

Independent. No shared plot. No required reading order. Optional “try another path” is **not** this phase.

Shared **only** at the level of Italy: trains, *comune*, small towns. Different towns:

| Story | Town |
|---|---|
| Thriller | **San Quirico sul Nera** (Umbria, invented) |
| Romance | **Marina di Brenta** (Veneto lagoon edge, invented) |
| Fantasy | **Collevento** (halt that left the timetable; invented) |

---

# Language staircase (all three, not a syllabus)

Aligned with existing `CEFR_PROFILES.A2+` as a **target band**, not a worksheet.

| Block | Chapters | Words / ch (guide) | Language (emergent) |
|---|---|---|---|
| Early A2+ | 1–8 | ~350–550 | Present + controlled *passato prossimo*; light *imperfetto* for habit; *perché / quando / mentre / quindi / però*; modals; reflexives; object pronouns in talk; more dialogue |
| Middle A2+ | 9–16 | ~500–750 | PP vs *imperfetto* in real narration; *vorrei / potrebbe / sarebbe*; *ci / ne*; future for plans; cause/effect; opinions |
| Late A2+ | 17–24 | ~650–900 | Sustained past; hypothetic *se*; uncertainty; richer description; still readable — **not** a B1 dump |

Repetition = characters, places, objects, mutated sentences — not copy-paste lines.

---

# Story 1 — Thriller

## 1. Final title

**La casa delle finestre**

## 2. Genre

Thriller / mystery. Grounded. No ghost requirement.

## 3. Hook

Irene moves into a cheap attic opposite a school that has been closed for two years. Every night a light moves from window to window. She maps it. The lights follow the old timetable. Then, one night, the pattern changes — as if it saw her.

## 4. Protagonist

**Irene Colombo**, 27. Archivist on a short contract to digitize *comune* files (including the closed school). Not a detective. She notices patterns because that is her job. Flaw: she treats people like documents (order, dates) until that fails.

## 5. Supporting cast

| Person | Role |
|---|---|
| **Sara Neri**, 34 | Ex-teacher. The lamp. Fired after she reported cracks in the building |
| **Quinto Belli**, 61 | Custode, still has keys, drinks, tells the official story |
| **Dottoressa Alme**, 50s | Dirigente scolastica / now *comune* education clerk; wants registers shredded |
| **Loredana**, 44 | Irene’s landlady; daughter was in the last class |
| **Mimmo**, 19 | Skateboard, dares, misleading “ghost” videos |
| **Maresciallo Piva** | Competent; enters late |

## 6–7. Conflict / question

**Conflict:** Irene wants a true archive. Someone wants the school’s last year to stay a rumor.  
**Question:** Who moves the light, and is it a message — or only her pattern-seeking?

## 8. What is not generic

Not a haunted house and not a serial killer. The “code” is first **apophenia** (old timetable + one lamp). Then it **becomes** communication when Sara realizes she is watched. The crime is bureaucratic: cracks reported, school closed, blame shifted, paper to destroy. Irene is inside the *comune* that wants the shredding.

## 9. Setting

San Quirico sul Nera. Attic on Via della Scuola. *Ex scuola media* with a grid of identical windows (the “house of windows”). *Comune* basement archive. Bar of Loredana’s cousin.

## 10. Arcs

- Irene: from mapper to witness who must choose colleagues vs evidence.
- Sara: from hiding to using the windows on purpose, then daylight.
- Alme: from polite obstruction to a named choice (not a cartoon villain).

## 11. Beginning → middle → ending

Arrive, map lights, believe they speak to her → meet the false suspects (Mimmo, Quinto) → understand timetable → find Sara → registers vs shredder → lights stop because the truth is in a USB, not in glass.

## 12. Chapter count

**24.** Enough for pattern → misread → contact → cost. Not 40.

## 13. Chapter-by-chapter outline

**1 La griglia.** Irene unpacks. Night: one window lit, then another. Hook: third window, same floor.  
**2 La scuola chiusa.** Landlady: earthquake, unsafe, empty. Hook: Quinto waters a dead courtyard.  
**3 Il contratto.** *Comune* job: digitize “whatever is left.” Alme smiles. Hook: a folder labeled *non scansionare*.  
**4 Il quaderno.** Irene draws the façade, numbers windows. Hook: Monday’s path ≠ Tuesday’s.  
**5 Mimmo.** Kids film “ghosts.” Irene almost believes them. Hook: Mimmo’s video timestamp is **afternoon**.  
**6 Quinto.** Custode: he does not go up. Keys exist. Hook: he lies about which key.  
**7 L’orario.** In a leftover photocopy: 1A room 2 at 15:00, 2B room 5… Hook: her map matches **last year’s timetable**.  
**8 Lei pensa a me.** She stands at her attic window. The lamp **pauses** in the window that faces her. First possible contact.  
**9 Ieri.** *Ieri* the pause. Today no light. Hook: a camping-battery blister pack in the gutter.  
**10 Non scansionare.** She opens the forbidden folder: Sara Neri’s report on cracks, ignored. Hook: Alme asks if she “found anything odd.”  
**11 Sara.** Name on a class photo. Fired. Town says she was hysterical. Hook: the same woman in a night bus reflection (maybe).  
**12 Il secondo piano.** Irene does not enter (unsafe). She watches. Lamp in the old **teachers’ room**. Hook: a phone torch answers from **her** building’s stair — Loredana, sleepless, not Sara. Mislead.  
**13 Loredana.** Daughter’s class was the last. She wants the school forgotten. Hook: she cries when Irene numbers the windows.  
**14 Il codice vero.** Night: lamp taps a stupid, human pattern: three long in the facing window. Irene, against sense, taps her desk lamp back. Hook: two long. Stop.  
**15 Non chiamare.** Next night, paper in the grate: *NON CARABINIERI. REGISTRI.* Hook: Alme schedules shredding for Friday.  
**16 La scelta di Irene.** Tell Piva / tell Alme / find Sara. She stalls one day. Hook: Quinto offers her the “safe” key if she drops the folder.  
**17 Incontro.** Daylight, behind the gym. Sara: lamp was for work, not Irene — until the pause. She needs the registers before Friday. Hook: she asks Irene to steal time, not the files.  
**18 Il seminterrato.** Archive hours. Irene “loses” a box. Moral dirt. Hook: Alme notices the gap.  
**19 Quinto cambia.** He saw the cracks too. He will not testify. He will not stop Sara. Hook: he leaves the gate unchained once.  
**20 Venerdì.** Shredder booked. Race that is paperwork, not a chase. USB copy. Hook: Alme finds Irene in the corridor.  
**21 La dirigente.** Conversation, not a fight scene. Alme: closing saved lives / closing saved careers. Both. Hook: she lets one box “already shredded” exist. Cowardice as mercy.  
**22 Piva.** Irene goes late, as she should have. Sara is angry and then relieved. Hook: the school stays closed; the story will be local, not national.  
**23 Senza luce.** Windows dark. Irene cannot sleep anyway. Hook: she numbers the windows one last time and stops.  
**24 L’archivio.** New contract denied. She leaves town with copies that are not hers to sell. Payoff: the grid is just a building. She still looks up.

Each chapter **changes** knowledge, suspicion, or Irene’s complicity.

## 14. Word progression

Ch 1–8: 350–550 · Ch 9–16: 500–750 · Ch 17–24: 650–850. **Do not pad to 900.**

## 15–17. Language / domains / grammar

**Domains:** house, school, time, work, civic, light/dark, numbers.  
**Mutate:** *è vuota* → *sembra vuota* → *qualcuno c’è* → *perché quella finestra?*  
**Grammar from plot:** times and *mentre* (watching); PP *ieri* (the pause); *dovrei chiamare*; *se lo dico, lei perde il lavoro*.

## 18–20. Twists / foreshadow / ending

**Twists:** Pattern is timetable, not a code **until** Sara answers; Loredana is grief not the lamp; Alme is not a murderer.  
**Foreshadow:** *non scansionare* (Ch 3); dead courtyard water (Quinto’s guilt); Mimmo’s daylight fake.  
**Ending:** Communication ends because it succeeded. No explosion. Cost: Irene’s contract.

## 21. Why an A2 learner continues

The façade is a readable puzzle (windows you can count). Then it becomes a person. Then Irene is dirty. You stay for whether she shreds or sends.

---

# Story 2 — Romance / drama

## 1. Final title

**Una lettera per Elena**

(Keep the title. Protagonist ID is **not** catalog `elena`.)

## 2. Genre

Romance / contemporary drama. Chemistry on paper vs clumsiness in air.

## 3. Hook

At Caffè Brenta, one unsellable book lives on the shelf by the sugar. People write in it. Elena writes back to a stranger who tells the truth there. On Tuesdays she already knows a quiet man named **Pietro** who delivers coffee. She does not know his handwriting.

## 4. Protagonist

**Elena Marini**, 29. New barista, back in her mother’s town after a job in Padova ended. Talks easily at the counter. Honest only in the book. Flaw: she prefers the note-person to any real face.

## 5. Supporting cast

| Person | Role |
|---|---|
| **Pietro Baldo**, 32 | Roaster’s driver, Tuesdays. Writes in the book. Stutters when it matters |
| **Bruna**, 58 | Café owner; the book was her idea, almost a shrine |
| **Katia**, 26 | Other barista; sees everything, says little |
| **Marta Marini** | Elena’s mother — **not** Luca’s Marta if we ever share lexicon; prefer **Mirella Marini** in prose. Use **Mirella**. |
| **Sergio** | Pietro’s brother, accident, recovery — pressure, not a prop death |

## 6–7. Conflict / question

**Conflict:** Two people already in each other’s ordinary week, telling the truth only to an object.  
**Question:** When the book-person has a face, do they still want each other?

## 8. What is not generic

Not anonymous soulmates who first meet at the reveal. **Dramatic irony:** the reader can guess by mid-story; they cannot. Not a billionaire. Not a love triangle. The book is a **habit Bruna protects** (her late husband started it). Notes begin ugly-practical (*questo tavolo balla*), not poetry.

## 9. Setting

Marina di Brenta. Caffè Brenta. Fog, bicycles, the lagoon in one chapter only (earned outing). Elena’s mother’s kitchen. Pietro’s van.

## 10. Arcs

- Elena: from hiding in handwriting to risking speech.
- Pietro: from using the book as a crutch after Sergio’s accident to speaking a short true sentence.
- Bruna: from priestess of the book to letting it be just a book.

## 11. Beginning → middle → ending

Notes → addiction to the voice → Tuesday small talk that is *worse* than the notes → leak of a phrase → choice to close the book or keep a double life → one letter with a name, left in the book, then a conversation in the back room that is imperfect.

## 12. Chapter count

**22.** Romance dies if stretched to “season.” 22 leaves room for work, family, a fight, repair.

## 13. Chapter-by-chapter outline

**1 Lo zucchero.** First shift. The fat book. A line already there: *questo tavolo balla.* Elena writes *vero.*  
**2 Bruna.** Rules: don’t sell it, don’t take it home, don’t ask who. Hook: Bruna almost cries, doesn’t explain.  
**3 Martedì.** Pietro delivers. Weather talk. Dead air. Hook: he looks at the shelf, not at her.  
**4 La seconda riga.** New note: *oggi ho paura del silenzio.* Elena answers too much.  
**5 Katia.** “Everyone writes. Nobody admits.” Hook: Katia has never written.  
**6 Mirella.** Mother wants Elena to stay. Elena uses the café as escape. Hook: mother: “Tuo padre parlava così, sulla carta.”  
**7 Pietro di nuovo.** She tries to be the note. She fails. He spills beans. Comedy.  
**8 Sergio.** He writes about a brother who doesn’t sleep. Elena assumes a breakup.  
**9 Ieri ho scritto troppo.** Shame. She still reads.  
**10 Bruna racconta.** Husband dead four years. The book was how shy people stayed. Hook: “Non è un gioco.”  
**11 Una frase in voce.** Pietro at the counter: *oggi ho paura del silenzio* — as a joke about the noisy fridge. Elena freezes. He doesn’t notice.  
**12 Lei non dice.** Katia sees the freeze. Hook: “È lui, vero?” Elena: “Non lo so.” Lie.  
**13 Il vano.** She almost writes *sei Pietro?* She writes about the lagoon instead.  
**14 Uscita.** Bruna forces a staff + driver spritz. They are worse in a group. Hook: he leaves early for Sergio.  
**15 Ospedale (non dentro).** Elena waits outside. First care that isn’t ink. Hook: he is angry she came.  
**16 Litigio.** Book vs life. She: you already talk to me. He: that’s not talking.  
**17 Il libro chiuso.** Bruna puts it under the counter for three days. Both suffer.  
**18 Una lettera.** Elena writes on real paper: *Una lettera per Elena* as a joke-title, then her name, then *se sei Pietro, dimmelo al bancone.* Leaves it **in** the book.  
**19 Al bancone.** He says his name like an idiot. She laughs. Not a kiss chapter.  
**20 Dietro.** Store-room conversation. Clumsy. True. *Vorrei riprovare, in voce.*  
**21 Il libro resta.** They still write sometimes, on purpose, not as hiding. Bruna approves.  
**22 Aperto.** Morning shift. He comes on a Thursday, not only Tuesday. Fog. Work. No wedding.

## 14. Word progression

Ch 1–8: 380–560 (dialogue-heavy) · 9–16: 520–720 · 17–22: 600–800.

## 15–17. Language / domains / grammar

**Domains:** café, food, work, family, health (light), feelings, handwriting.  
**Mutate:** *non lo dico* → *l’ho scritto* → *non l’ho detto* → *adesso lo dico.*  
**Grammar from plot:** notes as present/PP; *vorrei*; reported speech (*ha detto che*); *se sei tu*.

## 18–20. Twists / foreshadow / ending

**Twist:** Not “the writer is a celebrity.” The writer is the boring Tuesday man. Mid-point leak (Ch 11), not finale.  
**Foreshadow:** He looks at the shelf (Ch 3); father wrote on paper (Ch 6); fridge joke.  
**Ending:** Named, imperfect, still working. Book remains a place, not a secret.

## 21. Why an A2 learner continues

They want the moment she puts a face on a sentence. Then they want to know if speech ruins it.

---

# Story 3 — Fantasy / adventure

## 1. Final title

**Il villaggio che non esiste**

## 2. Genre

Grounded folkloric fantasy / adventure of discovery. No magic system, no chosen one.

## 3. Hook

Giada, 17, falls asleep on the train to her father’s. She gets off at **Collevento** — a halt crossed out of the timetable. The village is there. They say she has been here before. After sunset the road is water. Every morning a house has moved, or a name has changed. They are not kidding.

## 4. Protagonist

**Giada Rinaldi**, 17. Going to dad in Trento for the summer, mom in Bologna. Angry in a quiet way. She takes photos because she doesn’t trust memory. Flaw: she treats the village as a riddle to beat, like her parents’ marriage.

## 5. Supporting cast

| Person | Role |
|---|---|
| **Elsa**, 60s | Inn. Calls Giada “Anna” once |
| **Tullio**, 70s | Knows the dam release times |
| **Neri**, ~17 | Local, wants to leave, cannot after dark |
| **Anna Rinaldi** | Giada’s mother, absent; summer 2007 here |
| **L’ingegnere** | Company man, polite, eviction-with-a-smile |
| **Papà** | Phone only until late; thinks she missed a stop |

## 6–7. Conflict / question

**Conflict:** Stay in a place that claims her vs get out before she becomes another Anna in the register.  
**Question:** Why does the village not exist on maps, and why does it know her face?

## 8. What is not generic

Not Narnia. **Collevento was supposed to be flooded** for a dam that was never finished. It was deleted from maps as “future lake.” People stayed. **Sunset rule:** the company still opens the sluice on a clock; the access road sheets with water. **Forest rule:** sinkholes and a fenced memorial to the 1978 survey team, not a monster. **Morning changes:** Elsa and others **re-stage the village** for an inspection that was promised for thirty years — moving signs, hanging different names — a cargo-cult bureaucracy. They also confuse Giada with **Anna at 17** (photos, same bag Giada stole from mum). Fantasy feeling = stuck time + wrong identity, with physics underneath.

## 9. Setting

Disused halt, one street, inn, chapel, dam road, forest fence, hydro building downhill (lights at night — not windows-across-the-street plot).

## 10. Arcs

- Giada: from “wrong train” to choosing how to remember Anna without becoming her.
- Elsa: from using the girl as a returned daughter to seeing Giada.
- Neri: from wanting the map to exist to understanding why elders deleted it.
- Village: inspection finally comes, or doesn’t — either way the ritual is exposed.

## 11. Beginning → middle → ending

Wrong stop → rules → “you’ve been here” → mother’s name in the register with **today’s date** (copied page) → dam clock → forest memorial → engineer → Giada calls her mother → she leaves at **dawn**, not night, on a maintenance rail cart / weekday bus that exists if you know. Village remains off the tourist map. She keeps one photo Elsa didn’t want taken.

## 12. Chapter count

**24.** Discovery needs walking days; not an epic.

## 13. Chapter-by-chapter outline

**1 Il treno sbagliato.** Sleep. Halt. No one else down. Hook: sign *Collevento* with a line through it.  
**2 C’è.** Street, smoke, inn. Elsa: “Finalmente.” Hook: a room already made up.  
**3 Nonna, no.** Giada: I’m 17, I’m going to Trento. Elsa: “Anna diceva così.”  
**4 Le regole.** Sunset: no leaving. Forest: no. Morning: “look at the square.” Hook: she laughs. They don’t.  
**5 Papà al telefono.** No signal until a field. He: take the next train. There isn’t one.  
**6 Il tramonto.** She tries the road. Water. Tullio with a thermos: “Ogni sera. L’ora è l’ora.”  
**7 Neri.** Cigarette, English songs, hate. He was born here. Hook: he has a folded modern map with a **blank**.  
**8 Il registro.** Inn book: *Anna Rinaldi, 17 anni* — date **today**. Hook: the ink is old.  
**9 Ieri.** She photographs the square.  
**10 Il mattino.** A shop sign has a different name. Bench moved. Not magic: she catches Elsa with a ladder.  
**11 L’ispezione.** Tullio: they come in autumn. They never come. Thirty years.  
**12 La foto di Anna.** Drawer: mother, 17, same jaw. Giada is angry at the theft of her face.  
**13 Il bosco.** She goes anyway. Fence, skull-and-crossbones that is actually **sinkhole** pictogram. Hook: names of the 1978 team.  
**14 Neri racconta.** Dam, lake that wasn’t, maps redrawn. “Non esistiamo per aiutarli.”  
**15 L’ingegnere.** Daylight visit. Smiles. Offers compensation. Sunset he **leaves in a high car**. Rules are for residents.  
**16 Giada odia Elsa.** Fight. Elsa wanted Anna back, not a guest.  
**17 Chiamata a Bologna.** Mother goes silent, then: “Non tornare dopo le otto.” She knew the water. Never told.  
**18 Perché.** Mother left a boy (not Neri’s dad — don’t tidy). She left the village to exist.  
**19 Giada nel bosco di giorno.** Memorial. No ghost. Respect.  
**20 Scelta.** Engineer wants her as “proof the place is inhabited” for a new project. Elsa wants her as Anna. Neri wants a ride out.  
**21 No.** She will not be proof. She will not be Anna. She will take Neri only if he asks his people. He doesn’t, yet.  
**22 L’alba.** Water down. A bus that is a workers’ bus. Tullio nods.  
**23 Trento.** Father. Ordinary kitchen. She does not tell it as a miracle.  
**24 La foto.** One picture of the crossed-out sign. Caption in her head: *esisteva*. Hook for a later book: Neri’s number, unused.

## 14. Word progression

Ch 1–8: 400–580 · 9–16: 550–780 · 17–24: 650–900 (more narration in forest/dam).

## 15–17. Language / domains / grammar

**Domains:** trains, village, time of day, water, family, rules, maps.  
**Mutate:** *non esiste* → *non c’è sulla mappa* → *c’è, ma non si dice* → *esisteva*.  
**Grammar from plot:** *imperfetto* for “they used to wait for inspection”; *non si esce quando*; *se resto*; future *partirò all’alba*.

## 18–20. Twists / foreshadow / ending

**Twists:** Morning changes are staging; register date is copied ritual; mother already knew Collevento; no lake, still a flood every evening.  
**Foreshadow:** Crossed-out sign; room made up; “Anna”; engineer’s high car.  
**Ending:** She leaves by the rule’s loophole (dawn), identity intact. Village stays unmapped. Not burned, not saved by a prophecy.

## 21. Why an A2 learner continues

Rules you can hold (*dopo il tramonto, no*). Then the face in the photo. Then the mother knew. You read to see whether Giada gets out without becoming a story the village tells.

---

# Structural difference (do not clone)

| | Thriller | Romance | Fantasy |
|---|---|---|---|
| Engine | Observation, pattern, evidence | Two channels (ink vs speech) | Rules, walking, identity |
| Clock | Night windows; Friday shredder | Tuesdays; three days book closed | Sunset sluice; dawn bus |
| Information | Irene has too much paper | They have too little speech | Giada has the wrong name |
| Ending type | Witness cost | Imperfect couple | Exit without conquest |

---

# Recommendation

**Strongest overall story: *Il villaggio che non esiste*.**

The sunset rule and the morning changes have **physical and social causes** that still feel uncanny. The “you’ve been here before” beat is a **mother/daughter double**, not a prophecy. It is the least like a language worksheet and the hardest to execute — which is why it is the best book.

**Strongest first to author for Storia: *La casa delle finestre*.**

Window grid, timetable, and *non scansionare* give A2+ **countable, repeatable language** and a clean suspense machine. Lower risk of generic magic. Better training for writers before Collevento.

**Romance** is the most familiar premise; it **works** only if the Tuesday-driver irony stays (reveal ~Ch 11, not the last page). If that is diluted, it becomes notes-in-a-book stock.

**Do not author yet. Do not catalog yet. Do not touch Luca A2.**

---

*End of Phase 13 A2+ design/audit. Hard stop.*
