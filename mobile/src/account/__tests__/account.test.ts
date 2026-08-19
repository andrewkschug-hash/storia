import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultAvatarIdForEmail, isAvatarId } from '@/src/account/avatars';
import {
  canAccessDeveloperTools,
  clearAccount,
  getAccount,
  hasLocalAccount,
  saveAccount,
  signInWithPassword,
  signOutAccount,
  signUpWithPassword,
  updateAccountProfile,
} from '@/src/account/storage';
import { AUTH_CONFIG_MESSAGE } from '@/src/security/productionAuth';
import { isDevBuild } from '@/src/security/buildMode';
import { __resetUnlockAllChapters, setUnlockAllChapters, unlockAllChapters } from '@/src/progress/unlockAll';

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
      getAllKeys: async () => [...store.keys()],
      multiRemove: async (keys: string[]) => {
        for (const key of keys) store.delete(key);
      },
    },
  };
});

vi.mock('@/src/sync/learnerSession', () => ({
  hydrateLearnerIfNeeded: vi.fn(async () => {}),
  clearLocalLearnerState: vi.fn(async () => {}),
}));

vi.mock('@/src/onboarding/storage', () => ({
  resetOnboarding: vi.fn(async () => {}),
}));

const supabaseMock = vi.hoisted(() => ({
  configured: false,
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
  getUser: vi.fn(async () => ({ data: { user: null } })),
  signOut: vi.fn(async () => ({})),
  updateUser: vi.fn(async () => ({})),
  from: vi.fn(() => ({ upsert: vi.fn(async () => ({})) })),
}));

vi.mock('@/src/lib/supabase', () => ({
  isSupabaseConfigured: () => supabaseMock.configured,
  getSupabase: () => ({
    auth: {
      signUp: supabaseMock.signUp,
      signInWithPassword: supabaseMock.signInWithPassword,
      getSession: supabaseMock.getSession,
      getUser: supabaseMock.getUser,
      signOut: supabaseMock.signOut,
      updateUser: supabaseMock.updateUser,
    },
    from: supabaseMock.from,
  }),
}));

function setDevMode(dev: boolean): void {
  (globalThis as { __DEV__?: boolean }).__DEV__ = dev;
}

describe('local account persistence (development fallback)', () => {
  beforeEach(async () => {
    setDevMode(true);
    supabaseMock.configured = false;
    await clearAccount();
    __resetUnlockAllChapters();
  });

  afterEach(() => {
    vi.clearAllMocks();
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

describe('developer tooling access', () => {
  afterEach(() => {
    setDevMode(false);
  });

  it('allows developer tools only in development builds', () => {
    setDevMode(true);
    expect(canAccessDeveloperTools(null)).toBe(true);
    setUnlockAllChapters(isDevBuild());
    expect(unlockAllChapters()).toBe(true);

    setDevMode(false);
    expect(canAccessDeveloperTools(null)).toBe(false);
    setUnlockAllChapters(isDevBuild());
    expect(unlockAllChapters()).toBe(false);
  });
});

describe('production auth fail-closed', () => {
  beforeEach(async () => {
    setDevMode(false);
    supabaseMock.configured = false;
    vi.unstubAllEnvs();
    await clearAccount();
    __resetUnlockAllChapters();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('does not authenticate without Supabase configuration', async () => {
    await expect(
      signUpWithPassword({
        displayName: 'Alex',
        email: 'alex@example.com',
        password: 'secret1',
      }),
    ).rejects.toThrow(AUTH_CONFIG_MESSAGE);

    await expect(
      signInWithPassword({
        email: 'alex@example.com',
        password: 'secret1',
      }),
    ).rejects.toThrow(AUTH_CONFIG_MESSAGE);

    expect(await getAccount()).toBeNull();
    expect(await hasLocalAccount()).toBe(false);
  });

  it('does not allow local saveAccount in production', async () => {
    await expect(
      saveAccount({
        displayName: 'Alex',
        email: 'alex@example.com',
      }),
    ).rejects.toThrow(AUTH_CONFIG_MESSAGE);
  });

  it('authenticates normally when Supabase is configured', async () => {
    supabaseMock.configured = true;
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    supabaseMock.signInWithPassword.mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: 'user-1',
            email: 'alex@example.com',
            created_at: '2026-01-01T00:00:00.000Z',
            user_metadata: { display_name: 'Alex', avatar_id: 'mare' },
          },
        },
        user: null,
      },
      error: null,
    });

    const account = await signInWithPassword({
      email: 'alex@example.com',
      password: 'secret1',
    });
    expect(account.email).toBe('alex@example.com');
    expect(account.role).toBe('learner');
  });
});
