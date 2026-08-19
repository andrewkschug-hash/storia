import { describe, expect, it } from 'vitest';

import { LUCA_STORY_ID } from '@/src/content';
import {
  routeAfterChapterComplete,
  routeAfterLevelReadiness,
  routeAfterRecap,
  routeAfterSpeakScene,
} from '@/src/progress/batchMilestoneRoute';

describe('batch milestone routing', () => {
  it('routes recap at batch 15 to speak scene', () => {
    expect(String(routeAfterRecap(LUCA_STORY_ID, 15))).toContain('luca-a-roma-speak-15');
  });

  it('routes speak scene at batch 20 to level readiness', () => {
    expect(String(routeAfterSpeakScene(LUCA_STORY_ID, 20))).toContain('level-readiness?fromChapter=20');
  });

  it('routes chapter 24 completion to level readiness before speak', () => {
    expect(String(routeAfterChapterComplete(LUCA_STORY_ID, 24))).toContain(
      'level-readiness?fromChapter=24',
    );
  });

  it('routes level readiness after chapter 24 to speak scene', () => {
    expect(String(routeAfterLevelReadiness(LUCA_STORY_ID, 24))).toContain('luca-a-roma-speak-24');
  });

  it('routes speak scene at batch 24 to chapter 25', () => {
    expect(String(routeAfterSpeakScene(LUCA_STORY_ID, 24))).toContain('/reader/luca-a-roma-25');
  });

  it('routes speak scene at batch 30 to next chapter reader', () => {
    expect(String(routeAfterSpeakScene(LUCA_STORY_ID, 30))).toContain('/reader/luca-a-roma-31');
  });

  it('routes recap at batch 5 directly to next chapter', () => {
    expect(String(routeAfterRecap(LUCA_STORY_ID, 5))).toContain('/reader/luca-a-roma-06');
  });
});
