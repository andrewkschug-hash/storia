# Phase 15: Practice Intelligence & Retrieval Optimization Framework

> **Status:** FROZEN SPECIFICATION / PHASE 15 ARCHITECTURE  
> **Core Philosophy:**  
> **1. The reading IS the curriculum.**  
> **2. The narrative IS the spaced repetition.**  
> **3. The practice system detects when the narrative isn't enough.**  
> **4. The system is quiet when the learner is succeeding.**

---

## 1. The 3-Layer Practice Hierarchy (70 / 20 / 10)

`
┌────────────────────────────────────────────────────────────────────────┐
│  🟢 LAYER 1: COMPREHENSIBLE READING (~70–80% of Learner Time)          │
│  - Long-form contextual immersion across 22–24 chapter narrative runway│
│  - Story acts as primary memory engine with organic re-encounter       │
│  - Unconscious acquisition of morphology, syntax, and discourse        │
├────────────────────────────────────────────────────────────────────────┤
│  🟡 LAYER 2: ACTIVE CONTEXTUAL RETRIEVAL (~15–25% of Learner Time)     │
│  - Story-anchored cued recall (e.g. "Irene apre la ______ chiusa")    │
│  - Reconstructs narrative facts & evidence; pulls Italian from memory  │
│  - Replaces generic 4-choice recognition with cued production          │
├────────────────────────────────────────────────────────────────────────┤
│  🔵 LAYER 3: SELECTIVE VOCAL PRODUCTION (~5–10% of Learner Time)       │
│  - High-impact Speak Scenes at critical dramatic junctions            │
│  - Transitioning the learner from silent reader to spoken actor        │
│  - Target high-utility phrases, emotional climaxes, and key dialogue   │
└────────────────────────────────────────────────────────────────────────┘
`

---

## 2. Practice Channel Routing Hierarchy

Practice activities respect a strict pedagogical routing hierarchy:

1. **Natural Narrative Re-encounter (Highest Priority)**
   - Organic reappearance of target lemmas across 22–24 chapter arcs.
   - If a word is understood naturally across multiple chapters without friction, **the story is doing its job—do not interrupt with artificial tests.**
2. **Contextual Retrieval (Primary Active Practice)**
   - Cued story-level completion. The learner pulls the Italian surface form out of memory rather than picking from a multiple-choice list.
   - Example: *"Irene apre la ______ chiusa."* $\rightarrow$ cartella.
3. **Selective Production (High-Impact Speaking)**
   - Reserved for crucial dramatic lines and high-frequency communicative patterns.
   - Example: *"Alme vuole distruggere i registri venerdì."*
4. **Generic Recognition / Translation (Fallback Only)**
   - Used sparingly as diagnostic fallback when active recall fails.

---

## 3. The Dual Metric Framework: Retention vs. Retrieval

Instead of relying solely on post-chapter quizzes, Storia evaluates memory through two complementary channels:

\mathbf{\text{Natural Retention Signal}} \neq \mathbf{\text{Mastery}}
\mathbf{\text{Natural Retention Signal}} + \mathbf{\text{Successful Retrieval}} + \mathbf{\text{Vocal Production}} = \mathbf{\text{Evidence of Mastery}}

`
                  ┌──────────────────────────────────────────────┐
                  │          LEARNER VOCABULARY PROFILE          │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │ NATURAL RETENTION SIGNAL  │                   │     ACTIVE RETRIEVAL      │
   │   (Inferred In-Story)     │                   │   (Prompted & Measured)   │
   ├───────────────────────────┤                   ├───────────────────────────┤
   │ - Zero-tap reading flow   │                   │ - Story cued clozes       │
   │ - Reading velocity/pacing │                   │ - Relative latency (ms)   │
   │ - Absence of dictionary   │                   │ - Sentence reconstruction │
   │   lookups on re-encounter│                   │ - Speak Scene accuracy    │
   └───────────────────────────┘                   └───────────────────────────┘
`

> [!NOTE]
> **Zero-Tap Reading is a Signal, Not Absolute Proof:** Non-tapping can indicate either genuine comprehension, contextual inference, or skimming. Therefore, zero-tap reading serves as an inferred *signal* that allows the system to remain quiet, while prompted retrieval serves as definitive validation.

---

## 4. Spacing Heuristics for Vocabulary Recurrence

Recurrence across the 22–24 chapter pathways is classified into four operational zones:

* **$\Delta = 0–1$ chapters:** Immediate reinforcement (consolidating initial acquisition).
* **$\Delta = 2–5$ chapters:** **Ideal narrative spacing** (optimal cognitive effort for memory consolidation).
* **$\Delta = 6–8$ chapters:** Useful longer spacing (tests durable retention).
* **$\Delta \ge 9$ chapters:** Candidate for deliberate cued retrieval prompt.

### Project-Level Recurrence Finding
> The frozen narratives naturally provide dense early consolidation ($\Delta = 0–1$) followed by repeated spaced re-encounters, with most meaningful recurrence occurring within $\Delta = 2–5$ and occasional longer gaps providing additional retrieval pressure.

---

## 5. Empirical Recurrence Audit (Frozen A2+ Pathways)

Audit of core thematic and procedural lemmas across the frozen 70 chapters:

### *La casa delle finestre* (24 Chapters)
| Lemma | First Introduction | Re-encounter Chapters | Recurrence Gaps ($\Delta$) | Spacing Profile |
|:---|:---:|:---|:---|:---:|
| cartella | Ch 3 | Ch 4, 7, 9, 10, 11, 16, 18, 20 | 1, 3, 2, 1, 1, 5, 2, 2 | **Early consolidation + Spaced re-encounter ($\le 5$)** |
| scatola | Ch 3 | Ch 7, 10, 11, 15, 16, 17, 18, 19, 20, 21, 22, 24 | 4, 3, 1, 4, 1, 1, 1, 1, 1, 1, 1, 2 | **Continuous narrative runway ($\le 4$)** |
| crepa | Ch 10 | Ch 11, 16, 19, 21, 22 | 1, 5, 3, 2, 1 | **Ideal narrative spacing ($\le 5$)** |
| distruggere| Ch 15 | Ch 16, 17, 20, 21, 22 | 1, 1, 3, 1, 1 | **High-frequency countdown pacing ($\le 3$)** |
| seminterrato| Ch 17 | Ch 18, 20, 21, 24 | 1, 2, 1, 3 | **Immediate consolidation + spacing ($\le 3$)** |
| orario | Ch 7 | Ch 9, 14, 17, 22, 23 | 2, 5, 3, 5, 1 | **Ideal narrative spacing ($\le 5$)** |

### *Una lettera per Elena* (22 Chapters)
| Lemma | First Introduction | Re-encounter Chapters | Recurrence Gaps ($\Delta$) | Spacing Profile |
|:---|:---:|:---|:---|:---:|
| rigo | Ch 11 | Ch 12, 13, 14, 15, 19, 21 | 1, 1, 1, 1, 4, 2 | **Dense consolidation + Spaced re-encounter ($\le 4$)** |
| lettera | Ch 13 | Ch 18, 19, 22 | 5, 1, 3 | **Ideal narrative spacing ($\le 5$)** |
| magazzino| Ch 1 | Ch 2, 3, 5, 7, 10, 11, 12, 13, 18, 19, 20, 22 | 1, 1, 2, 2, 3, 1, 1, 5, 1, 1, 2 | **Full narrative runway ($\le 5$)** |
| litigio | Ch 16 | Ch 17, 19, 22 | 1, 2, 3 | **Immediate consolidation + spacing ($\le 3$)** |

### *Il villaggio che non esiste* (24 Chapters)
| Lemma | First Introduction | Re-encounter Chapters | Recurrence Gaps ($\Delta$) | Spacing Profile |
|:---|:---:|:---|:---|:---:|
| cartello | Ch 1 | Ch 5, 7, 8, 9, 10, 13, 14, 19, 22, 23, 24 | 4, 2, 1, 1, 1, 3, 1, 5, 3, 1, 1 | **Spaced re-encounters ($\le 5$)** |
| egistro | Ch 8 | Ch 9, 11, 12, 15, 16, 17, 18 | 1, 2, 1, 3, 1, 1, 1 | **Dense consolidation ($\le 3$)** |
| diga | Ch 4 | Ch 6, 9, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23 | 2, 3, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1 | **Continuous narrative runway ($\le 3$)** |
| ispezione| Ch 10 | Ch 11, 15 | 1, 4 | **Ideal narrative spacing ($\le 4$)** |

---

## 6. The 5-State Adaptive Engine & Promotion Gates

`
                  ┌──────────────────┐
                  │   STORY EXPOSURE │
                  └────────┬─────────┘
                           ↓
                 Natural re-encounter
                           ↓
                 ┌──────────────────┐
                 │ RETENTION SIGNAL │
                 └────────┬─────────┘
                          ↓
                  Does learner need help?
                     /            \
                   No              Yes
                   ↓                ↓
               STABLE          CONTEXTUAL
                 ↓              RETRIEVAL
                 │                ↓
                 │          Successful?
                 │             /    \
                 │           No      Yes
                 │           ↓        ↓
                 │       RECOVERING  STABLE
                 │                    ↓
                 └──────────────→ SPEAK
                                    ↓
                               PRODUCTION
                                    ↓
                                MASTERED*
`

### Strict Criteria for MASTERED State:
Promotion to MASTERED is never automatic based on reading alone. It requires:
1. **Multiple successful retrievals** across $\ge 2$ distinct chapters.
2. **At least one successful vocal production** in a Speak Scene.
3. **No recent hint-dependent failures.**
4. **Successful retrieval after a longer spacing interval** ($\Delta \ge 4$ chapters).

---

## 7. Prompt Optimization & Contextual Selection Rules

In ReviewService and storyExamples, prompt candidate sentences are ranked using the following priority weighting:

1. **Recency:** Favor sentences from the most recently completed chapter.
2. **Narrative Importance:** Favor sentences tied to character decisions, key evidence, or emotional pivots over incidental descriptions.
3. **Grammatical Clarity:** Ensure the cloze target is distinct (avoiding ambiguous prepositions or indeterminate pronouns).
4. **Historical Feedback:** If a learner previously struggled with a lemma, prioritize a clearer sentence example; if mastered, test across a contrasting syntactic role.

---

## 8. Latency Safeguards: Relative Baseline Tracking

Universal latency cutoffs (e.g. "5 seconds = struggle") are strictly prohibited due to typing, reading, and device variance.

Retrieval latency is evaluated relative to the learner's personal historical median:

\Delta_{\text{latency}} = t_{\text{retrieval}} - \tilde{t}_{\text{learner\_median}}

* **Fast/Fluid Recall:** $\Delta_{\text{latency}} \le +0.5\,\text{s}$ (Evidence of high accessibility).
* **Effortful Success:** $+0.5\,\text{s} < \Delta_{\text{latency}} \le +3.0\,\text{s}$ (Desirable cognitive difficulty; consolidates memory).
* **Significant Hesitation:** $\Delta_{\text{latency}} > +3.0\,\text{s}$ or hint requested (Signals decay; flags for REINFORCE / RECOVERING).

---

## 9. Phase 15 Success Criteria

1. **Content:** All 70 chapters remain 100% frozen.
2. **Recurrence:** Zero authoring intervention required to engineer vocabulary spacing.
3. **Practice:** Story-anchored contextual retrieval is the primary targeted mechanism.
4. **Adaptivity:** Review frequency is dictated by evidence, not arbitrary timers.
5. **Production:** Speak Scenes selectively convert retrieved lemmas into spoken output.
6. **Mastery:** MASTERED requires cross-chapter retrieval + vocal production.
7. **UX:** **Successful reading remains completely uninterrupted.**


---

## 10. Phase 15 Failure-Mode Validation Matrix (The 5 Persona Tests)

Before declaring Phase 15 complete, the adaptive practice engine must be validated against 5 simulated learner failure modes:

| Persona / Scenario | Observed Behavior | Expected System Response | Critical Failure Condition |
| :--- | :--- | :--- | :--- |
| **A. The Fluent Reader** | Reads multiple chapters with zero taps, high reading speed, perfect cloze recall | **Practice progressively disappears.** System stays completely quiet. | ❌ Giving more exercises as a "reward" for good performance. |
| **B. The Struggling Reader** | Taps target lemma (e.g. *distruggere*), fails contextual cloze on first check | Transitions NORMAL $\rightarrow$ REINFORCE $\rightarrow$ RECOVERING; queues supportive narrative re-encounter. | ❌ Ignoring the struggle or giving isolated dictionary drill without narrative context. |
| **C. The Recognizer** | Passes 4-option recognition easily, but repeatedly fails cued cloze retrieval | Holds in REINFORCE / RECOVERING; **blocks promotion to MASTERED**. | ❌ Promoting lemma to MASTERED based on passive multiple-choice recognition. |
| **D. Strong Reader, Weak Speaker** | High reading comprehension and cloze accuracy, but hesitates/fails Speak Scene | Keeps **Production** dimension independent; advances lexical state to STABLE, but keeps vocal mastery separate. | ❌ Conflating reading comprehension with vocal production competence. |
| **E. The Narrative Devotee** | Bypasses all optional reviews to read consecutive chapters (e.g. Ch 16 $\rightarrow$ 17 $\rightarrow$ 18) | **Zero blocking popups.** The app gets out of the way and lets the reader read. | ❌ Forcing mandatory review gates between consecutive story chapters. |

---

## 11. North Star Product Metric: Learning Yield per Reading Minute

Storia measures its educational efficiency through a non-intrusive internal KPI:

\text{Learning Yield per Reading Minute} = \frac{\Delta \text{Active Retrieval} + \Delta \text{Comprehension} + \Delta \text{Vocal Production}}{\text{Total Reading \& Audio Time (Minutes)}}

* **Goal:** Maximize measurable language acquisition while **minimizing interruptions** to the reading immersion.
* **Philosophy:** If a learner improves their Italian without ever leaving the flow of the story, Storia has achieved its highest product ideal.

---

## 12. Complete Phase 15 Calibration Checklist

- [x] **Recurrence Audit:** 70 frozen chapters audited ( \le \Delta \le 5$ optimal narrative runway verified).
- [ ] **State-Based Practice Routing:** Implement adaptive question dispatching based on ExposureState (NORMAL $\rightarrow$ REINFORCE $\rightarrow$ RECOVERING $\rightarrow$ STABLE $\rightarrow$ MASTERED).
- [ ] **Multi-Dimensional Profile Separation:** Prevent collapse of Comprehension, Vocabulary, and Production into a single score.
- [ ] **Relative Latency Instrumentation:** Benchmark recall speed against the learner's personal median ($\Delta_{\text{latency}} = t - \tilde{t}_{\text{median}}$).
- [ ] **Contextual Cloze Prioritization:** Rank indExamplesForLemma candidates by recency, narrative salience, and syntactic clarity.
- [ ] **Failure-Mode Integration Testing:** Validate all 5 Persona scenarios (A through E) in automated service tests.
- [ ] **Zero-Interruption Reading Gate:** Ensure 100% of mid-chapter reading remains free of artificial exercise popups.


---

## 13. Population Target vs. Individual Quota (Anti-Formulaic Heuristic)

The **70 / 20 / 10** distribution is a **population-level macro benchmark**, strictly **NOT an individual quota**:

`
  Fluent Reader (Persona A):        90% Reading   │  8% Retrieval  │  2% Production
  Struggling Reader (Persona B):    65% Reading   │ 25% Retrieval  │ 10% Production
  Strong Reader / Weak Speaker (D): 75% Reading   │ 10% Retrieval  │ 15% Production
`

> [!CAUTION]
> **Anti-Quota Guardrail:** The system must **never** manufacture unnecessary retrieval clozes or exercises merely to satisfy an artificial 20% quota for an individual who is reading smoothly and retaining vocabulary organically.

---

## 14. Phase 15 Empirical Verification Gates

The practice intelligence layer is evaluated against 8 empirical behavioral gates:

1. **Intervention Decay:** Strong readers receive progressively *less* intervention over time.
2. **Targeted Support:** Struggling vocabulary receives *contextual* narrative clozes, not isolated drill loops.
3. **Mastery Integrity:** Recognition-only multiple-choice success *never* triggers false MASTERED promotion.
4. **Independent Dimensions:** Speaking and pronunciation weaknesses remain independently visible from reading comprehension.
5. **Continuous Reading Flow:** Readers can read multiple consecutive chapters with *zero* mandatory exercise gates.
6. **Incremental Retention Yield:** Targeted interventions demonstrate measurably higher retention than unassisted forgetting curves.
7. **Zero UX Damage:** Interventions do not degrade reading session length or chapter completion velocity.
8. **Permanent Philosophy Regressions:** Personas A through E are executed as permanent automated regression tests in CI to prevent feature creep.

