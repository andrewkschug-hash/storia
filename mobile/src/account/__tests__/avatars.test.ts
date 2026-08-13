import { describe, expect, it } from 'vitest';

import { AVATAR_PRESETS, defaultAvatarIdForEmail, isAvatarId } from '@/src/account/avatars';

describe('avatar presets', () => {
  it('has eight default portraits', () => {
    expect(AVATAR_PRESETS).toHaveLength(8);
    expect(AVATAR_PRESETS.every((p) => isAvatarId(p.id))).toBe(true);
  });

  it('rejects unknown ids', () => {
    expect(isAvatarId('libro')).toBe(true);
    expect(isAvatarId('cat')).toBe(false);
    expect(isAvatarId(null)).toBe(false);
  });

  it('picks a stable default from email', () => {
    const a = defaultAvatarIdForEmail('alex@example.com');
    const b = defaultAvatarIdForEmail('  Alex@Example.com  ');
    expect(a).toBe(b);
    expect(isAvatarId(a)).toBe(true);
    expect(isAvatarId(defaultAvatarIdForEmail('sam@example.com'))).toBe(true);
  });
});
