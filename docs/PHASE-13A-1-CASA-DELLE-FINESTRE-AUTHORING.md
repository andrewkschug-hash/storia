# Phase 13A-1 — *La casa delle finestre* chapter-authoring specification

**Use this file as the authoring prompt.** Do not start from “write 24 A2+ chapters.”

**Author one chapter at a time.** After each chapter: count words, check the cut-rule, check WHAT MUST NOT BE REVEALED, then stop and wait for review.

Parent bible: `docs/PHASE-13-A2-PLUS-GENRE-PATHS.md` (thriller only).  
Do not use Valdombra / Adele / Nora from `PHASE-13A-THREE-GENRE-PATHS.md`.

---

# Paste this to Cursor when authoring (one chapter)

```
Read docs/PHASE-13A-1-CASA-DELLE-FINESTRE-AUTHORING.md in full.

Author ONLY the chapter I name (start with CHAPTER 01).

Follow that chapter’s spec exactly: story purpose, learner-must-know, must-not-reveal, language target, recurring vocabulary, scene beats, ending hook, cut-rule.

Match existing Storia chapter JSON + sentence-english shape (see Pre-Rome / Luca files for schema). New storyId: la-casa-delle-finestre. New folder only.

DO NOT:
- author other chapters in the same turn
- pad to hit a word ceiling
- touch Luca a Roma, Pre-Rome, Elena, CEFR, reader, catalog availability
- explain the mystery early
- make Irene a detective
- write poetic filler

CUT RULE: if the chapter does not change knowledge, suspicion, emotion, or a decision, rewrite or cut — do not add 500 words.
```

Then: `Author CHAPTER 01 only.`

---

# Freeze

Do not modify:

- Luca a Roma (any chapter, especially 25–40)
- Pre-Rome stories
- Elena draft
- CEFR thresholds, readiness, scoring, reader, audio, STT
- Catalog (do not mark this story `available` in 13A-1 unless a later phase says so)

New files only, under:

`mobile/content/stories/la-casa-delle-finestre/`

IDs:

| | |
|---|---|
| storyId | `la-casa-delle-finestre` |
| chapterId | `la-casa-delle-finestre-01` … `24` |
| protagonistId | `irene-colombo` |

When JSON exists: `lemmas[]` 1:1 with split words; `sentence-english.json` keys `chapterId:sentenceId`; 2–4 comprehension questions; `rememberedFacts` = learner-must-know, not secrets.

**Production exercises:** not in 13A-1 unless asked.

**Catalog / player wiring:** not in 13A-1 unless asked. Draft files on disk are enough to review prose.

---

# Story (do not drift)

Irene Colombo, 27, archivist, short *comune* contract, attic on Via della Scuola, **San Quirico sul Nera**. Opposite: closed *scuola media*, grid of windows. A camping lamp moves at night. She maps it because that is her job, not because she is a detective.

**Truth (author knows; learner learns late):** Sara Neri, fired teacher, uses a lamp in different rooms. First pattern = old timetable + habit. Then she notices Irene and *answers*. Stakes = class registers vs Friday shredder. Alme is obstruction, not a killer. No ghost.

**Irene’s flaw:** she treats people like documents until that costs her.

---

# Cut rule (every chapter)

The chapter must change **at least one**:

1. Knowledge  
2. Suspicion  
3. Emotion  
4. Someone’s decision  

If not: cut or rewrite. Word count is not a reason to keep it.

---

# Anti-padding / anti-generic

Do not:

- explain the mystery before its chapter
- poetic landscape filler
- dump vocab the scene does not need
- summarize future events
- make Irene interview “suspects” like a cop
- manufacture danger (no chase, no basement attack)
- haunted-house clichés, chosen-one, serial killer
- identical sentence repeated as “repetition”
- pad to 900 words because A2+ profile allows 900

Do:

- mutate recurring phrases (*la scuola è vuota* → *sembra vuota* → *qualcuno c’è*)
- let grammar come from the beat (*mentre guarda*, *ieri la luce si è fermata*, *dovrei chiamare*, *se lo dico…*)
- keep suspense in **information and timing**, not gore

---

# A2+ staircase

| Ch | Words | Language |
|---|---|---|
| 1–8 | 350–550 (Ch 1: **350–450**) | Present + controlled PP; light *imperfetto* for background; *mentre però perché quando quindi sembra qualcuno nessuno*; short-to-medium sentences; dialogue where people actually speak |
| 9–16 | 500–750 | PP vs *imperfetto* when yesterday vs habit matters; *vorrei / potrebbe / sarebbe / dovrei*; *ci / ne* if natural; plans; opinions |
| 17–24 | 650–850 | Sustained past where the plot is past; *se* + consequence; uncertainty; still A2+, not B1 literary |

Sentence length: climb; do not jump to Luca A2 density in Ch 1.

---

# Cast (introduce only when the spec says)

| ID | Who | First on-page |
|---|---|---|
| irene-colombo | 27, archivist | 01 |
| loredana | landlady; daughter in last class | 01 (basic); 13 (grief) |
| quinto-belli | custode | 02 (seen); 06 (talk) |
| mimmo | 19, fake ghost videos | 05 |
| alme | dirigente / *comune* clerk | 03 |
| sara-neri | ex-teacher, the lamp | named 10–11; daylight 17 |
| piva | maresciallo | 22 (mentioned as option from 16) |

---

# Recurring vocabulary (whole story)

finestra, luce, scuola, casa, strada, sera, porta, vedere, guardare, sembrare, vuota, piano, quaderno, orario, chiave, cartella, registro, comune, scansionare.

Mutate; do not stamp.

---

# JSON conventions (when writing files)

Follow Luca/Pre-Rome chapter schema: `id`, `storyId`, `number`, `title`, `titleIt`, `difficultyLevel` (2 for this story), `locationIds`, `characterIds`, `events[]`, `paragraphs[]` with `sentences[]` (`id` s01…, `text`, `speakerId`, `kind`, `lemmas[]`), `questions[]`.

English titles in `title`; Italian in `titleIt`.  
Questions: 2–4, check **this chapter’s learner-must-know**, not the whole mystery.  
`sentence-english.json`: one line per sentence, natural English, not a gloss dump.

---

# CHAPTER 01

**Title:** La griglia  
**titleIt:** La griglia  
**Change:** Knowledge — there is a moving light in the school grid.

**STORY PURPOSE**  
Irene arrives and notices the first anomaly.

**WHAT THE LEARNER MUST KNOW**
- Irene has just arrived in San Quirico sul Nera.
- She lives opposite the abandoned school.
- The school has been closed for two years.
- At night, a light appears in one window.
- The light moves to another window.
- Irene notices a third light.

**WHAT MUST NOT BE REVEALED**  
Timetable; Sara; why the school closed (earthquake/cracks); whether the light is a message; keys; *comune* job details beyond “she has come for work” if needed at all — prefer job named in Ch 3. Landlady may say *chiusa da due anni* without *terremoto*.

**LANGUAGE TARGET**  
350–450 words. Short-to-medium A2+ sentences. Present narration, controlled PP. Light *imperfetto* for background. Natural: *mentre, però, perché, quando, quindi, sembra, qualcuno, nessuno*.

**RECURRING VOCABULARY**  
finestra, luce, scuola, casa, strada, sera, porta, vedere, guardare, sembrare

**NEW VOCABULARY**  
Only what the scene needs (attic *soffitta* or *mansarda* — pick one and keep; town name; landlady first name Loredana).

**SCENE BEATS**
1. Irene arrives.
2. She enters the attic.
3. Landlady gives basic information.
4. Irene notices the school.
5. Night falls.
6. First light appears.
7. Second light appears.
8. Third light appears.
9. Irene writes the pattern down.

**ENDING HOOK**  
She realizes the three windows are on the same horizontal line.

**DO NOT**  
Explain the mystery; poetic filler; unrelated vocab; summarize the future; detective Irene; fake danger.

---

# CHAPTER 02

**Title:** The closed school / La scuola chiusa  
**Change:** Knowledge + suspicion — official story “empty/unsafe”; a man waters a dead courtyard.

**STORY PURPOSE**  
Daylight: the building is a closed school; the town has a rehearsed sentence; Irene sees Quinto.

**WHAT THE LEARNER MUST KNOW**
- By day the school looks empty and shut.
- Loredana says it is unsafe / closed after an earthquake (simple: *terremoto*, *non si entra*).
- People say nobody goes in.
- A man (not named yet, or named Quinto once) waters plants that are clearly dead.

**WHAT MUST NOT BE REVEALED**  
Sara; cracks report; registers; that Quinto has the real keys; timetable.

**LANGUAGE** 350–500. PP for this morning. *imperfetto* for “the school used to…”. *però, perché, sembra vuota*.

**RECURRING** scuola, vuota, porta, finestra, strada, vedere  
**NEW** terremoto, cortile, custode (if said), annaffiare / acqua

**BEATS** Morning window; walk; Loredana’s official story; Irene almost believes it; Quinto and the dead courtyard; Irene looks up at last night’s line of windows — dark.

**HOOK** Quinto looks up at the same line of windows, then walks away.

**DO NOT** Interview Quinto at length; ghost talk; Irene sneak in.

---

# CHAPTER 03

**Title:** Il contratto  
**Change:** Knowledge — her job is to digitize *comune* files, including school leftovers; a folder says *non scansionare*.

**STORY PURPOSE**  
Put Irene inside the institution that will want paper destroyed.

**WHAT THE LEARNER MUST KNOW**
- Irene works a short contract at the *comune*.
- She must scan old school papers.
- Dottoressa Alme is polite and in charge of this.
- One folder is marked *non scansionare*.

**WHAT MUST NOT BE REVEALED**  
Contents of that folder; Sara’s name; shredding Friday; Alme as villain.

**LANGUAGE** 400–550. Work verbs: *scansionare, cartella, contratto*. *dovrei*, *però*.

**RECURRING** scuola, cartella, vedere  
**NEW** comune, contratto, scansionare, dirigente (or *dottoressa*)

**BEATS** Office; Alme smile; “whatever is left”; basement boxes; the forbidden label; Irene does not open it yet.

**HOOK** Alme: “If you find anything odd, you come to me. Not to the others.”

**DO NOT** Open the folder; make Alme threaten; comic-book conspiracy.

---

# CHAPTER 04

**Title:** Il quaderno  
**Change:** Knowledge — she numbers the windows; Monday’s path is not Tuesday’s.

**STORY PURPOSE**  
The grid becomes data. She is an archivist, not a cop.

**WHAT THE LEARNER MUST KNOW**
- Irene draws the façade and numbers windows.
- She watches a second night.
- The order of lights is different from the first night.
- She writes times (simple clock).

**WHAT MUST NOT BE REVEALED**  
That this is a timetable; Sara; communication.

**LANGUAGE** 400–550. Numbers, *prima / poi / dopo*, *quando*, *mentre*.

**RECURRING** finestra, luce, quaderno, sera, vedere, sembrare  
**NEW** numero, riga, piano (floor)

**BEATS** Day: sketch. Night: watch. Compare to night one. The line is not the same.

**HOOK** Tuesday’s last light is a window that was dark on Monday.

**DO NOT** Decode; call police; enter school.

---

# CHAPTER 05

**Title:** Mimmo  
**Change:** Suspicion — kids fake ghosts; their video is afternoon, not night.

**STORY PURPOSE**  
A misleading “ghost” that the learner can discard with a timestamp.

**WHAT THE LEARNER MUST KNOW**
- A boy, Mimmo, films the school for fun.
- He says there is a ghost.
- Irene almost believes the kids’ story.
- The video time is afternoon, not night.

**WHAT MUST NOT BE REVEALED**  
Sara; that Mimmo works for Alme (he doesn’t).

**LANGUAGE** 400–550. Speech with kids; *dice che*, *però*, *quando*.

**RECURRING** scuola, luce, finestra, vedere  
**NEW** video, fantasma, pomeriggio

**BEATS** Street; Mimmo and friends; she watches a clip; she checks the time on the phone; afternoon.

**HOOK** At dusk Mimmo is gone. The real lamp starts anyway.

**DO NOT** Horror; Irene scold like a teacher for a page; make Mimmo the lamp.

---

# CHAPTER 06

**Title:** Quinto  
**Change:** Suspicion — keys exist; he lies about which key; he does not go upstairs (he says).

**STORY PURPOSE**  
Custode as access, not as killer.

**WHAT THE LEARNER MUST KNOW**
- The man’s name is Quinto. He was / is the custode.
- He says he does not go to the upper floors.
- There are keys.
- He is not straight about which key opens what.

**WHAT MUST NOT BE REVEALED**  
He saw the cracks; he will help Sara later; Sara.

**LANGUAGE** 450–550. Dialogue; *non vado*, *chiave*, *piano di sopra*.

**RECURRING** chiave, porta, scuola, vuota, sembrare  
**NEW** custode, piano di sopra

**BEATS** She greets him; small talk; keys on a ring; he points to a key then changes; he waters nothing today.

**HOOK** He says “La scuola è vuota.” He does not look at her when he says it.

**DO NOT** Torture-interview; drunk-clown Quinto; he confesses.

---

# CHAPTER 07

**Title:** L’orario  
**Change:** Knowledge — her map matches last year’s class timetable (rooms/times). Still not “a message.”

**STORY PURPOSE**  
The pattern has a boring, devastating explanation: school schedule.

**WHAT THE LEARNER MUST KNOW**
- Irene finds a photocopy of an old timetable (*orario*).
- Room numbers / class hours (keep simple: 1A, stanza 2, le tre).
- The night lights follow that order more than chance.
- She still does not know *who* carries the lamp.

**WHAT MUST NOT BE REVEALED**  
Sara’s name as the lamp; that someone is signaling Irene; shredding.

**LANGUAGE** 450–550. *quando, quindi, perché, mentre*. PP for finding the paper.

**RECURRING** orario, finestra, luce, scuola, quaderno, numero  
**NEW** classe, stanza, ora

**BEATS** Basement box (allowed papers); photocopy; home; overlay on her sketch; match.

**HOOK** One cell on the timetable is circled in old pen. That window is the one that faced her attic.

**DO NOT** “She understood everything”; detective board with string; enter the school.

---

# CHAPTER 08

**Title:** Lei pensa a me  
**Change:** Emotion + suspicion — the lamp pauses in the window that faces her. First possible contact. She is not sure.

**STORY PURPOSE**  
Apophenia vs contact. End of early block.

**WHAT THE LEARNER MUST KNOW**
- Irene stands at her window on purpose.
- The lamp reaches the facing window and **stops**.
- She feels seen. She may be wrong.
- She does not signal back yet.

**WHAT MUST NOT BE REVEALED**  
Sara; paper in the grate; tapping code.

**LANGUAGE** 450–550. *sembra, forse, qualcuno, nessuno, però*. Short sentences when she is afraid.

**RECURRING** finestra, luce, guardare, sembrare, sera  
**NEW** fermarsi, di fronte

**BEATS** Night; she waits; path of lights; pause; she steps back; the lamp goes on to the next window after a long beat — or goes out. Pick **goes out** after the pause.

**HOOK** The facing window is dark. She does not know if the pause was for her.

**DO NOT** She taps back (that’s Ch 14); scream; call Piva.

---

# CHAPTER 09

**Title:** Ieri  
**Change:** Knowledge — last night’s pause was real to her; tonight no light; a camping-battery pack in the gutter.

**STORY PURPOSE**  
*Ieri* vs *stasera*. Physical object: the lamp is mundane.

**WHAT THE LEARNER MUST KNOW**
- Last night the light paused (she writes it).
- Tonight there is no light.
- She finds a blister pack for camping batteries by the school gate.

**WHAT MUST NOT BE REVEALED**  
Sara; communication confirmed.

**LANGUAGE** 500–650. Clear PP vs *imperfetto* (*ieri si è fermata* / *di solito c’è una luce*). *quindi, però*.

**RECURRING** ieri, luce, finestra, sera, scuola  
**NEW** batteria, confezione / blister (keep Italian simple: *pile da campeggio*)

**BEATS** Morning notes; work day short; night: nothing; morning gutter.

**HOOK** The pack is new. Someone bought batteries this week.

**DO NOT** Buy-a-camera montage; break in.

---

# CHAPTER 10

**Title:** Non scansionare  
**Change:** Knowledge + decision pressure — she opens the folder: Sara Neri reported cracks; ignored. Alme asks if she found anything odd.

**STORY PURPOSE**  
Paper mystery starts. Irene is now inside a conflict of loyalty.

**WHAT THE LEARNER MUST KNOW**
- She opens *non scansionare*.
- Sara Neri wrote that the building had cracks / was unsafe before the official story.
- The report was not scanned with the rest.
- Alme asks a careful question.

**WHAT MUST NOT BE REVEALED**  
Sara is the lamp; Friday shred; Alme orders a crime.

**LANGUAGE** 550–700. Work + *dovrei dirlo*. Opinions: *non è giusto* (light).

**RECURRING** cartella, scansionare, scuola, comune  
**NEW** crepa / *fessura* (pick one), relazione, insegnante

**BEATS** Alone in basement; opens folder; reads enough, not a legal essay; Alme in the doorway.

**HOOK** Alme’s smile: “Anything odd?” Irene says “No.” First lie.

**DO NOT** Full backstory dump; Irene the hero leak to press.

---

# CHAPTER 11

**Title:** Sara  
**Change:** Knowledge — a face and a town story (“hysterical”); maybe the same woman on a night bus.

**STORY PURPOSE**  
Name and photo. Not yet “she is the lamp.”

**WHAT THE LEARNER MUST KNOW**
- Sara Neri was a teacher here.
- She was fired / sent away; people say she exaggerated.
- Irene sees her on a class photo.
- At night Irene *might* see the same woman on a bus. Uncertain.

**WHAT MUST NOT BE REVEALED**  
Confirmed ID of the lamp; meeting.

**LANGUAGE** 550–700. *dicevano che*, *forse*, *sembrava*.

**RECURRING** insegnante, scuola, foto, vedere  
**NEW** licenziare / *non lavora più*, autobus

**BEATS** Photo in a box; gossip one line from a clerk (not Alme); evening bus stop maybe.

**HOOK** The woman’s bag looks heavy. Like paper, not shopping. Irene is not sure.

**DO NOT** Chase the bus; “I knew it was her.”

---

# CHAPTER 12

**Title:** Il secondo piano  
**Change:** Suspicion misdirected — lamp in the old teachers’ room; a light answers from **Irene’s stair**: Loredana, not Sara.

**STORY PURPOSE**  
Irene does not enter the unsafe school. False answer from her own building.

**WHAT THE LEARNER MUST KNOW**
- Irene watches from outside, does not go in.
- The lamp is on the second floor, teachers’ room (if she can guess from her map).
- A torch/phone light moves on **her** staircase.
- It is Loredana, sleepless.

**WHAT MUST NOT BE REVEALED**  
Loredana as accomplice of Sara (she isn’t).

**LANGUAGE** 550–700. Space words: *secondo piano, scale, di qua / di là*.

**RECURRING** piano, luce, finestra, guardare  
**NEW** aula insegnanti (or *stanza delle prof*), scale, torcia / telefono

**BEATS** Watch school; lamp; a second light behind her; heart; Loredana in a dressing gown; awkward sorry.

**HOOK** Loredana: “I check the street. I don’t sleep. The school…” She does not finish.

**DO NOT** Irene enter school; horror jump-scare; Loredana the lamp.

---

# CHAPTER 13

**Title:** Loredana  
**Change:** Emotion — landlady’s daughter was in the last class; she wants the school forgotten; she cries when Irene numbers windows.

**STORY PURPOSE**  
Grief as a reason the town repeats *è vuota*.

**WHAT THE LEARNER MUST KNOW**
- Loredana’s daughter was in the last year.
- Loredana wants no more talk of the school.
- Irene’s numbered sketch hurts her.
- Loredana is not the night lamp.

**WHAT MUST NOT BE REVEALED**  
Sara’s plan; registers.

**LANGUAGE** 550–720. Feelings: *mi dispiace, ho paura, non voglio*. *imperfetto* for the daughter’s school days, short.

**RECURRING** scuola, figlia, finestra, vuota  
**NEW** ultima classe, dimenticare

**BEATS** Kitchen tea; daughter; Irene shows the quaderno without meaning to; Loredana cries; Irene closes the notebook.

**HOOK** Loredana: “If you love this town, leave the windows alone.”

**DO NOT** Dead-child gore; make Irene cruel on purpose.

---

# CHAPTER 14

**Title:** Il codice vero  
**Change:** Knowledge + decision — the lamp makes a crude long-long-long in the facing window; Irene taps her desk lamp back; two longs; stop.

**STORY PURPOSE**  
Contact is now chosen, clumsy, human. Not Morse mastery.

**WHAT THE LEARNER MUST KNOW**
- The facing window flashes three slow times.
- Irene answers with her lamp (against sense).
- Two slow flashes answer.
- Then dark.

**WHAT MUST NOT BE REVEALED**  
The note in the grate (Ch 15); Sara’s name confirmed.

**LANGUAGE** 600–750. *dovrei / non dovrei*, *però*, *qualcuno*. Short beats.

**RECURRING** luce, finestra, di fronte, sera  
**NEW** lenta, volta, rispondere

**BEATS** Night; three longs; she hesitates; desk lamp; two longs; she is shaking; she does not go out.

**HOOK** She writes in the quaderno: *non è solo un orario.*

**DO NOT** Full Morse; she runs to the gate; police.

---

# CHAPTER 15

**Title:** Non chiamare  
**Change:** Knowledge — a paper in the grate: NON CARABINIERI. REGISTRI. Alme books shredding for Friday.

**STORY PURPOSE**  
Clock on the plot. Paper, not glass, carries the request.

**WHAT THE LEARNER MUST KNOW**
- There is a note: don’t call Carabinieri; registers.
- Alme schedules destruction of papers for Friday (*distruggere / tritacarte* — keep one simple verb: *buttare via / distruggere*).
- Irene has little time.

**WHAT MUST NOT BE REVEALED**  
Daylight meeting yet; USB.

**LANGUAGE** 600–750. Future/plan: *venerdì, dobbiamo, non c’è tempo*. *dovrei chiamare comunque*.

**RECURRING** registro, carabinieri, cartella, comune  
**NEW** grata, biglietto / foglio, venerdì, distruggere

**BEATS** Morning grate; note; work; Alme’s calendar; Irene’s stomach.

**HOOK** Friday is in three days (or two — pick and keep).

**DO NOT** Irene already meets Sara; action movie.

---

# CHAPTER 16

**Title:** La scelta di Irene  
**Change:** Decision — she stalls one day; Quinto offers a “safe” key if she drops the folder.

**STORY PURPOSE**  
Three bad options. She chooses delay. Quinto tests her.

**WHAT THE LEARNER MUST KNOW**
- She could tell Piva, tell Alme, or find Sara.
- She waits one day.
- Quinto offers a key if she leaves the *non scansionare* folder alone.

**WHAT MUST NOT BE REVEALED**  
She accepts the key (she should refuse or not use it — **refuse**).

**LANGUAGE** 600–750. *se dico…, se non dico…*; *potrebbe*; *dovrei*.

**RECURRING** cartella, chiave, scuola, scegliere  
**NEW** maresciallo (name Piva once), aspettare

**BEATS** Walk; list options; Quinto; offer; she says no to the key; she still doesn’t call Piva.

**HOOK** She decides to look for Sara in daylight, not with his key.

**DO NOT** She takes the key and sneaks in (unsafe + stupid).

---

# CHAPTER 17

**Title:** Incontro  
**Change:** Knowledge + emotion — Sara in daylight behind the gym; lamp was work, then the pause; she needs registers before Friday; she asks Irene to steal **time**, not to steal files as a heist.

**STORY PURPOSE**  
Human lamp. Bargain.

**WHAT THE LEARNER MUST KNOW**
- Sara is the person with the lamp.
- She used rooms because there is no corridor light / she follows old hours (simple).
- She noticed Irene at the window and paused, then answered.
- She wants the registers saved from Friday.
- She asks Irene to delay / lose a box at work, not to break into the school.

**WHAT MUST NOT BE REVEALED**  
Alme’s private mercy (Ch 21); USB yet.

**LANGUAGE** 650–800. Dialogue; PP for nights; *avevo bisogno*; *se mi aiuti*.

**RECURRING** luce, registro, venerdì, finestra  
**NEW** palestra / dietro, tempo (steal time)

**BEATS** Day, behind gym; recognition; anger; explanation without speech; ask.

**HOOK** Irene does not say yes. She says “I don’t know.”

**DO NOT** Romance subplot; speech; Sara as mystic.

---

# CHAPTER 18

**Title:** Il seminterrato  
**Change:** Decision + moral dirt — Irene “loses” a box on purpose; Alme notices the gap.

**STORY PURPOSE**  
Irene is no longer only a mapper. Cost.

**WHAT THE LEARNER MUST KNOW**
- Irene hides or misfiles a box of registers / copies.
- She knows it is wrong.
- Alme notices something missing.

**WHAT MUST NOT BE REVEALED**  
The USB (Ch 20); Alme lets it go (Ch 21).

**LANGUAGE** 650–800. *ho fatto, non dovevo, però*. Work process, concrete.

**RECURRING** scatola, registro, scansionare, comune  
**NEW** perdere, errore, seminterrato

**BEATS** Hours of ordinary scanning; the act; sweat; Alme counts boxes.

**HOOK** Alme looks at Irene too long. Says nothing yet.

**DO NOT** Ocean’s Eleven; comic relief.

---

# CHAPTER 19

**Title:** Quinto cambia  
**Change:** Knowledge + his decision — he saw the cracks; he will not testify; he will not stop Sara; gate unchained once.

**STORY PURPOSE**  
Custode as failed witness, small mercy.

**WHAT THE LEARNER MUST KNOW**
- Quinto knew the building was bad.
- He will not speak to Piva.
- He will not block Sara.
- He leaves the gate unchained **once** (for her, not for Irene the explorer).

**WHAT MUST NOT BE REVEALED**  
He is not the lamp.

**LANGUAGE** 650–800. *sapevo, non posso, non dico*.

**RECURRING** crepa/fessura, chiave, porta, scuola  
**NEW** testimoniare / *parlare con i carabinieri* (simple)

**BEATS** He finds Irene after hours; confession without drama; unchained gate as fact she sees later.

**HOOK** “I water dead plants so I don’t go up.”

**DO NOT** Redemption speech; he dies.

---

# CHAPTER 20

**Title:** Venerdì  
**Change:** Knowledge — USB copy exists; shredder day; Alme finds Irene in the corridor.

**STORY PURPOSE**  
Paper race, not a chase. Evidence duplicated.

**WHAT THE LEARNER MUST KNOW**
- Today papers are to be destroyed.
- Irene (and/or Sara’s request) gets a USB / copies out.
- Alme intercepts Irene in the corridor.

**WHAT MUST NOT BE REVEALED**  
Alme’s final choice (next chapter).

**LANGUAGE** 700–850. Time pressure: *adesso, troppo tardi, manca un’ora*. Still concrete verbs.

**RECURRING** venerdì, registro, distruggere, cartella  
**NEW** USB / *chiavetta*, corridoio, tritacarte (or avoid rare word: *macchina per distruggere*)

**BEATS** Morning office; machine; copy; corridor.

**HOOK** Alme: “Come with me.” Not a shout.

**DO NOT** Car chase; Irene uploads to the internet.

---

# CHAPTER 21

**Title:** La dirigente  
**Change:** Alme’s decision — closing saved lives and careers; she lets one box exist as “already shredded.” Cowardice as mercy.

**STORY PURPOSE**  
Antagonist is human. No fistfight.

**WHAT THE LEARNER MUST KNOW**
- Alme argues the closure protected children.
- Alme also protected her job / the town’s story.
- She allows one box to survive unofficially.
- This is not a full public confession.

**WHAT MUST NOT BE REVEALED**  
National scandal. She is not arrested here.

**LANGUAGE** 700–850. Opinions, *perché, quindi, però, se*. *avrei dovuto* only if it stays readable; else *dovevo* / *non l’ho fatto*.

**RECURRING** scuola, bambini, lavoro, verità  
**NEW** carriera (or *posto di lavoro*), pietà / *non è coraggio*

**BEATS** Closed office; two women; no speech; one box.

**HOOK** Alme: “Now you go to Piva, or you don’t. I won’t help you twice.”

**DO NOT** Villain monologue; murder admission.

---

# CHAPTER 22

**Title:** Piva  
**Change:** Decision — Irene goes to the Carabinieri late; Sara is angry then relieved; the story stays local.

**STORY PURPOSE**  
Institutions exist. Irene is a witness, not the law.

**WHAT THE LEARNER MUST KNOW**
- Irene talks to Maresciallo Piva.
- She goes later than she should have.
- Sara is angry, then relieved.
- The school stays closed; this will not be a national TV story.

**WHAT MUST NOT BE REVEALED**  
A trial verdict this book.

**LANGUAGE** 700–850. Formal *lei* with Piva; PP for what happened.

**RECURRING** carabinieri, registro, luce, scuola  
**NEW** denuncia / *ho detto la verità* (simple), locale

**BEATS** Station; facts; Sara after; no celebration.

**HOOK** Piva: the windows were never the crime. The paper was.

**DO NOT** Irene smarter than police; shootout.

---

# CHAPTER 23

**Title:** Senza luce  
**Change:** Emotion — windows dark; she cannot sleep; she numbers the grid once more and **stops**.

**STORY PURPOSE**  
Image from Ch 1 inverted. Habit dies by choice.

**WHAT THE LEARNER MUST KNOW**
- There is no night lamp now.
- Irene still looks.
- She closes the quaderno.

**WHAT MUST NOT BE REVEALED**  
New mystery dumped.

**LANGUAGE** 650–800. Present + memory PP. Short.

**RECURRING** luce, finestra, quaderno, sera, sembrare  
**NEW** — almost none

**BEATS** Night; dark grid; she opens notebook; she does not add a number; sleep fails anyway.

**HOOK** The facing window stays dark. She is not sure she prefers this.

**DO NOT** Sequel teaser monster; ghost after all.

---

# CHAPTER 24

**Title:** L’archivio  
**Change:** Decision / cost — contract not renewed; she leaves; copies are not hers to sell; the grid is a building; she still looks up.

**STORY PURPOSE**  
Season end. Witness, not heroine of San Quirico.

**WHAT THE LEARNER MUST KNOW**
- The contract ends / is not renewed.
- Irene leaves town.
- She does not sell the story.
- She still glances at windows like anyone who once knew.

**WHAT MUST NOT BE REVEALED**  
Romance path, fantasy path, Luca.

**LANGUAGE** 650–850. *partire, restare, non è mio*. Pay off mutated *vuota*.

**RECURRING** scuola, finestra, casa, strada, archivio  
**NEW** — keep tight

**BEATS** Office goodbye; attic empty; bus or car; last look at the grid in daylight.

**HOOK** None cheap. Optional: a single dark window, ordinary. End.

**DO NOT** Job offer as reward; Alme arrested on the platform; “the light returns.”

---

# Suggested authoring order

1. Ch 01 (this spec’s example — calibrate voice)  
2. Ch 02–08 (early staircase)  
3. Review length + hooks  
4. Ch 09–16  
5. Ch 17–24  

Never “generate remaining chapters to match tone.”

---

# After 13A-1 (not now)

13A-2 *Una lettera per Elena* — different engine.  
13A-3 *Il villaggio che non esiste* — last, highest B1/confusion risk.

---

*Hard stop until a chapter number is named for authoring.*
