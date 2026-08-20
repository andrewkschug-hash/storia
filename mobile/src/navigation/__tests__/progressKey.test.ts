import { describe, expect, it } from 'vitest';

import { progressDependencyKey } from '@/src/navigation/progressKey';
import { createInitialProgress } from '@/src/progress/types';

describe('progressDependencyKey', () => {
  it('is stable for equivalent progress objects', () => {
    const a = createInitialProgress('luca-a-roma', 'luca-a-roma-01');
    const b = { ...a, completedChapterIds: [...a.completedChapterIds] };
    expect(progressDependencyKey(a)).toBe(progressDependencyKey(b));
  });

  it('changes when meaningful progress fields change', () => {
    const base = createInitialProgress('luca-a-roma', 'luca-a-roma-01');
    const moved = { ...base, currentChapterId: 'luca-a-roma-02' };
    expect(progressDependencyKey(base)).not.toBe(progressDependencyKey(moved));
  });
});
