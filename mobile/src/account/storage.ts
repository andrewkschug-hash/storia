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
import { isDevBuild } from '@/src/security/buildMode';
import {
  AUTH_CONFIG_MESSAGE,
  allowsLocalAuthFallback,
  requireSupabaseForAuth,
} from '@/src/security/productionAuth';
import { clearLocalLearnerState, hydrateLearnerIfNeeded } from '@/src/sync/learnerSession';

const KEY = 'storia.localAccount';

let accountLoadPromise: Promise<LocalAccount | null> | null = null;

export type AccountRole = 'learner' | 'developer' | 'admin';

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
  role?: AccountRole;
};

export type UpdateProfileInput = {
  displayName?: string;
  avatarId?: AvatarId;
  role?: AccountRole;
};

export type PasswordAuthInput = {
  email: string;
  password: string;
  displayName?: string;
};

export const DEVELOPER_EMAILS = new Set([
  'andrewkschug@gmail.com',
  ...(process.env.EXPO_PUBLIC_DEVELOPER_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? []),
]);

export function isDeveloperEmail(email?: string | null): boolean {
  if (!email) return false;
  return DEVELOPER_EMAILS.has(email.trim().toLowerCase());
}

/** Developer tooling is available in development builds or for verified developer/admin accounts. */
export function canAccessDeveloperTools(account: LocalAccount | null | undefined): boolean {
  return (
    isDevBuild() ||
    account?.role === 'developer' ||
    account?.role === 'admin' ||
    isDeveloperEmail(account?.email)
  );
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
  const role: AccountRole =
    isDeveloperEmail(email) || row.role === 'developer' || row.role === 'admin'
      ? (row.role === 'admin' ? 'admin' : 'developer')
      : 'learner';
  return {
    email,
    displayName,
    createdAt,
    role,
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

function extractRoleFromUser(
  user: User,
  fallbackRole?: AccountRole,
): AccountRole {
  if (isDeveloperEmail(user.email)) return 'developer';
  const appRole = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (appRole === 'developer' || appRole === 'admin') return appRole;
  const userRole = (user.user_metadata as Record<string, unknown> | undefined)?.role;
  if (userRole === 'developer' || userRole === 'admin') return userRole;
  const isDevMeta =
    (user.app_metadata as Record<string, unknown> | undefined)?.is_developer ??
    (user.user_metadata as Record<string, unknown> | undefined)?.is_developer;
  if (isDevMeta === true || isDevMeta === 'true') return 'developer';
  if (fallbackRole === 'developer' || fallbackRole === 'admin') return fallbackRole;
  return 'learner';
}

function accountFromUser(
  user: User,
  fallback?: { displayName?: string; avatarId?: AvatarId; role?: AccountRole },
): LocalAccount {
  const email = (user.email ?? '').trim();
  const role = isDeveloperEmail(email) ? 'developer' : extractRoleFromUser(user, fallback?.role);
  return {
    email,
    displayName: displayNameFromUser(user, fallback?.displayName),
    createdAt: user.created_at ?? new Date().toISOString(),
    role,
    avatarId: avatarIdFromUser(user, fallback?.avatarId),
  };
}

async function persistRemoteProfile(
  userId: string,
  displayName: string,
  avatarId: AvatarId,
  role?: AccountRole,
): Promise<void> {
  try {
    await getSupabase().auth.updateUser({
      data: {
        display_name: displayName,
        avatar_id: avatarId,
        ...(role ? { role } : {}),
      },
    });
  } catch {
    /* local cache still saved */
  }
  try {
    const payload: Record<string, unknown> = {
      id: userId,
      display_name: displayName,
      avatar_id: avatarId,
    };
    if (role) payload.role = role;
    await getSupabase().from('storia_profiles').upsert(payload);
  } catch {
    /* profile table is optional until the Storibase migration is applied */
  }
}

async function fetchRemoteProfile(
  userId: string,
): Promise<{ displayName?: string; avatarId?: AvatarId; role?: AccountRole } | null> {
  try {
    const { data, error } = await getSupabase()
      .from('storia_profiles')
      .select('display_name, avatar_id, role')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) return null;
    const displayName =
      typeof data.display_name === 'string' && data.display_name.trim()
        ? data.display_name.trim()
        : undefined;
    const avatarId = isAvatarId(data.avatar_id) ? data.avatar_id : undefined;
    const role: AccountRole | undefined =
      data.role === 'developer' || data.role === 'admin' ? data.role : undefined;
    if (!displayName && !avatarId && !role) return null;
    return { displayName, avatarId, role };
  } catch {
    return null;
  }
}

async function accountFromSessionUser(
  user: User,
  fallback?: { displayName?: string; avatarId?: AvatarId; role?: AccountRole },
): Promise<LocalAccount> {
  const remote = await fetchRemoteProfile(user.id);
  return accountFromUser(user, {
    displayName: remote?.displayName ?? fallback?.displayName,
    avatarId: remote?.avatarId ?? fallback?.avatarId,
    role: remote?.role ?? fallback?.role,
  });
}

async function readLocalAccount(): Promise<LocalAccount | null> {
  if (!allowsLocalAuthFallback()) return null;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return normalizeAccount(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

async function writeLocalAccount(account: LocalAccount): Promise<void> {
  if (!allowsLocalAuthFallback()) return;
  await AsyncStorage.setItem(KEY, JSON.stringify(account));
}

function applyDeveloperUnlock(account?: LocalAccount | null): void {
  setUnlockAllChapters(canAccessDeveloperTools(account));
}

async function loadAccountOnce(): Promise<LocalAccount | null> {
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
      const local = allowsLocalAuthFallback() ? await readLocalAccount() : null;
      const fallbackRole = isDeveloperEmail(user.email) ? 'developer' : local?.role;
      const account = await accountFromSessionUser(user, {
        displayName: local?.displayName,
        avatarId: local?.avatarId,
        role: fallbackRole,
      });
      if (allowsLocalAuthFallback()) {
        await writeLocalAccount(account);
      }
      if (account.role === 'developer') {
        void persistRemoteProfile(user.id, account.displayName, account.avatarId, account.role);
      }
      void hydrateLearnerIfNeeded(user.id);
      applyDeveloperUnlock(account);
      return account;
    } catch {
      if (isDevBuild()) {
        const fallback = await readLocalAccount();
        applyDeveloperUnlock(fallback);
        return fallback;
      }
      applyDeveloperUnlock(null);
      return null;
    }
  }
  if (!allowsLocalAuthFallback()) {
    applyDeveloperUnlock(null);
    return null;
  }
  const local = await readLocalAccount();
  applyDeveloperUnlock(local);
  return local;
}

/** Coalesce concurrent account reads (root layout + tab focus effects share one in-flight load). */
export async function getAccount(): Promise<LocalAccount | null> {
  if (!accountLoadPromise) {
    accountLoadPromise = loadAccountOnce().finally(() => {
      accountLoadPromise = null;
    });
  }
  return accountLoadPromise;
}

/** Local-only cache (tests + development fallback). Prefer signUpWithPassword / signInWithPassword. */
export async function saveAccount(input: SaveAccountInput): Promise<LocalAccount> {
  if (!allowsLocalAuthFallback()) {
    throw new Error(AUTH_CONFIG_MESSAGE);
  }
  const email = input.email.trim();
  const displayName = input.displayName.trim();
  if (!email || !displayName) {
    throw new Error('Display name and email are required.');
  }

  const existing = await readLocalAccount();
  const role: AccountRole =
    isDeveloperEmail(email) || input.role === 'developer' || input.role === 'admin'
      ? (input.role === 'admin' ? 'admin' : 'developer')
      : input.role ?? existing?.role ?? 'learner';
  const account: LocalAccount = {
    email,
    displayName,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    role,
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
  const role = patch.role ?? current.role;
  if (!displayName) throw new Error('Display name is required.');
  if (!isAvatarId(avatarId)) throw new Error('Choose a profile picture.');

  const account: LocalAccount = { ...current, displayName, avatarId, role };
  if (allowsLocalAuthFallback()) {
    await writeLocalAccount(account);
  }

  if (isSupabaseConfigured()) {
    try {
      const { data } = await getSupabase().auth.getUser();
      const userId = data.user?.id;
      if (userId) await persistRemoteProfile(userId, displayName, avatarId, role);
    } catch {
      /* local cache still saved */
    }
  }
  applyDeveloperUnlock(account);
  return account;
}

export function getAuthRedirectUrl(): string | undefined {
  if (process.env.EXPO_PUBLIC_SITE_URL?.trim()) {
    return process.env.EXPO_PUBLIC_SITE_URL.trim();
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return undefined;
}

export async function signUpWithPassword(input: PasswordAuthInput): Promise<LocalAccount> {
  requireSupabaseForAuth();
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
  const emailRedirectTo = getAuthRedirectUrl();
  const fallbackRole = isDeveloperEmail(email) ? 'developer' : undefined;
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        avatar_id: avatarId,
        ...(fallbackRole ? { role: fallbackRole } : {}),
      },
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
    },
  });
  if (error) throw new Error(error.message);
  if (!data.session?.user) {
    throw new Error('Check your email to confirm your account, then sign in.');
  }

  const account = await accountFromSessionUser(data.session.user, {
    displayName,
    avatarId,
    role: fallbackRole,
  });
  if (allowsLocalAuthFallback()) {
    await writeLocalAccount(account);
  }
  await persistRemoteProfile(data.session.user.id, displayName, avatarId, account.role);
  await hydrateLearnerIfNeeded(data.session.user.id);
  applyDeveloperUnlock(account);
  return account;
}

export async function signInWithPassword(input: PasswordAuthInput): Promise<LocalAccount> {
  requireSupabaseForAuth();
  const email = input.email.trim();
  const password = input.password;
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }
  if (!isSupabaseConfigured()) {
    const existing = await readLocalAccount();
    if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
      applyDeveloperUnlock(existing);
      return existing;
    }
    throw new Error(AUTH_CONFIG_MESSAGE);
  }

  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const user = data.session?.user ?? data.user;
  if (!user?.email) throw new Error('Sign in failed.');
  const local = allowsLocalAuthFallback() ? await readLocalAccount() : null;
  const fallbackRole = isDeveloperEmail(user.email) ? 'developer' : local?.role;
  const account = await accountFromSessionUser(user, {
    displayName: local?.displayName,
    avatarId: local?.avatarId,
    role: fallbackRole,
  });
  if (allowsLocalAuthFallback()) {
    await writeLocalAccount(account);
  }
  if (account.role === 'developer') {
    void persistRemoteProfile(user.id, account.displayName, account.avatarId, account.role);
  }
  await hydrateLearnerIfNeeded(user.id);
  applyDeveloperUnlock(account);
  return account;
}

export async function signOutAccount(): Promise<void> {
  await clearAccount();
}

export async function clearAccount(): Promise<void> {
  accountLoadPromise = null;
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

const REMEMBERED_EMAIL_KEY = 'storia:remembered-email:v1';
const REMEMBER_ME_KEY = 'storia:remember-me:v1';

export async function getRememberedEmail(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(REMEMBERED_EMAIL_KEY)) ?? '';
  } catch {
    return '';
  }
}

export async function isRememberMeEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export async function saveRememberedEmail(email: string, remember: boolean): Promise<void> {
  try {
    if (remember && email.trim()) {
      await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
      await AsyncStorage.setItem(REMEMBER_ME_KEY, 'false');
    }
  } catch {
    /* ignore storage errors */
  }
}
