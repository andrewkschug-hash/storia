/**
 * Emit Luca prima di Roma chapter JSON + manifests. Run: npx tsx scripts/emit-pre-rome.ts
 */
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { ChapterSpec, StorySpec } from './lib/pre-rome-helpers';
import { story01 } from './lib/pre-rome-s1';
import { story02 } from './lib/pre-rome-s2';
import { story03 } from './lib/pre-rome-s3';
import { story04 } from './lib/pre-rome-s4';
import { story05 } from './lib/pre-rome-s5';

function chapterFile(storyId: string, ch: ChapterSpec) {
  return {
    id: ch.id,
    storyId,
    number: ch.number,
    title: ch.title,
    titleIt: ch.titleIt,
    difficultyLevel: 1,
    locationIds: ch.locationIds,
    characterIds: ch.characterIds,
    primaryDomain: ch.primaryDomain,
    secondaryDomains: ch.secondaryDomains,
    events: ch.events,
    paragraphs: ch.paragraphs.map((sentences, i) => ({
      id: `p${i + 1}`,
      order: i + 1,
      sentences: sentences.map((row) => ({
        id: row.id,
        text: row.text,
        speakerId: row.speakerId ?? null,
        kind: row.kind ?? 'narration',
        lemmas: row.lemmas,
        ...(row.phrases ? { phrases: row.phrases } : {}),
      })),
    })),
    questions: ch.questions.map((q) => ({
      ...q,
      chapterId: ch.id,
      difficulty: 1,
    })),
  };
}

function manifestFor(story: StorySpec) {
  return {
    id: story.id,
    title: story.title,
    titleIt: story.titleIt,
    slug: story.id,
    level: 1,
    cefrLevel: 'A1',
    synopsis: story.synopsis,
    characterIds: story.characterIds,
    locationIds: story.locationIds,
    chapters: story.chapters.map((ch) => ({
      id: ch.id,
      number: ch.number,
      title: ch.title,
      titleIt: ch.titleIt,
      difficultyLevel: 1,
      file: `chapter-${String(ch.number).padStart(2, '0')}.json`,
    })),
    arcs: [
      {
        id: `${story.id}-a1`,
        storyId: story.id,
        cefrLevel: 'A1',
        title: story.title,
        titleIt: story.titleIt,
        description: 'A1 present-tense pre-Rome story',
        narrativeStage: story.synopsis,
        chapterStart: 1,
        chapterEnd: story.chapters.length,
        status: 'planned',
      },
    ],
  };
}

const stories: StorySpec[] = [story01, story02, story03, story04, story05];
const outRoot = join(__dirname, '..', 'content', 'stories');

for (const story of stories) {
  const dir = join(outRoot, story.id);
  mkdirSync(join(dir, 'chapters'), { recursive: true });
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifestFor(story), null, 2) + '\n');
  for (const ch of story.chapters) {
    const file = `chapter-${String(ch.number).padStart(2, '0')}.json`;
    writeFileSync(join(dir, 'chapters', file), JSON.stringify(chapterFile(story.id, ch), null, 2) + '\n');
  }
  console.log(story.id, story.chapters.length, 'chapters');
}
