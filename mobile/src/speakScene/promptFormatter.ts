import type { SpeakSceneTurnLearner } from '@/src/content/schemas';

export type ResolvedPromptSemantics = {
  promptDirective: string;
  sayEn: string;
  objectiveEn: string;
};

/**
 * Resolves the semantic prompt directive and canonical spoken English quote.
 * Invariant: `sayEn` is always the exact English utterance the learner expresses,
 * while `promptDirective` is the communicative roleplay instruction.
 */
export function resolvePromptSemantics(
  learnerTurn: Pick<SpeakSceneTurnLearner, 'objectiveEn'> &
    Partial<Pick<SpeakSceneTurnLearner, 'promptDirective' | 'sayEn'>>,
  partnerName?: string,
): ResolvedPromptSemantics {
  const objectiveEn = (learnerTurn.objectiveEn ?? '').trim();

  // If explicit canonical fields are defined on the turn data, use them directly
  if (learnerTurn.promptDirective && learnerTurn.sayEn) {
    return {
      promptDirective: learnerTurn.promptDirective.trim(),
      sayEn: learnerTurn.sayEn.trim(),
      objectiveEn,
    };
  }

  // Fallback heuristic parser for legacy content
  const parsed = parseObjectiveEn(objectiveEn, partnerName);
  return {
    promptDirective: learnerTurn.promptDirective?.trim() || parsed.promptDirective,
    sayEn: learnerTurn.sayEn?.trim() || parsed.sayEn,
    objectiveEn,
  };
}

function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function ensurePunctuation(text: string, isQuestion: boolean): string {
  const trimmed = text.trim().replace(/[.,!?;:]+$/, '');
  if (!trimmed) return '';
  return isQuestion ? `${trimmed}?` : `${trimmed}.`;
}

function parseObjectiveEn(
  objectiveEn: string,
  partnerName?: string,
): { promptDirective: string; sayEn: string } {
  if (!objectiveEn) {
    return { promptDirective: 'Respond:', sayEn: '' };
  }

  const clean = objectiveEn.trim();

  // "Ask Sofia what is wrong."
  const askMatch = clean.match(/^Ask\s+([A-Za-z]+)\s+(what|how|why|where|when|if)\s+(.*)$/i);
  if (askMatch) {
    const targetName = askMatch[1];
    const qWord = askMatch[2].toLowerCase();
    const rest = askMatch[3].replace(/[.]+$/, '');
    const isQuestion = true;
    let spoken = `${qWord} ${rest}`;
    if (qWord === 'what' && rest.toLowerCase() === 'is wrong') spoken = 'what is wrong';
    if (qWord === 'how' && rest.toLowerCase() === 'his mom is doing') spoken = 'how is your mom doing';
    return {
      promptDirective: `Ask ${targetName}:`,
      sayEn: ensurePunctuation(capitalizeFirst(spoken), isQuestion),
    };
  }

  // "Tell Sofia that we can help." / "Tell Mom you have a home..."
  const tellMatch = clean.match(/^Tell\s+([A-Za-z]+)\s+(?:that\s+)?(.*)$/i);
  if (tellMatch) {
    const targetName = tellMatch[1];
    let rest = tellMatch[2].replace(/[.]+$/, '');
    // Adjust 2nd/3rd person pronouns: "you are" -> "I am", "you have" -> "I have"
    rest = rest.replace(/\byou are\b/gi, 'I am');
    rest = rest.replace(/\byou have\b/gi, 'I have');
    rest = rest.replace(/\byou were\b/gi, 'I was');
    return {
      promptDirective: `Tell ${targetName}:`,
      sayEn: ensurePunctuation(capitalizeFirst(rest), false),
    };
  }

  // "Reassure Mom that you are fine..." / "Reassure her that..."
  const reassureMatch = clean.match(/^Reassure\s+([A-Za-z]+)\s+(?:that\s+)?(.*)$/i);
  if (reassureMatch) {
    const targetName = reassureMatch[1].toLowerCase() === 'her' ? partnerName || 'her' : reassureMatch[1];
    let rest = reassureMatch[2].replace(/[.]+$/, '');
    rest = rest.replace(/\byou are\b/gi, 'I am');
    return {
      promptDirective: `Reassure ${targetName}:`,
      sayEn: ensurePunctuation(capitalizeFirst(rest), false),
    };
  }

  // "Say that you want to buy the ticket." / "Say that now you have..."
  const sayMatch = clean.match(/^Say\s+(?:that\s+)?(.*)$/i);
  if (sayMatch) {
    let rest = sayMatch[1].replace(/[.]+$/, '');
    rest = rest.replace(/\byou want\b/gi, 'I want');
    rest = rest.replace(/\byou have\b/gi, 'I have');
    return {
      promptDirective: partnerName ? `Say to ${partnerName}:` : 'Say:',
      sayEn: ensurePunctuation(capitalizeFirst(rest), false),
    };
  }

  // "Agree and say let's go together." / "Agree joyfully and declare: For now, this is home."
  const agreeMatch = clean.match(/^Agree(?:\s+joyfully|\s+enthusiastically)?\s+(?:and\s+say|and\s+declare:?|to\s+go\s+together)?\s*(.*)$/i);
  if (agreeMatch && agreeMatch[1]) {
    const rest = agreeMatch[1].replace(/^:\s*/, '').replace(/[.]+$/, '');
    return {
      promptDirective: 'Agree:',
      sayEn: ensurePunctuation(capitalizeFirst(rest), false),
    };
  }

  // "Propose having a coffee together..." / "Propose the work division:..."
  const proposeMatch = clean.match(/^Propose\s+(.*)$/i);
  if (proposeMatch) {
    let rest = proposeMatch[1].replace(/^:\s*/, '').replace(/[.]+$/, '');
    if (rest.startsWith('having a coffee')) rest = "let's have a coffee together first before going back";
    return {
      promptDirective: 'Propose:',
      sayEn: ensurePunctuation(capitalizeFirst(rest), false),
    };
  }

  return {
    promptDirective: partnerName ? `Respond to ${partnerName}:` : 'Say in Italian:',
    sayEn: clean,
  };
}
