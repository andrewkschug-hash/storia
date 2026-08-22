/**
 * Stage 0: Voice Audition and Casting Validation for A2+ Genre Paths.
 *
 * Generates ~63 curated audition clips (3 representative lines per character):
 *   1. Narrative / neutral (baseline timbre & pacing)
 *   2. Quiet dialogue (conversational realism)
 *   3. Emotional / character-defining (emotional range & personality)
 *
 * Safe default: preflight / dry-run only.
 *
 * Usage:
 *   node mobile/scripts/audition-a2plus-voices.js --dry-run
 *   node mobile/scripts/audition-a2plus-voices.js --generate
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const repoRoot = path.join(__dirname, '..', '..');
const ttsGatewayDir = path.join(repoRoot, 'services', 'tts-gateway');
const auditionOutDir = path.join(ttsGatewayDir, 'data', 'audition');
const auditionReportPath = path.join(auditionOutDir, 'AUDITION-REPORT.md');

const { resolveSpeakerVoice } = require('./voice-roster-common');
const voicesPath = path.join(__dirname, '..', 'content', 'audio', 'voices.json');

const AUDITION_LINES = [
  // === Unified Narrator ===
  {
    characterId: 'narrator',
    story: 'Common / All Paths',
    category: 'Neutral Baseline',
    text: 'Irene arriva a San Quirico sul Nera nel pomeriggio.',
  },
  {
    characterId: 'narrator',
    story: 'Common / All Paths',
    category: 'Atmospheric / Quiet',
    text: "Marina di Brenta comincia dove la terraferma finisce e l'acqua non è ancora mare aperto.",
  },
  {
    characterId: 'narrator',
    story: 'Common / All Paths',
    category: 'Dramatic / Mystery',
    text: "A Collevento non c'è una stazione vera; c'è soltanto una banchina corta di cemento con l'erba tra le crepe.",
  },

  // === La casa delle finestre (Thriller) ===
  {
    characterId: 'irene-colombo',
    story: 'La casa delle finestre',
    category: 'Neutral Baseline',
    text: "Io sono Irene Colombo. Ho il contratto per l'archivio del comune.",
  },
  {
    characterId: 'irene-colombo',
    story: 'La casa delle finestre',
    category: 'Quiet Dialogue',
    text: 'E il piano di sopra? Quello con le finestre grandi?',
  },
  {
    characterId: 'irene-colombo',
    story: 'La casa delle finestre',
    category: 'Character-Defining',
    text: 'Non è mio, questo paese. Ma non vendo la storia e non distruggo i registri.',
  },

  {
    characterId: 'loredana',
    story: 'La casa delle finestre',
    category: 'Neutral Baseline',
    text: 'La stanza è al terzo piano. Ha una buona vista sulla piazza.',
  },
  {
    characterId: 'loredana',
    story: 'La casa delle finestre',
    category: 'Quiet Dialogue',
    text: 'Nessuno entra più lì dentro da due anni. È pericoloso.',
  },
  {
    characterId: 'loredana',
    story: 'La casa delle finestre',
    category: 'Character-Defining / Emotional',
    text: 'Se ama questo paese, lasci stare le finestre e non faccia domande.',
  },

  {
    characterId: 'alme',
    story: 'La casa delle finestre',
    category: 'Neutral / Formal',
    text: "Buongiorno, Irene. Ha trovato tutto il materiale nell'archivio?",
  },
  {
    characterId: 'alme',
    story: 'La casa delle finestre',
    category: 'Quiet / Directive',
    text: 'Quella cartella non deve essere scansionata. La lasci da parte.',
  },
  {
    characterId: 'alme',
    story: 'La casa delle finestre',
    category: 'Character-Defining / Authoritative',
    text: 'Il contratto è corto. Non lo rinnoviamo, e venerdì si distruggono le vecchie carte.',
  },

  {
    characterId: 'quinto-belli',
    story: 'La casa delle finestre',
    category: 'Neutral Baseline',
    text: 'Sono il custode. Tengo le chiavi ma non salgo più di sopra.',
  },
  {
    characterId: 'quinto-belli',
    story: 'La casa delle finestre',
    category: 'Quiet Dialogue',
    text: "Il cancello... questa chiave apre il cortile, ma l'altra non so dove sia.",
  },
  {
    characterId: 'quinto-belli',
    story: 'La casa delle finestre',
    category: 'Character-Defining / Guilt',
    text: 'Annaffio piante morte nel cortile così non devo guardare su.',
  },

  {
    characterId: 'mimmo',
    story: 'La casa delle finestre',
    category: 'Playful Baseline',
    text: "Guarda il video! Si vede una luce che passa da una finestra all'altra.",
  },
  {
    characterId: 'mimmo',
    story: 'La casa delle finestre',
    category: 'Quiet Dialogue',
    text: "Dicono tutti che c'è un fantasma nella vecchia scuola.",
  },
  {
    characterId: 'mimmo',
    story: 'La casa delle finestre',
    category: 'Character-Defining / Excited',
    text: 'Oppure è il fantasma di giorno! Sarebbe ancora meglio per il canale!',
  },

  {
    characterId: 'sara-neri',
    story: 'La casa delle finestre',
    category: 'Neutral Baseline',
    text: 'Lei è Irene. Io sono Sara Neri. Insegnavo qui prima che chiudessero tutto.',
  },
  {
    characterId: 'sara-neri',
    story: 'La casa delle finestre',
    category: 'Urgent / Quiet',
    text: 'Venerdì Alme distrugge i registri delle classi, le copie e tutte le relazioni sulle crepe.',
  },
  {
    characterId: 'sara-neri',
    story: 'La casa delle finestre',
    category: 'Character-Defining / Emotional',
    text: 'I registri. Una scatola sola. Non tutto, ma abbastanza perché non sia morto tutto.',
  },

  {
    characterId: 'piva',
    story: 'La casa delle finestre',
    category: 'Formal Baseline',
    text: 'Si sieda, signorina. Mi dica con calma che cosa ha visto.',
  },
  {
    characterId: 'piva',
    story: 'La casa delle finestre',
    category: 'Quiet / Local',
    text: "Non è una storia per la televisione. È un paese, è una questione locale.",
  },
  {
    characterId: 'piva',
    story: 'La casa delle finestre',
    category: 'Character-Defining / Firm',
    text: 'Le finestre non sono mai state il reato. La falsificazione della carta sì.',
  },

  // === Una lettera per Elena (Romance) ===
  {
    characterId: 'elena-marini',
    story: 'Una lettera per Elena',
    category: 'Neutral / Counter',
    text: 'Buongiorno. Due espressi e un cornetto alla crema, arrivano subito.',
  },
  {
    characterId: 'elena-marini',
    story: 'Una lettera per Elena',
    category: 'Quiet / Personal',
    text: 'Volevo solo sapere se stavi bene... non ti ho visto martedì.',
  },
  {
    characterId: 'elena-marini',
    story: 'Una lettera per Elena',
    category: 'Character-Defining / Emotional',
    text: 'Vorrei riprovare, ma stavolta in voce, non sul quaderno.',
  },

  {
    characterId: 'pietro-baldo',
    story: 'Una lettera per Elena',
    category: 'Hesitant / Baseline',
    text: 'Buongiorno... ho portato i sacchi del caffè per il bar.',
  },
  {
    characterId: 'pietro-baldo',
    story: 'Una lettera per Elena',
    category: 'Quiet / Honest',
    text: 'Scrivere sul libro è più facile per me. A voce sbaglio sempre le parole.',
  },
  {
    characterId: 'pietro-baldo',
    story: 'Una lettera per Elena',
    category: 'Character-Defining / Vulnerable',
    text: 'Non posso vivere per sempre così, con la paura di dirti la verità.',
  },

  {
    characterId: 'bruna',
    story: 'Una lettera per Elena',
    category: 'Neutral / Daily',
    text: 'Buongiorno, Elena. Sei in orario, metti pure il grembiule.',
  },
  {
    characterId: 'bruna',
    story: 'Una lettera per Elena',
    category: 'Quiet / Observant',
    text: 'Quel libro sullo scaffale serve a chi non ha il coraggio di parlare subito.',
  },
  {
    characterId: 'bruna',
    story: 'Una lettera per Elena',
    category: 'Character-Defining / Firm',
    text: 'Se quel quaderno diventa un nascondiglio e non un ponte, allora lo chiudo a chiave.',
  },

  {
    characterId: 'katia',
    story: 'Una lettera per Elena',
    category: 'Neutral / Dry',
    text: 'Ciao. Io sono Katia. Tu sei la nuova barista, vero?',
  },
  {
    characterId: 'katia',
    story: 'Una lettera per Elena',
    category: 'Quiet / Observant',
    text: 'Pietro viene qui ogni martedì solo per guardare verso quello scaffale.',
  },
  {
    characterId: 'katia',
    story: 'Una lettera per Elena',
    category: 'Character-Defining / Dry',
    text: 'Voi due siete troppo sentimentali. Parlatevi e basta.',
  },

  {
    characterId: 'mirella-marini',
    story: 'Una lettera per Elena',
    category: 'Maternal / Practical',
    text: 'Marina di Brenta non è Padova, ma è casa nostra.',
  },
  {
    characterId: 'mirella-marini',
    story: 'Una lettera per Elena',
    category: 'Quiet / Memory',
    text: 'Tuo padre parlava poco, ma quando scriveva una lettera si capiva tutto.',
  },
  {
    characterId: 'mirella-marini',
    story: 'Una lettera per Elena',
    category: 'Character-Defining / Warm',
    text: 'Se questo ragazzo ti piace davvero, portalo a cena da noi quando vuoi.',
  },

  {
    characterId: 'sergio-baldo',
    story: 'Una lettera per Elena',
    category: 'Tired / Baseline',
    text: 'Tutto bene, Pietro? Non devi preoccuparti per me ogni giorno.',
  },
  {
    characterId: 'sergio-baldo',
    story: 'Una lettera per Elena',
    category: 'Quiet / Recovery',
    text: "La fisioterapia aiuta. Tra poco potrò tornare a lavorare anch'io.",
  },
  {
    characterId: 'sergio-baldo',
    story: 'Una lettera per Elena',
    category: 'Character-Defining / Sincere',
    text: 'Non rovinare la tua vita per stare dietro ai miei problemi.',
  },

  // === Il villaggio che non esiste (Fantasy) ===
  {
    characterId: 'giada-rinaldi',
    story: 'Il villaggio che non esiste',
    category: 'Neutral Baseline',
    text: 'Scusi, io stavo andando a Trento. Ho perso la coincidenza per questo binario?',
  },
  {
    characterId: 'giada-rinaldi',
    story: 'Il villaggio che non esiste',
    category: 'Quiet Dialogue',
    text: 'Non ho prenotato nessuna stanza, signora. Devo solo prendere il prossimo treno.',
  },
  {
    characterId: 'giada-rinaldi',
    story: 'Il villaggio che non esiste',
    category: 'Character-Defining / Precise',
    text: 'Faccio fotografie proprio perché non mi fido dei ricordi della gente.',
  },

  {
    characterId: 'elsa',
    story: 'Il villaggio che non esiste',
    category: 'Neutral Baseline',
    text: 'Benvenuta alla locanda. Sei arrivata appena prima del tramonto.',
  },
  {
    characterId: 'elsa',
    story: 'Il villaggio che non esiste',
    category: 'Quiet / Warning',
    text: 'Dopo le otto non si cammina sulla strada della diga. Sono le regole del paese.',
  },
  {
    characterId: 'elsa',
    story: 'Il villaggio che non esiste',
    category: 'Character-Defining / Sharp',
    text: 'La verità, qui a Collevento, è una cosa privata che non riguarda chi passa.',
  },

  {
    characterId: 'tullio',
    story: 'Il villaggio che non esiste',
    category: 'Neutral Baseline',
    text: "L'acqua della diga scende a orari precisi. Non aspetta nessuno.",
  },
  {
    characterId: 'tullio',
    story: 'Il villaggio che non esiste',
    category: 'Quiet / Stern',
    text: 'Non è un gioco per turisti, ragazzina. La strada sotto si allaga.',
  },
  {
    characterId: 'tullio',
    story: 'Il villaggio che non esiste',
    category: 'Character-Defining / Clock-like',
    text: "All'alba puoi passare. Prima dell'apertura delle paratie c'è un'ora pulita.",
  },

  {
    characterId: 'neri',
    story: 'Il villaggio che non esiste',
    category: 'Youth / Baseline',
    text: 'Tu sei la nuova arrivata. Che ci fai bloccata qui a Collevento?',
  },
  {
    characterId: 'neri',
    story: 'Il villaggio che non esiste',
    category: 'Quiet / Mystery',
    text: "Sulla mappa nuova questo paese non c'è nemmeno più. Hanno cancellato il nome.",
  },
  {
    characterId: 'neri',
    story: 'Il villaggio che non esiste',
    category: 'Character-Defining / Restless',
    text: 'Se trovo un passaggio sulla statale me ne vado domani mattina e non torno più.',
  },

  {
    characterId: 'anna-rinaldi',
    story: 'Il villaggio che non esiste',
    category: 'Neutral / Phone',
    text: "Giada? Pronto? Non ti sento bene, c'è troppo rumore di fondo.",
  },
  {
    characterId: 'anna-rinaldi',
    story: 'Il villaggio che non esiste',
    category: 'Quiet / Warning',
    text: 'Ascoltami bene: se sei a Collevento, non restare fuori dopo che fa buio.',
  },
  {
    characterId: 'anna-rinaldi',
    story: 'Il villaggio che non esiste',
    category: 'Character-Defining / Direct',
    text: 'Non sistemare la storia nella tua testa per far tornare tutto. Quel paese è finito nel 2007.',
  },

  {
    characterId: 'ingegnere',
    story: 'Il villaggio che non esiste',
    category: 'Formal / Smooth',
    text: 'Buongiorno a tutti. Sono qui per il consueto sopralluogo tecnico della diga.',
  },
  {
    characterId: 'ingegnere',
    story: 'Il villaggio che non esiste',
    category: 'Quiet / Bureaucratic',
    text: 'La compensazione economica è vantaggiosa per chi decide di trasferirsi subito a valle.',
  },
  {
    characterId: 'ingegnere',
    story: 'Il villaggio che non esiste',
    category: 'Character-Defining / Executive',
    text: 'Le regole valgono per i residenti. Io ho una vettura alta di servizio e parto adesso.',
  },

  {
    characterId: 'papa-rinaldi',
    story: 'Il villaggio che non esiste',
    category: 'Neutral / Phone',
    text: 'Pronto, Giada? Sei arrivata a Trento? Ti sto aspettando alla stazione.',
  },
  {
    characterId: 'papa-rinaldi',
    story: 'Il villaggio che non esiste',
    category: 'Quiet Dialogue',
    text: 'Ti hanno fatta passare per tua madre? Ma che razza di posto è quello?',
  },
  {
    characterId: 'papa-rinaldi',
    story: 'Il villaggio che non esiste',
    category: 'Character-Defining / Fatherly',
    text: 'Tua madre dovrebbe vedere queste foto, un giorno. Ma intanto vieni a casa.',
  },
];

async function main() {
  const args = process.argv.slice(2);
  const generate = args.includes('--generate');

  const rosterRaw = JSON.parse(fs.readFileSync(voicesPath, 'utf8'));

  console.log('================================================================');
  console.log('  STAGE 0: VOICE AUDITION & CASTING VALIDATION (A2+)');
  console.log('================================================================\n');

  let totalChars = 0;
  const missingVoices = [];
  const plan = [];

  for (let i = 0; i < AUDITION_LINES.length; i++) {
    const item = AUDITION_LINES[i];
    const voice = resolveSpeakerVoice(rosterRaw, item.characterId, 'google');
    if (!voice) {
      missingVoices.push(`Missing voice mapping for speaker: ${item.characterId}`);
    }
    const chars = Array.from(item.text).length;
    totalChars += chars;
    const numStr = String(i + 1).padStart(2, '0');
    const filename = `audition-${numStr}-${item.characterId}-${item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp3`;
    plan.push({
      index: i + 1,
      filename,
      ...item,
      voiceId: voice?.voiceId ?? 'UNMAPPED',
      voiceName: voice?.voiceName ?? voice?.voiceId ?? 'UNMAPPED',
      chars,
    });
  }

  // Group by Story & Character for Human-Readable Manifest
  const byStory = new Map();
  for (const p of plan) {
    if (!byStory.has(p.story)) byStory.set(p.story, new Map());
    const byChar = byStory.get(p.story);
    if (!byChar.has(p.characterId)) byChar.set(p.characterId, []);
    byChar.get(p.characterId).push(p);
  }

  console.log('AUDITION MANIFEST:\n');
  for (const [story, charMap] of byStory.entries()) {
    console.log(`STORY / CONTEXT: ${story}`);
    for (const [charId, items] of charMap.entries()) {
      const vName = items[0].voiceName.replace(/^it[-_]IT[-_]/i, '');
      console.log(`  Character: ${charId} → ${vName} (${items[0].voiceId})`);
      for (const it of items) {
        console.log(`    [${it.category}] "${it.text}" (${it.chars} chars)`);
      }
    }
    console.log('');
  }

  console.log('AUDITION SUMMARY:');
  console.log(`  Total Audition Clips:  ${plan.length}`);
  console.log(`  Characters Covered:    ${new Set(plan.map((p) => p.characterId)).size}`);
  console.log(`  Total Billable Chars:  ${totalChars}`);
  console.log(`  Missing / Unmapped:    ${missingVoices.length}`);
  console.log(`  Fail-Closed Status:    ${missingVoices.length === 0 ? 'READY' : 'BLOCKED'}\n`);

  if (missingVoices.length > 0) {
    console.error('FAIL-CLOSED: Unmapped audition voices detected. Aborting.');
    for (const err of missingVoices) console.error(`  - ${err}`);
    process.exit(1);
  }

  if (!generate) {
    console.log('Dry-run complete. No audio requests made.');
    console.log('To generate audition clips:');
    console.log('  node mobile/scripts/audition-a2plus-voices.js --generate');
    process.exit(0);
  }

  // Generate Stage
  console.log('Generating audition clips via Google Cloud TTS...');
  fs.mkdirSync(auditionOutDir, { recursive: true });

  // Dynamic import of TTS gateway helper
  const { GoogleTTSProvider } = await import(pathToFileURL(path.join(ttsGatewayDir, 'src', 'providers.ts')).href);
  const { loadGatewayEnv } = await import(pathToFileURL(path.join(ttsGatewayDir, 'src', 'env.ts')).href);
  const {
    countBillableCharacters,
    evaluateGoogleTtsGuard,
    loadPricingFile,
    runtimeGuardInputs,
    withGoogleApiPermit,
  } = await import(pathToFileURL(path.join(ttsGatewayDir, 'src', 'googleTtsGuard.ts')).href);

  loadGatewayEnv();
  const tts = new GoogleTTSProvider(process.env);
  const runtime = runtimeGuardInputs();
  const pricing = loadPricingFile();

  const reportRows = [];

  for (const item of plan) {
    const counted = countBillableCharacters(item.text);
    if (!counted.ok) throw new Error(counted.error);

    const guard = evaluateGoogleTtsGuard({
      planned: [
        {
          storyId: 'audition',
          chapterId: 'stage0',
          sentenceId: `line-${item.index}`,
          logicalVoice: item.characterId,
          googleVoiceId: item.voiceId,
          language: 'it-IT',
          text: item.text,
          generationSpeed: 'normal',
          generationVersion: 1,
          outputFilename: item.filename,
          estimatedBillableCharacters: counted.chars,
          action: 'generate',
        },
      ],
      pricing,
      hardLimitChars: runtime.hardLimitChars,
      trackedUsage: runtime.trackedUsage,
      providerConfigured: true,
      now: runtime.now,
      dryRun: false,
      allowPaidUsage: false,
    });

    if (!guard.allowed) {
      throw new Error(`Cost guard rejected audition line ${item.index}: ${guard.error}`);
    }

    process.stdout.write(`Generating [${item.index}/${plan.length}] ${item.characterId} (${item.voiceName})... `);
    const result = await withGoogleApiPermit(guard, () =>
      tts.generateSpeech({
        text: item.text,
        voiceId: item.voiceId,
        language: 'it-IT',
        speed: 'normal',
      }),
    );

    const outPath = path.join(auditionOutDir, item.filename);
    fs.writeFileSync(outPath, Buffer.from(result.audio));
    const sizeKb = (result.audio.byteLength / 1024).toFixed(1);
    console.log(`OK (${sizeKb} KB)`);

    reportRows.push({
      ...item,
      outPath,
      byteLength: result.audio.byteLength,
    });
  }

  // Generate Review Report Markdown
  let md = '# Stage 0: Voice Audition & Casting Review Report\n\n';
  md += `**Date:** ${new Date().toISOString().slice(0, 10)}\n`;
  md += `**Total Clips:** ${plan.length} clips across ${new Set(plan.map((p) => p.characterId)).size} characters\n`;
  md += `**Total Characters:** ${totalChars} billable characters\n`;
  md += `**Audio Directory:** \`${auditionOutDir}\`\n\n`;
  md += '## Evaluation Criteria:\n';
  md += '1. **Age believability & personality fit**\n';
  md += '2. **Italian pronunciation & cadence**\n';
  md += '3. **Emotional range & conversational realism**\n';
  md += '4. **Distinctness from narrator and peer characters**\n';
  md += '5. **Long-form stamina** (pleasant for 20+ chapters)\n\n';
  md += '---\n\n';

  for (const [story, charMap] of byStory.entries()) {
    md += `## Story: ${story}\n\n`;
    for (const [charId, items] of charMap.entries()) {
      const vName = items[0].voiceName.replace(/^it[-_]IT[-_]/i, '');
      md += `### Character: \`${charId}\`\n`;
      md += `- **Assigned Voice:** \`${items[0].voiceId}\` (${vName})\n`;
      md += `- **Casting Status:** [ ] ACCEPT  [ ] REJECT  [ ] SUBSTITUTE\n\n`;
      md += '| # | Category | Sample Italian Text | Chars | File |\n';
      md += '|---|---|---|---|---|\n';
      for (const it of items) {
        md += `| ${it.index} | **${it.category}** | *"${it.text}"* | ${it.chars} | \`${it.filename}\` |\n`;
      }
      md += '\n';
    }
    md += '---\n\n';
  }

  fs.writeFileSync(auditionReportPath, md, 'utf8');
  console.log(`\nAudition generation complete!`);
  console.log(`Generated ${plan.length} MP3 files in: ${auditionOutDir}`);
  console.log(`Audition review report created at: ${auditionReportPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exit(1);
});
