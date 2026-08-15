export type StoryArcSummary = {
  id: string;
  cefrLevel: string;
  title: string;
  chapterStart: number;
  chapterEnd: number;
  status: 'available' | 'planned';
};

export type ExtraStoryRow = {
  storyId: string;
  titleIt: string;
  completed: number;
  total: number;
  eyebrow?: string;
  chapters: {
    id: string;
    number: number;
    title: string;
    titleIt: string;
    status: string;
  }[];
};

export type ExtraStorySection = {
  afterArcId: string;
  id: string;
  cefrLevel: string;
  title: string;
  stories: ExtraStoryRow[];
};

export type LevelGroup = {
  arc: StoryArcSummary;
  chapters: ExtraStoryRow['chapters'];
  stories?: ExtraStoryRow[];
  completed: number;
  total: number;
  locked: boolean;
  containsCurrent: boolean;
};

export function extraRowsFromCatalogStories(
  stories: { id: string; titleIt: string; chapterCount: number }[],
  eyebrow: string,
): ExtraStoryRow[] {
  return stories.map((story) => ({
    storyId: story.id,
    titleIt: story.titleIt,
    completed: 0,
    total: story.chapterCount,
    eyebrow,
    chapters: [],
  }));
}

export function insertExtraStoryGroups(
  groups: LevelGroup[],
  extraSections: ExtraStorySection[] | undefined,
): LevelGroup[] {
  if (!extraSections?.length) return groups;
  const next = [...groups];
  for (const extra of extraSections) {
    const afterIndex = next.findIndex((group) => group.arc.id === extra.afterArcId);
    const completed = extra.stories.reduce((sum, story) => sum + story.completed, 0);
    const total = extra.stories.reduce((sum, story) => sum + story.total, 0);
    const inserted: LevelGroup = {
      arc: {
        id: extra.id,
        cefrLevel: extra.cefrLevel,
        title: extra.title,
        chapterStart: 0,
        chapterEnd: -1,
        status: 'available',
      },
      chapters: extra.stories.flatMap((story) => story.chapters),
      stories: extra.stories,
      completed,
      total,
      locked: false,
      containsCurrent: extra.stories.some((story) =>
        story.chapters.some((chapter) => chapter.status === 'in_progress'),
      ),
    };
    if (afterIndex >= 0) next.splice(afterIndex + 1, 0, inserted);
    else next.push(inserted);
  }
  return next;
}
