/**
 * Phase 10: frozen A1+ bridge (chapters 21–24).
 * Generator scripts that overwrite authored JSON must pass --force.
 */

const FROZEN_BRIDGE_MIN = 21;
const FROZEN_BRIDGE_MAX = 24;

const BRIDGE_GUARD_MESSAGE = `
Refusing to run: this script overwrites authored story content.

  Frozen range: chapters ${FROZEN_BRIDGE_MIN}–${FROZEN_BRIDGE_MAX} (A1+ bridge)
  Canonical SOT:  content/stories/luca-a-roma/chapters/chapter-*.json

  See docs/PHASE-10.md for the source-of-truth hierarchy.

  To run anyway (destructive): add --force
`.trim();

/**
 * @param {string} scriptLabel e.g. "build-a1plus-bridge.js"
 * @param {{ chapterRange?: string, extra?: string }} [opts]
 */
function requireGeneratorForceFlag(scriptLabel, opts = {}) {
  if (process.argv.includes('--force')) return;
  const range = opts.chapterRange ?? `${FROZEN_BRIDGE_MIN}–${FROZEN_BRIDGE_MAX}`;
  console.error(`${scriptLabel}: ${BRIDGE_GUARD_MESSAGE}`);
  if (opts.extra) console.error(opts.extra);
  console.error(`  Overwrites: chapters ${range}`);
  process.exit(1);
}

module.exports = {
  FROZEN_BRIDGE_MIN,
  FROZEN_BRIDGE_MAX,
  BRIDGE_GUARD_MESSAGE,
  requireGeneratorForceFlag,
};
