/**
 * Draft-story inspection. Does not require complete prose or comprehension questions.
 * Elena remains draft; this does not finish or wire her into the reader.
 *
 * File I/O stays in scripts/tests. This module is bundle-safe.
 */

import { getCatalogStory } from '@/src/content/catalog';
import { mergeStoryEntities } from '@/src/content/entities';
import {
  StoryManifestSchema,
  type CatalogStory,
  type Character,
  type Location,
  type StoryManifest,
} from '@/src/content/schemas';

export type DraftStoryInspection = {
  story: CatalogStory;
  manifest: StoryManifest | null;
  characters: Character[];
  locations: Location[];
  sharedCharacterIds: string[];
  storyLocalCharacterIds: string[];
  proseChapterFiles: string[];
  missingChapterFiles: string[];
  complete: false;
};

export function inspectDraftStoryData(input: {
  storyId: string;
  sharedCharactersJson: unknown;
  sharedLocationsJson: unknown;
  storyLocalCharactersJson?: unknown;
  storyLocalLocationsJson?: unknown;
  manifestJson?: unknown;
  proseChapterFiles: string[];
}): DraftStoryInspection {
  const story = getCatalogStory(input.storyId);
  if (!story) throw new Error(`Unknown story "${input.storyId}"`);
  if (story.status !== 'draft') {
    throw new Error(`Story "${input.storyId}" status is ${story.status}, not draft`);
  }

  const merged = mergeStoryEntities({
    sharedCharactersJson: input.sharedCharactersJson,
    sharedLocationsJson: input.sharedLocationsJson,
    storyLocalCharactersJson: input.storyLocalCharactersJson,
    storyLocalLocationsJson: input.storyLocalLocationsJson,
  });

  const manifest = input.manifestJson
    ? StoryManifestSchema.parse(input.manifestJson)
    : null;
  const expected = manifest?.chapters.map((chapter) => chapter.file) ?? [];
  const onDisk = input.proseChapterFiles;
  const missingChapterFiles = expected.filter((file) => !onDisk.includes(file));

  return {
    story,
    manifest,
    characters: merged.characters,
    locations: merged.locations,
    sharedCharacterIds: merged.sharedCharacterIds,
    storyLocalCharacterIds: merged.storyLocalCharacterIds,
    proseChapterFiles: onDisk,
    missingChapterFiles,
    complete: false,
  };
}
