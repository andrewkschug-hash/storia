/**
 * Shared vs story-local narrative entities.
 *
 * SHARED: global content/characters.json + locations.json (Luca, Sofia, Rome, …).
 *   Pre-Rome stories and Luca a Roma reuse these. Do not duplicate Luca.
 *
 * STORY-LOCAL: optional characters.json / locations.json beside a story manifest
 *   (Elena's Castelbianco cast). Merged on load; shared IDs win on collision.
 */

import type { Character, Location } from '@/src/content/schemas';
import { CharactersFileSchema, LocationsFileSchema } from '@/src/content/schemas';

export type EntityMergeResult = {
  characters: Character[];
  locations: Location[];
  sharedCharacterIds: string[];
  storyLocalCharacterIds: string[];
  sharedLocationIds: string[];
  storyLocalLocationIds: string[];
};

export function mergeStoryEntities(input: {
  sharedCharactersJson: unknown;
  sharedLocationsJson: unknown;
  storyLocalCharactersJson?: unknown;
  storyLocalLocationsJson?: unknown;
}): EntityMergeResult {
  const sharedCharacters = CharactersFileSchema.parse(input.sharedCharactersJson).characters;
  const sharedLocations = LocationsFileSchema.parse(input.sharedLocationsJson).locations;
  const sharedCharacterIds = sharedCharacters.map((row) => row.id);
  const sharedLocationIds = sharedLocations.map((row) => row.id);
  const sharedCharSet = new Set(sharedCharacterIds);
  const sharedLocSet = new Set(sharedLocationIds);

  const localCharacters = input.storyLocalCharactersJson
    ? CharactersFileSchema.parse(input.storyLocalCharactersJson).characters
    : [];
  const localLocations = input.storyLocalLocationsJson
    ? LocationsFileSchema.parse(input.storyLocalLocationsJson).locations
    : [];

  const storyLocalCharacterIds = localCharacters
    .filter((row) => !sharedCharSet.has(row.id))
    .map((row) => row.id);
  const storyLocalLocationIds = localLocations
    .filter((row) => !sharedLocSet.has(row.id))
    .map((row) => row.id);

  const characters = [
    ...sharedCharacters,
    ...localCharacters.filter((row) => !sharedCharSet.has(row.id)),
  ];
  const locations = [
    ...sharedLocations,
    ...localLocations.filter((row) => !sharedLocSet.has(row.id)),
  ];

  return {
    characters,
    locations,
    sharedCharacterIds,
    storyLocalCharacterIds,
    sharedLocationIds,
    storyLocalLocationIds,
  };
}
