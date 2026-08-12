import type { CEFRLevel, MajorCEFRLevel } from '@/src/cefr/levels';
import { CEFR_LABELS, majorCEFRLevel, parseCEFRLevel } from '@/src/cefr/levels';
import { profileFor } from '@/src/cefr/profiles';
export type StoryArcStatus = 'available' | 'planned';

export type StoryArc = {
  id: string;
  storyId: string;
  cefrLevel: CEFRLevel;
  major: MajorCEFRLevel;
  title: string;
  titleIt: string;
  description: string;
  narrativeStage: string;
  chapterStart: number;
  chapterEnd: number;
  status: StoryArcStatus;
};

export const DEFAULT_LUCA_ARCS: StoryArc[] = [
  {
    id: 'luca-a-roma-a1',
    storyId: 'luca-a-roma',
    cefrLevel: 'A1',
    major: 'A1',
    title: 'Luca arrives in Rome',
    titleIt: 'Luca arriva a Roma',
    description: CEFR_LABELS.A1,
    narrativeStage: profileFor('A1').narrativeStage,
    chapterStart: 1,
    chapterEnd: 20,
    status: 'available',
  },
  {
    id: 'luca-a-roma-a1-plus',
    storyId: 'luca-a-roma',
    cefrLevel: 'A1+',
    major: 'A1',
    title: 'Luca finds his place',
    titleIt: 'Luca trova il suo posto',
    description: CEFR_LABELS.A1,
    narrativeStage: profileFor('A1+').narrativeStage,
    chapterStart: 21,
    chapterEnd: 24,
    status: 'available',
  },
  {
    id: 'luca-a-roma-a2',
    storyId: 'luca-a-roma',
    cefrLevel: 'A2',
    major: 'A2',
    title: "Luca's new life",
    titleIt: 'La nuova vita',
    description: CEFR_LABELS.A2,
    narrativeStage: profileFor('A2').narrativeStage,
    chapterStart: 25,
    chapterEnd: 40,
    status: 'available',
  },
  {
    id: 'luca-a-roma-a2-plus',
    storyId: 'luca-a-roma',
    cefrLevel: 'A2+',
    major: 'A2',
    title: 'New problems',
    titleIt: 'Nuovi problemi',
    description: CEFR_LABELS.A2,
    narrativeStage: profileFor('A2+').narrativeStage,
    chapterStart: 41,
    chapterEnd: 40,
    status: 'planned',
  },
  {
    id: 'luca-a-roma-b1',
    storyId: 'luca-a-roma',
    cefrLevel: 'B1',
    major: 'B1',
    title: 'Bigger decisions',
    titleIt: 'Decisioni più grandi',
    description: CEFR_LABELS.B1,
    narrativeStage: profileFor('B1').narrativeStage,
    chapterStart: 41,
    chapterEnd: 60,
    status: 'planned',
  },
  {
    id: 'luca-a-roma-b1-plus',
    storyId: 'luca-a-roma',
    cefrLevel: 'B1+',
    major: 'B1',
    title: 'Relationships and work',
    titleIt: 'Relazioni e lavoro',
    description: CEFR_LABELS.B1,
    narrativeStage: profileFor('B1+').narrativeStage,
    chapterStart: 61,
    chapterEnd: 60,
    status: 'planned',
  },
  {
    id: 'luca-a-roma-b2',
    storyId: 'luca-a-roma',
    cefrLevel: 'B2',
    major: 'B2',
    title: 'More complicated adult life',
    titleIt: 'Una vita più complicata',
    description: CEFR_LABELS.B2,
    narrativeStage: profileFor('B2').narrativeStage,
    chapterStart: 61,
    chapterEnd: 80,
    status: 'planned',
  },
  {
    id: 'luca-a-roma-c1',
    storyId: 'luca-a-roma',
    cefrLevel: 'C1',
    major: 'C1',
    title: 'Natural Italian',
    titleIt: 'Italiano naturale',
    description: CEFR_LABELS.C1,
    narrativeStage: profileFor('C1').narrativeStage,
    chapterStart: 81,
    chapterEnd: 100,
    status: 'planned',
  },
];

export function parseArcs(raw: unknown, storyId: string): StoryArc[] {
  if (!raw || typeof raw !== 'object') return DEFAULT_LUCA_ARCS.filter((a) => a.storyId === storyId);
  const list = Array.isArray(raw) ? raw : (raw as { arcs?: unknown }).arcs;
  if (!Array.isArray(list) || list.length === 0) {
    return DEFAULT_LUCA_ARCS.filter((a) => a.storyId === storyId);
  }
  return list.map((item) => {
    const row = item as Record<string, unknown>;
    const cefrLevel = parseCEFRLevel(String(row.cefrLevel ?? 'A1'));
    return {
      id: String(row.id),
      storyId: String(row.storyId ?? storyId),
      cefrLevel,
      major: majorCEFRLevel(cefrLevel),
      title: String(row.title ?? ''),
      titleIt: String(row.titleIt ?? row.title ?? ''),
      description: String(row.description ?? CEFR_LABELS[majorCEFRLevel(cefrLevel)]),
      narrativeStage: String(row.narrativeStage ?? profileFor(cefrLevel).narrativeStage),
      chapterStart: Number(row.chapterStart ?? 1),
      chapterEnd: Number(row.chapterEnd ?? 0),
      status: row.status === 'available' ? 'available' : 'planned',
    };
  });
}

export function arcForChapter(arcs: StoryArc[], chapterNumber: number): StoryArc | undefined {
  const available = arcs.filter(
    (a) => a.status === 'available' && chapterNumber >= a.chapterStart && chapterNumber <= a.chapterEnd,
  );
  if (available.length > 0) return available[0];
  return arcs.find((a) => chapterNumber >= a.chapterStart && chapterNumber <= a.chapterEnd);
}

export function assignChapterArc(
  chapterNumber: number,
  arcs: StoryArc[],
): { cefrTarget: CEFRLevel; arcId: string | null } {
  const arc = arcForChapter(arcs, chapterNumber);
  return { cefrTarget: arc?.cefrLevel ?? 'A1', arcId: arc?.id ?? null };
}
