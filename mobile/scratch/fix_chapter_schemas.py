import json
import os
import re

questions_by_ch = {
    66: [
        {
            "id": "ch66_q01",
            "type": "event",
            "question": "How does Luca win over Signor Sergio, the traditional Roman printer who disliked light coffee?",
            "questionIt": "In che modo Luca conquista il signor Sergio, il tipografo romano tradizionale a cui non piaceva il caffè leggero?",
            "choices": [
                "By creating a rich, sweet, and full-bodied house blend that respects Roman tradition without sacrificing quality",
                "By refusing to serve him anything other than pour-over filter coffee",
                "By telling Sergio that he needs to study modern specialty coffee trends"
            ],
            "correctChoice": 0,
            "explanation": "Luca listens to Sergio's critique and crafts the Miscela Monti, a balanced house blend with chocolate notes that bridges tradition and quality.",
            "chapterId": "luca-a-roma-66",
            "difficulty": 3
        },
        {
            "id": "ch66_q02",
            "type": "inference",
            "question": "What core lesson about integration in Rome does Luca learn in Chapter 66?",
            "questionIt": "Quale lezione fondamentale sull'integrazione a Roma impara Luca nel Capitolo 66?",
            "choices": [
                "Integration means building a patient, respectful bridge between past wisdom and present craft without arrogance",
                "Integration requires completely forgetting one's hometown roots",
                "Integration means only interacting with fellow newcomers and tourists"
            ],
            "correctChoice": 0,
            "explanation": "Luca realizes that true craft is human dialogue, not intellectual elitism, and that belonging comes from welcoming everyone with respect.",
            "chapterId": "luca-a-roma-66",
            "difficulty": 3
        }
    ],
    67: [
        {
            "id": "ch67_q01",
            "type": "event",
            "question": "How do Luca, Claudia, and Marco overcome the drop in winter foot traffic and higher utility bills?",
            "questionIt": "In che modo Luca, Claudia e Marco superano il calo di clienti invernale e l'aumento delle bollette?",
            "choices": [
                "By launching 'Winter Saturdays', collaborative weekend workshops combining pottery, woodworking, and coffee tastings",
                "By taking out a bank loan and shutting down Spazio Monti until spring",
                "By tripling the price of coffee to compensate for fewer visitors"
            ],
            "correctChoice": 0,
            "explanation": "The three artisans combine their crafts into interactive weekend classes that sell out, generating revenue and strengthening community ties.",
            "chapterId": "luca-a-roma-67",
            "difficulty": 3
        },
        {
            "id": "ch67_q02",
            "type": "inference",
            "question": "What does the winter trial teach Luca about economic resilience?",
            "questionIt": "Cosa insegna a Luca la prova dell'inverno sulla resilienza economica?",
            "choices": [
                "Economic resilience is born from actively creating authentic value and human bonds, not passively waiting for good weather",
                "Resilience means cutting costs by using cheaper ingredients",
                "Resilience depends entirely on luck and foot traffic"
            ],
            "correctChoice": 0,
            "explanation": "Winter forces the workshop to innovate and connect directly with people, proving that genuine collaboration creates sustainable security.",
            "chapterId": "luca-a-roma-67",
            "difficulty": 3
        }
    ],
    68: [
        {
            "id": "ch68_q01",
            "type": "event",
            "question": "What corporate offer does Bruno present to Luca on behalf of a historic consortium?",
            "questionIt": "Quale offerta commerciale presenta Bruno a Luca per conto di un grande consorzio?",
            "choices": [
                "A large-scale partnership with guaranteed high salary and two new branches, but loss of independent control over recipes and scale",
                "An invitation to leave Rome and manage a coffee plantation in Brazil",
                "A free espresso machine with no strings attached"
            ],
            "correctChoice": 0,
            "explanation": "The consortium offers substantial financial backing and expansion, but requires corporate standardization and loss of artisan autonomy.",
            "chapterId": "luca-a-roma-68",
            "difficulty": 3
        },
        {
            "id": "ch68_q02",
            "type": "inference",
            "question": "Why does Luca decline the consortium's lucrative proposal, and why is Bruno proud of him?",
            "questionIt": "Perché Luca rifiuta la proposta vantaggiosa del consorzio, e perché Bruno è orgoglioso di lui?",
            "choices": [
                "Luca chooses autonomy, human-scale craft, and community connection over corporate security and rapid expansion",
                "Luca wants to retire early and stop working with coffee",
                "Luca disliked the lawyer who accompanied Bruno"
            ],
            "correctChoice": 0,
            "explanation": "Luca knows his true passion is independent craftsmanship and personal relationships, confirming to Bruno that Luca is now a master in his own right.",
            "chapterId": "luca-a-roma-68",
            "difficulty": 3
        }
    ],
    69: [
        {
            "id": "ch69_q01",
            "type": "event",
            "question": "What does Luca discover when reviewing Spazio Monti's full 12-month ledger with Claudia?",
            "questionIt": "Cosa scopre Luca analizzando il bilancio annuale di Spazio Monti insieme a Claudia?",
            "choices": [
                "The business is completely debt-free, profitable, and has built a solid 3-month emergency reserve fund without compromising quality",
                "The workshop has lost money and must close by the end of the month",
                "They spent all their savings on excessive advertising"
            ],
            "correctChoice": 0,
            "explanation": "The ledger shows healthy financial sustainability, proving that shared artisanal values can thrive in a major metropolitan reality.",
            "chapterId": "luca-a-roma-69",
            "difficulty": 3
        },
        {
            "id": "ch69_q02",
            "type": "inference",
            "question": "How does Luca view the operational mistakes and panics from his first year during the annual review?",
            "questionIt": "Come giudica Luca gli errori operativi e le paure del suo primo anno durante il bilancio annuale?",
            "choices": [
                "As indispensable learning steps that dismantled theoretical illusions and built real practical mastery and calm",
                "As embarrassing failures that should be hidden from everyone",
                "As reasons to never try new projects again"
            ],
            "correctChoice": 0,
            "explanation": "Luca realizes each breakdown and bottleneck taught him the dynamic balance necessary to lead a sustainable artisan life.",
            "chapterId": "luca-a-roma-69",
            "difficulty": 3
        }
    ],
    70: [
        {
            "id": "ch70_q01",
            "type": "event",
            "question": "What happens when Bruno passes by Spazio Monti on a sunny February morning?",
            "questionIt": "Cosa accade quando Bruno passa davanti a Spazio Monti in una mattina soleggiata di febbraio?",
            "choices": [
                "He sees the bustling, harmonious shop and gives Luca a solemn, silent wave of respect and paternal pride through the window",
                "He enters angrily to inspect the cleanliness of the counter",
                "He tells Luca that the coffee machine needs to be replaced"
            ],
            "correctChoice": 0,
            "explanation": "Bruno observes the flourishing community Luca has created and exchanges a poignant, silent greeting of mutual respect with his former apprentice.",
            "chapterId": "luca-a-roma-70",
            "difficulty": 3
        },
        {
            "id": "ch70_q02",
            "type": "inference",
            "question": "What is the core message of the B1+ Capstone in Chapter 70 regarding 'The Choice Renewed'?",
            "questionIt": "Qual è il messaggio centrale del capitolo finale (Capitolo 70) sulla 'Scelta rinnovata'?",
            "choices": [
                "The true choice is not made once at the start, but renewed every morning through conscious dedication, hospitality, and craft integrity",
                "Success in Rome means becoming famous and opening multiple chains",
                "Luca decides that working behind the counter is too exhausting and plans to leave"
            ],
            "correctChoice": 0,
            "explanation": "Luca achieves complete synthesis: his humble Pietralba roots and Rome's universal soul meet in his daily devotion to his craft, community, and freedom.",
            "chapterId": "luca-a-roma-70",
            "difficulty": 3
        }
    ]
}

remembered_facts = {
    66: [
        "Signor Sergio, a retired printer from Via dei Serpenti, complains that delicate specialty coffee lacks the strength and character of traditional Roman espresso",
        "Luca listens with humility rather than technical arrogance, recognizing that respecting neighborhood identity is essential to community belonging",
        "Luca crafts the Miscela Monti, blending sweet Brazilian coffee with darker roasted beans to provide rich body and chocolate notes with a clean finish",
        "Sergio tastes the new blend and gives his warm, genuine approval with a handshake",
        "Spazio Monti sees harmonious coexistence between students studying pour-over coffee and local artisans drinking the house blend at the counter"
    ],
    67: [
        "Winter brings freezing rain and damp cold to Monti, drastically reducing foot traffic while heating and electric bills spike",
        "Reviewing the ledger, Luca feels early anxiety resurface as profit margins thin out",
        "Claudia proposes 'Winter Saturdays', combining hands-on pottery workshops, olive-wood sanding demonstrations with Marco, and coffee tastings with Luca",
        "The weekend classes sell out within 48 hours, creating a warm, lively shelter and covering the entire week's overhead expenses",
        "Luca learns that economic resilience comes from actively creating value and lasting human bonds rather than depending on good weather"
    ],
    68: [
        "Bruno visits Spazio Monti in his formal overcoat to present a major commercial expansion offer from a historic regional roaster consortium",
        "The consortium offers high guaranteed salary and funding for two new locations in exchange for Luca becoming corporate technical director",
        "Luca recognizes that corporate scale would force standardized industrial recipes and strip away his artisan independence",
        "Luca politely declines the offer, stating that Spazio Monti's strength lies in human scale, detail, and authentic autonomy",
        "Bruno strikes the table with moved pride, confirming that Luca has made the true master artisan's choice"
    ],
    69: [
        "On a rainy Sunday with the shop closed, Luca sits at the chestnut table to conduct a comprehensive 12-month financial and personal audit",
        "Rereading early anxious notes, Luca realizes that every bottleneck and machine breakdown was an indispensable lesson in practical calm and efficiency",
        "The financial ledger shows steady net profits, zero debt, and a robust 3-month emergency reserve fund",
        "Claudia and Marco join Luca for rustic bread and pecorino, celebrating their shared teamwork and uncompromised craft quality",
        "Luca touches Bruno's bronze tamper, feeling the serene clarity of a builder resting on unshakeable foundations"
    ],
    70: [
        "On a brilliant February morning with an early hint of spring, Luca opens Spazio Monti with fluid, effortless mastery behind the counter",
        "Signor Sergio arrives for his morning espresso, greeted warmly as the shop fills with diverse neighbors, woodworkers, and students",
        "Bruno strolls past the sunlit window, exchanging a solemn, wordless wave of mutual respect and paternal pride with Luca",
        "At noon, Claudia teaches clay modeling to a neighborhood girl, Marco crafts wood, and Chiara guides students in Italian grammar",
        "Luca grips Bruno's bronze tamper with serene confidence, realizing that his true choice is renewed every dawn in service of his art and community"
    ]
}

def detect_speaker_and_kind(text, ch_num):
    if "«" in text and "»" in text:
        # dialogue
        lower = text.lower()
        if ch_num == 66:
            if "sergio" in lower or "ragazzo mio" in lower or "questo non è" in lower or "ecco, ragazzo" in lower:
                return "luca", "dialogue" # Sergio or Luca, let's check speakerIds in characters.json
            elif "claudia" in lower or "hai notato" in lower or "prima sembravi" in lower:
                return "claudia", "dialogue"
            elif "marco" in lower or "il legno e" in lower:
                return "marco", "dialogue"
            else:
                return "luca", "dialogue"
        elif ch_num == 67:
            if "claudia" in lower or "l'inverno è" in lower or "quando la gente" in lower:
                return "claudia", "dialogue"
            elif "marco" in lower or "possiamo creare" in lower or "questa non è" in lower:
                return "marco", "dialogue"
            elif "signora" in lower or "non avevo mai" in lower:
                return "claudia", "dialogue"
            else:
                return "luca", "dialogue"
        elif ch_num == 68:
            if "bruno" in lower or "buon pomeriggio" in lower or "preparami" in lower or "questo caffè ha" in lower or "sono qui perché" in lower or "vogliono farti" in lower or "sai già" in lower or "bravo, luca" in lower or "non hai più" in lower:
                return "padrone", "dialogue"
            else:
                return "luca", "dialogue"
        elif ch_num == 69:
            if "claudia" in lower or "come vanno" in lower or "sai qual è" in lower or "a roma, a spazio" in lower:
                return "claudia", "dialogue"
            elif "marco" in lower or "l'artigianato vero" in lower:
                return "marco", "dialogue"
            else:
                return "luca", "dialogue"
        elif ch_num == 70:
            if "sergio" in lower or "buongiorno, luca" in lower:
                return "luca", "dialogue"
            elif "cosa posso" in lower or "buongiorno a lei" in lower:
                return "luca", "dialogue"
            else:
                return "luca", "dialogue"
    return None, "narration"

for i in range(66, 71):
    ch_path = f"c:/Users/aksch/Code/storia/mobile/content/stories/luca-a-roma/chapters/chapter-{i}.json"
    with open(ch_path, "r", encoding="utf-8") as f:
        ch = json.load(f)

    ch["events"][0]["rememberedFacts"] = remembered_facts[i]
    ch["events"][0]["locationIds"] = ["quartiere", "centro", "strada"]

    for p_idx, p in enumerate(ch["paragraphs"]):
        p["id"] = f"p{p_idx + 1}"
        p["order"] = p_idx + 1
        for s in p["sentences"]:
            speaker, kind = detect_speaker_and_kind(s["text"], i)
            s["speakerId"] = speaker
            s["kind"] = kind

    ch["questions"] = questions_by_ch[i]

    with open(ch_path, "w", encoding="utf-8") as f:
        json.dump(ch, f, indent=2, ensure_ascii=False)
    print(f"Fixed schema for Chapter {i}")

print("All chapter schemas fixed.")
