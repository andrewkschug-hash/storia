import {
  LUCA_STORY_ID,
  PRE_ROME_ARC_ID,
  getCatalogStories,
  getNarrativeArcs,
  getStoryCatalog,
} from '@/src/content/catalog';

export type CatalogValidationResult = {
  ok: boolean;
  errors: string[];
  available: string[];
  draft: string[];
  planned: string[];
};

export function validateStoryCatalog(): CatalogValidationResult {
  const errors: string[] = [];
  const catalog = getStoryCatalog();
  const arcs = getNarrativeArcs();
  const stories = getCatalogStories();
  const arcIds = new Set(arcs.map((arc) => arc.id));

  const seenStoryIds = new Set<string>();
  for (const story of catalog.stories) {
    if (seenStoryIds.has(story.id)) errors.push(`Duplicate story id "${story.id}"`);
    seenStoryIds.add(story.id);
    if (!arcIds.has(story.narrativeArc)) {
      errors.push(`Story "${story.id}" references unknown narrativeArc "${story.narrativeArc}"`);
    }
    if (story.status === 'available') {
      if (!story.contentPath) errors.push(`Available story "${story.id}" missing contentPath`);
      if (story.chapterCount < 1) errors.push(`Available story "${story.id}" has no chapters`);
    }
    if (story.status === 'planned') {
      if (story.chapterCount !== 0) {
        errors.push(`Planned story "${story.id}" must keep chapterCount 0 until marked available`);
      }
      if (story.narrativeArc === PRE_ROME_ARC_ID && !story.contentPath) {
        errors.push(`Planned pre-Rome story "${story.id}" needs a contentPath after authoring`);
      }
      if (
        story.chapterCountTarget !== undefined &&
        (story.chapterCountTarget < 5 || story.chapterCountTarget > 8)
      ) {
        errors.push(`Planned story "${story.id}" chapterCountTarget must be 5–8`);
      }
    }
    if (story.status === 'draft' && !story.contentPath) {
      errors.push(`Draft story "${story.id}" needs a contentPath for inspection`);
    }
  }

  const luca = stories.find((story) => story.id === LUCA_STORY_ID);
  if (!luca) errors.push('Catalog missing luca-a-roma');
  else {
    if (luca.status !== 'available') errors.push('luca-a-roma must remain available');
    if (luca.chapterCount !== 40) errors.push('luca-a-roma chapterCount must stay 40');
    if (luca.narrativeArc !== LUCA_STORY_ID) errors.push('luca-a-roma narrativeArc must stay luca-a-roma');
  }

  const preRome = stories.filter((story) => story.narrativeArc === PRE_ROME_ARC_ID);
  if (preRome.length !== 5) errors.push('Expected five luca-prima-di-roma stories');
  if (preRome.some((story) => story.status !== 'planned')) {
    errors.push('Pre-Rome stories must stay planned until authored');
  }
  if (luca && preRome.length > 0) {
    const preMax = Math.max(...preRome.map((story) => story.narrativeOrder));
    if (!(preMax < luca.narrativeOrder)) {
      errors.push('Pre-Rome narrativeOrder must precede luca-a-roma (do not use chapter 41+)');
    }
  }

  const journeyOrders = stories
    .filter((story) => story.narrativeArc === PRE_ROME_ARC_ID || story.id === LUCA_STORY_ID)
    .map((story) => story.narrativeOrder);
  if (new Set(journeyOrders).size !== journeyOrders.length) {
    errors.push('Luca journey narrativeOrder values must be unique');
  }

  return {
    ok: errors.length === 0,
    errors,
    available: stories.filter((story) => story.status === 'available').map((story) => story.id),
    draft: stories.filter((story) => story.status === 'draft').map((story) => story.id),
    planned: stories.filter((story) => story.status === 'planned').map((story) => story.id),
  };
}
