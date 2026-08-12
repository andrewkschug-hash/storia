/**
 * Phase 10 infrastructure: A2 builder may only touch chapters 25–40.
 * Chapters 1–24 (A1 + A1+ bridge) are frozen.
 */

const PHASE10_MIN_CHAPTER = 25;
const PHASE10_MAX_CHAPTER = 40;
const PHASE10_CHAPTER_COUNT = PHASE10_MAX_CHAPTER - PHASE10_MIN_CHAPTER + 1; // 16

const FROZEN_RANGE_ERROR =
  'Chapters 1–24 are frozen; Phase 10 A2 builder only permits Chapters 25–40.';

/**
 * Fail immediately if any chapter outside the Phase 10 A2 window is selected.
 * No silent skip, no partial generate.
 * @param {Array<{ number: number } | number>} chapters
 */
function assertPhase10ChapterRange(chapters) {
  for (const item of chapters) {
    const n = typeof item === 'number' ? item : item.number;
    if (n < PHASE10_MIN_CHAPTER || n > PHASE10_MAX_CHAPTER) {
      throw new Error(FROZEN_RANGE_ERROR);
    }
  }
}

/**
 * Explicit Phase 10 generation set (25–40), not "all authored minus frozen".
 * @param {Array<{ number: number }>} authored
 */
function selectPhase10Chapters(authored) {
  return authored.filter(
    (c) => c.number >= PHASE10_MIN_CHAPTER && c.number <= PHASE10_MAX_CHAPTER,
  );
}

/** True if an english/adaptive key belongs to a regenerable Phase 10 chapter. */
function isPhase10ContentKey(key) {
  const m = String(key).match(/^luca-a-roma-(\d+)/);
  if (!m) return false;
  const n = Number(m[1]);
  return n >= PHASE10_MIN_CHAPTER && n <= PHASE10_MAX_CHAPTER;
}

module.exports = {
  PHASE10_MIN_CHAPTER,
  PHASE10_MAX_CHAPTER,
  PHASE10_CHAPTER_COUNT,
  FROZEN_RANGE_ERROR,
  assertPhase10ChapterRange,
  selectPhase10Chapters,
  isPhase10ContentKey,
};
