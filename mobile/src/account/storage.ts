import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@supabase/supabase-js';

import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

const KEY = 'storia.localAccount';

export const DEVELOPER_EMAIL = 'andrewkschug@gmail.com';

export type AccountRole = 'developer' | 'learner';

export type LocalAccount = {
  email: string;
  displayName: string;
  createdAt: string;
  role: AccountRole;
};

export type SaveAccountInput = {
  email: string;
  displayName: string;
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
  };
}

function displayNameFromUser(user: User, fallback?: string): string {
  const meta = user.user_metadata?.display_name;
  if (typeof meta === 'string' && meta.trim()) return meta.trim();
  if (fallback?.trim()) return fallback.trim();
  const local = user.email?.split('@')[0];
  return local?.trim() || 'Learner';
}

function accountFromUser(user: User, fallbackName?: string): LocalAccount {
  const email = (user.email ?? '').trim();
  return {
    email,
    displayName: displayNameFromUser(user, fallbackName),
    createdAt: user.created_at ?? new Date().toISOString(),
    role: roleForEmail(email),
  };
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

export async function getAccount(): Promise<LocalAccount | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await getSupabase().auth.getSession();
      if (error) throw error;
      const user = data.session?.user;
      if (!user?.email) {
        await AsyncStorage.removeItem(KEY);
        return null;
      }
      const account = accountFromUser(user);
      await writeLocalAccount(account);
      return account;
    } catch {
      return readLocalAccount();
    }
  }
  return readLocalAccount();
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
  };
  await writeLocalAccount(account);
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

  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw new Error(error.message);
  if (!data.session?.user) {
    throw new Error('Check your email to confirm your account, then sign in.');
  }

  const account = accountFromUser(data.session.user, displayName);
  await writeLocalAccount(account);
  try {
    await getSupabase().from('storia_profiles').upsert({
      id: data.session.user.id,
      display_name: displayName,
    });
  } catch {
    /* profile table is optional until the Storia migration is applied */
  }
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
  const account = accountFromUser(user);
  await writeLocalAccount(account);
  return account;
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
}

/** Async convenience for screens that only need the boolean. */
export async function hasLocalAccount(): Promise<boolean> {
  return (await getAccount()) !== null;
}
