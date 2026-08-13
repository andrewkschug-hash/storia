import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultAvatarIdForEmail, isAvatarId } from '@/src/account/avatars';
import {
  DEVELOPER_EMAIL,
  canAccessDeveloperTools,
  clearAccount,
  getAccount,
  hasLocalAccount,
  isDeveloperAccount,
  isDeveloperEmail,
  roleForEmail,
  saveAccount,
  signOutAccount,
  signUpWithPassword,
  updateAccountProfile,
} from '@/src/account/storage';

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: async (key: string) => {
        store.delete(key);
      },
    },
  };
});

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

vi.mock('@/src/lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  getSupabase: () => {
    throw new Error('Supabase is not configured in tests.');
  },
}));

describe('local account persistence', () => {
  beforeEach(async () => {
    await clearAccount();
  });

  it('starts with no account', async () => {
    expect(await getAccount()).toBeNull();
    expect(await hasLocalAccount()).toBe(false);
  });

  it('saves and reloads account fields', async () => {
    const saved = await saveAccount({
      displayName: 'Alex',
      email: 'alex@example.com',
    });

    expect(saved.displayName).toBe('Alex');
    expect(saved.email).toBe('alex@example.com');
    expect(saved.role).toBe('learner');
    expect(saved.createdAt).toMatch(/^\d{4}-/);
    expect(isAvatarId(saved.avatarId)).toBe(true);
    expect(saved.avatarId).toBe(defaultAvatarIdForEmail('alex@example.com'));

    const loaded = await getAccount();
    expect(loaded).toEqual(saved);
    expect(await hasLocalAccount()).toBe(true);
  });

  it('keeps createdAt when updating the same storage slot', async () => {
    const first = await saveAccount({
      displayName: 'Alex',
      email: 'alex@example.com',
    });
    const second = await saveAccount({
      displayName: 'Alexandra',
      email: 'alex@example.com',
    });
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.displayName).toBe('Alexandra');
  });

  it('clears the account', async () => {
    await saveAccount({ displayName: 'Alex', email: 'alex@example.com' });
    await clearAccount();
    expect(await getAccount()).toBeNull();
  });

  it('keeps a chosen avatar and updates display name', async () => {
    await saveAccount({
      displayName: 'Alex',
      email: 'alex@example.com',
      avatarId: 'mare',
    });
    const updated = await updateAccountProfile({
      displayName: 'Alessandra',
      avatarId: 'limone',
    });
    expect(updated.displayName).toBe('Alessandra');
    expect(updated.avatarId).toBe('limone');
    expect(await getAccount()).toEqual(updated);
  });

  it('signOutAccount clears local state', async () => {
    await saveAccount({ displayName: 'Alex', email: 'alex@example.com' });
    await signOutAccount();
    expect(await getAccount()).toBeNull();
  });

  it('rejects empty name or email', async () => {
    await expect(saveAccount({ displayName: '  ', email: 'a@b.com' })).rejects.toThrow();
    await expect(saveAccount({ displayName: 'Alex', email: '  ' })).rejects.toThrow();
  });

  it('signUpWithPassword falls back to local save when Supabase is not configured', async () => {
    const saved = await signUpWithPassword({
      displayName: 'Alex',
      email: 'alex@example.com',
      password: 'secret1',
    });
    expect(saved.email).toBe('alex@example.com');
    expect(await hasLocalAccount()).toBe(true);
  });
});

describe('developer email detection', () => {
  it('marks andrewkschug@gmail.com as developer (case-insensitive)', () => {
    expect(isDeveloperEmail(DEVELOPER_EMAIL)).toBe(true);
    expect(isDeveloperEmail('AndrewKSchug@gmail.com')).toBe(true);
    expect(isDeveloperEmail('  andrewkschug@gmail.com  ')).toBe(true);
    expect(roleForEmail('ANDREWKSCHUG@GMAIL.COM')).toBe('developer');
  });

  it('marks other emails as learners', () => {
    expect(isDeveloperEmail('learner@example.com')).toBe(false);
    expect(roleForEmail('learner@example.com')).toBe('learner');
    expect(roleForEmail('andrewkschug@example.com')).toBe('learner');
  });

  it('isDeveloperAccount follows role and email', async () => {
    expect(isDeveloperAccount(null)).toBe(false);

    const learner = await saveAccount({
      displayName: 'Sam',
      email: 'sam@example.com',
    });
    expect(isDeveloperAccount(learner)).toBe(false);
    expect(canAccessDeveloperTools(learner)).toBe(
      typeof __DEV__ !== 'undefined' ? Boolean(__DEV__) : false,
    );

    await clearAccount();
    const developer = await saveAccount({
      displayName: 'Andrew',
      email: 'andrewkschug@gmail.com',
    });
    expect(developer.role).toBe('developer');
    expect(isDeveloperAccount(developer)).toBe(true);
    expect(canAccessDeveloperTools(developer)).toBe(true);
  });
});
