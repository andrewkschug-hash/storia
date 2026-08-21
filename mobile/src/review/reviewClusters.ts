/**
 * Deterministic semantic clustering for batch word review.
 * Prevents near-duplicate learning concepts in the same session.
 */

export type ReviewItemRef = {
  kind: 'lemma' | 'phrase';
  id: string;
  english: string;
};

/** Normalized gloss for exact-english dedupe. */
export function normalizeReviewGloss(english: string): string {
  return english
    .toLowerCase()
    .replace(/^to\s+/, '')
    .replace(/[“”"']/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Shared phrase family key (ha_fame / ha_ancora_fame → ha_fame). */
export function phraseFamilyKey(phraseId: string): string {
  const parts = phraseId.split('_').filter(Boolean);
  if (parts.length <= 2) return phraseId;
  // Drop common intensifiers / fillers in the middle.
  const drop = new Set(['ancora', 'molto', 'poco', 'bene', 'male', 'sempre', 'mai']);
  const kept = parts.filter((part, index) => index === 0 || index === parts.length - 1 || !drop.has(part));
  if (kept.length >= 2) return kept.join('_');
  return phraseId;
}

/**
 * Cluster keys occupied by an item. Two items collide if they share any key.
 * Deterministic: keys are sorted unique strings.
 */
export function reviewClusterKeys(item: ReviewItemRef): string[] {
  const keys = new Set<string>();
  keys.add(`id:${item.kind}:${item.id}`);

  if (item.kind === 'lemma') {
    keys.add(`lemma:${item.id}`);
    // Lemma/phrase identity collision (scusa / scusa).
    keys.add(`surface:${item.id}`);
  } else {
    keys.add(`phrase:${item.id}`);
    keys.add(`family:${phraseFamilyKey(item.id)}`);
    keys.add(`surface:${item.id}`);
  }

  const gloss = normalizeReviewGloss(item.english);
  if (gloss) keys.add(`gloss:${gloss}`);

  // Soft learning clusters for known near-duplicates.
  const cluster = learningClusterFor(item);
  if (cluster) keys.add(`cluster:${cluster}`);

  return [...keys].sort();
}

function learningClusterFor(item: ReviewItemRef): string | null {
  const id = item.id.toLowerCase();
  const gloss = normalizeReviewGloss(item.english);

  if (
    id === 'avere' ||
    id === 'fame' ||
    id.startsWith('ha_fame') ||
    id.includes('ha_ancora_fame') ||
    gloss.includes('hungry') ||
    gloss === 'hunger' ||
    gloss === 'have'
  ) {
    // "to have" alone is broader — only cluster avere with hunger phrases / fame.
    if (id === 'avere') return 'avere-hunger';
    if (id === 'fame' || id.includes('fame') || gloss.includes('hungry') || gloss === 'hunger') {
      return 'avere-hunger';
    }
  }

  if (id.includes('lavorare') || (gloss.includes('can work') || gloss === 'i can work')) {
    if (id.includes('lavorare') || gloss.includes('work')) return 'can-work';
  }

  if (id === 'scusa' || gloss === 'sorry' || gloss === 'excuse me' || gloss.includes('excuse me')) {
    return 'scusa';
  }

  return null;
}

export function reviewItemsCollide(a: ReviewItemRef, b: ReviewItemRef): boolean {
  const aKeys = new Set(reviewClusterKeys(a));
  for (const key of reviewClusterKeys(b)) {
    if (aKeys.has(key)) return true;
  }
  return false;
}

/**
 * Returns true if `candidate` shares a cluster key with any already accepted item.
 */
export function conflictsWithAccepted(
  candidate: ReviewItemRef,
  accepted: ReviewItemRef[],
): boolean {
  for (const item of accepted) {
    if (reviewItemsCollide(candidate, item)) return true;
  }
  return false;
}
