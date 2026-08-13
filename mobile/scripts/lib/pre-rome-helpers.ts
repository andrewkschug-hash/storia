import { tokenizeItalian } from '../../src/content/tokenize';

export type Phrase = {
  surface: string;
  literalEn: string;
  naturalEn: string;
  tokenStart: number;
  tokenEnd: number;
};

export type Sent = {
  id: string;
  text: string;
  lemmas: string[];
  speakerId: string | null;
  kind: 'narration' | 'dialogue';
  phrases?: Phrase[];
};

export type Question = {
  id: string;
  type: 'direct' | 'event' | 'character' | 'sequence' | 'inference';
  question: string;
  choices: string[];
  correctChoice: number;
  explanation: string;
};

export type ChapterSpec = {
  id: string;
  number: number;
  title: string;
  titleIt: string;
  locationIds: string[];
  characterIds: string[];
  primaryDomain: string;
  secondaryDomains: string[];
  events: {
    id: string;
    summary: string;
    characterIds: string[];
    locationIds: string[];
    rememberedFacts: string[];
  }[];
  paragraphs: Sent[][];
  questions: Question[];
};

export type StorySpec = {
  id: string;
  title: string;
  titleIt: string;
  synopsis: string;
  characterIds: string[];
  locationIds: string[];
  chapters: ChapterSpec[];
};

export function s(
  id: string,
  text: string,
  lemmaLine: string,
  speakerId?: string,
  phrases?: Phrase[],
): Sent {
  const lemmas = lemmaLine.trim().split(/\s+/);
  const tokens = tokenizeItalian(text).map((t) => t.surface);
  if (tokens.length !== lemmas.length) {
    throw new Error(
      `${id}: tokens ${tokens.length} != lemmas ${lemmas.length}\n${text}\n${tokens.join(' | ')}\n${lemmas.join(' | ')}`,
    );
  }
  return {
    id,
    text,
    lemmas,
    speakerId: speakerId ?? null,
    kind: speakerId ? 'dialogue' : 'narration',
    phrases,
  };
}

export function q(
  id: string,
  type: Question['type'],
  question: string,
  choices: string[],
  correctChoice: number,
  explanation: string,
): Question {
  return { id, type, question, choices, correctChoice, explanation };
}

export function chapter(input: {
  id: string;
  number: number;
  title: string;
  titleIt: string;
  locationIds: string[];
  characterIds: string[];
  primaryDomain: string;
  secondaryDomains: string[];
  summary: string;
  facts: string[];
  paragraphs: Sent[][];
  questions: Question[];
}): ChapterSpec {
  return {
    id: input.id,
    number: input.number,
    title: input.title,
    titleIt: input.titleIt,
    locationIds: input.locationIds,
    characterIds: input.characterIds,
    primaryDomain: input.primaryDomain,
    secondaryDomains: input.secondaryDomains,
    events: [
      {
        id: `ev-${input.id}`,
        summary: input.summary,
        characterIds: input.characterIds,
        locationIds: input.locationIds,
        rememberedFacts: input.facts,
      },
    ],
    paragraphs: input.paragraphs,
    questions: input.questions,
  };
}
