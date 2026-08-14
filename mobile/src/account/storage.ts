import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@supabase/supabase-js';

import {
  defaultAvatarIdForEmail,
  isAvatarId,
  type AvatarId,
} from '@/src/account/avatars';
import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { resetOnboarding } from '@/src/onboarding/storage';
import { setUnlockAllChapters } from '@/src/progress/unlockAll';
import { clearLocalLearnerState, hydrateLearnerIfNeeded } from '@/src/sync/learnerSession';

const KEY = 'storia.localAccount';

export const DEVELOPER_EMAIL = 'andrewkschug@gmail.com';

export type AccountRole = 'developer' | 'learner';

export type LocalAccount = {
  email: string;
  displayName: string;
  createdAt: string;
  role: AccountRole;
  avatarId: AvatarId;
};

export type SaveAccountInput = {
  email: string;
  displayName: string;
  avatarId?: AvatarId;
};

export type UpdateProfileInput = {
  displayName?: string;
  avatarId?: AvatarId;
};

export type PasswordAuthInput = {
  email: string;
  password: string;
  displayName?: string;
};

export function isDeveloperEmail(email: string): boolean {
  return email.trim().toLowerCase() === DEVELOPER_EMAIL;
}

export function roleForEmail(email: string): AccountRole {
  return isDeveloperEmail(email) ? 'developer' : 'learner';
}

export function isDeveloperAccount(account: LocalAccount | null | undefined): boolean {
  if (!account) return false;
  return account.role === 'developer' || isDeveloperEmail(account.email);
}

/** True in Metro/dev builds, or when the local account is the developer email. */
export function canAccessDeveloperTools(account: LocalAccount | null | undefined): boolean {
  if (typeof __DEV__ !== 'undefined' && __DEV__) return true;
  return isDeveloperAccount(account);
}

function normalizeAccount(raw: unknown): LocalAccount | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Partial<LocalAccount>;
  if (typeof row.email !== 'string' || !row.email.trim()) return null;
  if (typeof row.displayName !== 'string' || !row.displayName.trim()) return null;
  const email = row.email.trim();
  const displayName = row.displayName.trim();
  const createdAt =
    typeof row.createdAt === 'string' && row.createdAt ? row.createdAt : new Date().toISOString();
  return {
    email,
    displayName,
    createdAt,
    role: roleForEmail(email),
    avatarId: isAvatarId(row.avatarId) ? row.avatarId : defaultAvatarIdForEmail(email),
  };
}

function displayNameFromUser(user: User, fallback?: string): string {
  const meta = user.user_metadata?.display_name;
  if (typeof meta === 'string' && meta.trim()) return meta.trim();
  if (fallback?.trim()) return fallback.trim();
  const local = user.email?.split('@')[0];
  return local?.trim() || 'Learner';
}

function avatarIdFromUser(user: User, fallback?: AvatarId): AvatarId {
  const meta = user.user_metadata?.avatar_id;
  if (isAvatarId(meta)) return meta;
  if (fallback && isAvatarId(fallback)) return fallback;
  return defaultAvatarIdForEmail(user.email ?? '');
}

function accountFromUser(user: User, fallback?: { displayName?: string; avatarId?: AvatarId }): LocalAccount {
  const email = (user.email ?? '').trim();
  return {
    email,
    displayName: displayNameFromUser(user, fallback?.displayName),
    createdAt: user.created_at ?? new Date().toISOString(),
    role: roleForEmail(email),
    avatarId: avatarIdFromUser(user, fallback?.avatarId),
  };
}

async function persistRemoteProfile(userId: string, displayName: string, avatarId: AvatarId): Promise<void> {
  try {
    await getSupabase().auth.updateUser({
      data: { display_name: displayName, avatar_id: avatarId },
    });
  } catch {
    /* local cache still saved */
  }
  try {
    await getSupabase().from('storia_profiles').upsert({
      id: userId,
      display_name: displayName,
      avatar_id: avatarId,
    });
  } catch {
    /* profile table is optional until the Storia migration is applied */
  }
}

async function readLocalAccount(): Promise<LocalAccount | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return normalizeAccount(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

async function writeLocalAccount(account: LocalAccount): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(account));
}

function applyDeveloperUnlock(account: LocalAccount | null): void {
  setUnlockAllChapters(isDeveloperAccount(account));
}

export async function getAccount(): Promise<LocalAccount | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await getSupabase().auth.getSession();
      if (error) throw error;
      const user = data.session?.user;
      if (!user?.email) {
        await AsyncStorage.removeItem(KEY);
        applyDeveloperUnlock(null);
        return null;
      }
      const local = await readLocalAccount();
      const account = accountFromUser(user, {
        displayName: local?.displayName,
        avatarId: local?.avatarId,
      });
      await writeLocalAccount(account);
      await hydrateLearnerIfNeeded(user.id);
      applyDeveloperUnlock(account);
      return account;
    } catch {
      const fallback = await readLocalAccount();
      applyDeveloperUnlock(fallback);
      return fallback;
    }
  }
  const local = await readLocalAccount();
  applyDeveloperUnlock(local);
  return local;
}

/** Local-only cache (tests + offline fallback). Prefer signUpWithPassword / signInWithPassword. */
export async function saveAccount(input: SaveAccountInput): Promise<LocalAccount> {
  const email = input.email.trim();
  const displayName = input.displayName.trim();
  if (!email || !displayName) {
    throw new Error('Display name and email are required.');
  }

  const existing = await readLocalAccount();
  const account: LocalAccount = {
    email,
    displayName,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    role: roleForEmail(email),
    avatarId:
      input.avatarId && isAvatarId(input.avatarId)
        ? input.avatarId
        : existing?.avatarId ?? defaultAvatarIdForEmail(email),
  };
  await writeLocalAccount(account);
  applyDeveloperUnlock(account);
  return account;
}

export async function updateAccountProfile(patch: UpdateProfileInput): Promise<LocalAccount> {
  const current = await getAccount();
  if (!current) throw new Error('Not signed in.');
  const displayName = patch.displayName?.trim() ?? current.displayName;
  const avatarId = patch.avatarId ?? current.avatarId;
  if (!displayName) throw new Error('Display name is required.');
  if (!isAvatarId(avatarId)) throw new Error('Choose a profile picture.');

  const account: LocalAccount = { ...current, displayName, avatarId };
  await writeLocalAccount(account);

  if (isSupabaseConfigured()) {
    try {
      const { data } = await getSupabase().auth.getUser();
      const userId = data.user?.id;
      if (userId) await persistRemoteProfile(userId, displayName, avatarId);
    } catch {
      /* local cache still saved */
    }
  }
  return account;
}

export async function signUpWithPassword(input: PasswordAuthInput): Promise<LocalAccount> {
  const email = input.email.trim();
  const password = input.password;
  const displayName = input.displayName?.trim() ?? '';
  if (!email || !displayName || !password) {
    throw new Error('Display name, email, and password are required.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  if (!isSupabaseConfigured()) {
    return saveAccount({ email, displayName });
  }

  const avatarId = defaultAvatarIdForEmail(email);
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName, avatar_id: avatarId } },
  });
  if (error) throw new Error(error.message);
  if (!data.session?.user) {
    throw new Error('Check your email to confirm your account, then sign in.');
  }

  const account = accountFromUser(data.session.user, { displayName, avatarId });
  await writeLocalAccount(account);
  await persistRemoteProfile(data.session.user.id, displayName, avatarId);
  await hydrateLearnerIfNeeded(data.session.user.id);
  applyDeveloperUnlock(account);
  return account;
}

export async function signInWithPassword(input: PasswordAuthInput): Promise<LocalAccount> {
  const email = input.email.trim();
  const password = input.password;
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }
  if (!isSupabaseConfigured()) {
    const existing = await readLocalAccount();
    if (existing && existing.email.toLowerCase() === email.toLowerCase()) return existing;
    throw new Error('Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const user = data.session?.user ?? data.user;
  if (!user?.email) throw new Error('Sign in failed.');
  const local = await readLocalAccount();
  const account = accountFromUser(user, {
    displayName: local?.displayName,
    avatarId: local?.avatarId,
  });
  await writeLocalAccount(account);
  await hydrateLearnerIfNeeded(user.id);
  applyDeveloperUnlock(account);
  return account;
}

export async function signOutAccount(): Promise<void> {
  await clearAccount();
}

export async function clearAccount(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await getSupabase().auth.signOut();
    } catch {
      /* still clear local cache */
    }
  }
  await AsyncStorage.removeItem(KEY);
  await resetOnboarding();
  await clearLocalLearnerState();
  applyDeveloperUnlock(null);
}

/** Async convenience for screens that only need the boolean. */
export async function hasLocalAccount(): Promise<boolean> {
  return (await getAccount()) !== null;
}
