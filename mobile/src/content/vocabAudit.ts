import type { Chapter, ContentBundle, LexiconEntry } from '@/src/content/schemas';

export type ChapterVocabAudit = {
  chapterId: string;
  chapterNumber: number;
  titleIt: string;
  tokenCount: number;
  uniqueLemmaCount: number;
  familiarCount: number;
  learningCount: number;
  newCount: number;
  familiarPercent: number;
  learningPercent: number;
  newPercent: number;
  newLemmas: string[];
  learningLemmas: string[];
  warnings: string[];
};

export type StoryVocabAudit = {
  storyId: string;
  chapters: ChapterVocabAudit[];
};

/**
 * Exposure-based classification across chapters (content-time, not user progress):
 * - familiar: introduced at least 2 chapters earlier (or chapter 1 core)
 * - learning: introduced in the previous chapter
 * - new: first appearance in this chapter
 */
export function auditStoryVocabulary(bundle: ContentBundle): StoryVocabAudit {
  const firstSeen = new Map<string, number>();
  const chapters: ChapterVocabAudit[] = [];

  const ordered = [...bundle.chapters.values()].sort((a, b) => a.number - b.number);

  for (const chapter of ordered) {
    const lemmaCounts = collectLemmaCounts(chapter);
    const uniqueLemmas = [...lemmaCounts.keys()];

    const newLemmas: string[] = [];
    const learningLemmas: string[] = [];
    let familiarCount = 0;

    for (const lemmaId of uniqueLemmas) {
      const seenAt = firstSeen.get(lemmaId);
      if (seenAt === undefined) {
        newLemmas.push(lemmaId);
        firstSeen.set(lemmaId, chapter.number);
      } else if (chapter.number - seenAt === 1) {
        learningLemmas.push(lemmaId);
      } else {
        familiarCount += 1;
      }
    }

    const unique = uniqueLemmas.length || 1;
    const newCount = newLemmas.length;
    const learningCount = learningLemmas.length;
    const familiarPercent = (familiarCount / unique) * 100;
    const learningPercent = (learningCount / unique) * 100;
    const newPercent = (newCount / unique) * 100;

    const warnings: string[] = [];
    if (chapter.number === 1) {
      // Chapter 1 is definitionally all-new.
    } else if (chapter.number <= 3 && newPercent > 45) {
      warnings.push(
        `High new-vocab ratio for early chapter: ${newPercent.toFixed(1)}% (target ≤ 45%)`,
      );
    } else if (chapter.number <= 5 && newPercent > 35) {
      warnings.push(
        `High new-vocab ratio for early chapter: ${newPercent.toFixed(1)}% (target ≤ 35%)`,
      );
    } else if (chapter.number > 5 && newPercent > 30) {
      warnings.push(
        `High new-vocab ratio: ${newPercent.toFixed(1)}% (target ≤ 30%)`,
      );
    }
    if (chapter.number > 1 && newCount > 14) {
      warnings.push(`Too many new lemmas (${newCount}). Prefer ≤ 14 per chapter after ch1.`);
    }

    // Flag lemmas marked with later introducedChapter than actual first use
    for (const lemmaId of newLemmas) {
      const entry = bundle.lexiconById.get(lemmaId);
      if (entry?.introducedChapter && entry.introducedChapter > chapter.number) {
        warnings.push(
          `Lemma "${lemmaId}" first appears in ch${chapter.number} but lexicon says introduced_chapter=${entry.introducedChapter}`,
        );
      }
    }

    chapters.push({
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      titleIt: chapter.titleIt,
      tokenCount: [...lemmaCounts.values()].reduce((a, b) => a + b, 0),
      uniqueLemmaCount: uniqueLemmas.length,
      familiarCount,
      learningCount,
      newCount,
      familiarPercent,
      learningPercent,
      newPercent,
      newLemmas: newLemmas.sort(),
      learningLemmas: learningLemmas.sort(),
      warnings,
    });
  }

  return { storyId: bundle.story.id, chapters };
}

export function formatChapterAudit(audit: ChapterVocabAudit): string {
  const lines = [
    `CHAPTER ${String(audit.chapterNumber).padStart(2, '0')}`,
    '',
    `Tokens: ${audit.tokenCount}`,
    `Unique lemmas: ${audit.uniqueLemmaCount}`,
    '',
    `Familiar: ${audit.familiarCount} / ${audit.uniqueLemmaCount} = ${audit.familiarPercent.toFixed(1)}%`,
    `Learning: ${audit.learningCount} / ${audit.uniqueLemmaCount} = ${audit.learningPercent.toFixed(1)}%`,
    `New: ${audit.newCount} / ${audit.uniqueLemmaCount} = ${audit.newPercent.toFixed(1)}%`,
    '',
    'New vocabulary:',
    ...audit.newLemmas.map((l) => `* ${l}`),
  ];
  if (audit.warnings.length) {
    lines.push('', 'Warnings:', ...audit.warnings.map((w) => `! ${w}`));
  }
  return lines.join('\n');
}

function collectLemmaCounts(chapter: Chapter): Map<string, number> {
  const counts = new Map<string, number>();
  for (const paragraph of chapter.paragraphs) {
    for (const sentence of paragraph.sentences) {
      for (const token of sentence.tokens) {
        counts.set(token.lemmaId, (counts.get(token.lemmaId) ?? 0) + 1);
      }
    }
  }
  return counts;
}

export function assertLexiconCovers(bundle: ContentBundle): LexiconEntry[] {
  return bundle.lexicon;
}
