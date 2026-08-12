import AsyncStorage from '@react-native-async-storage/async-storage';

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

export async function getAccount(): Promise<LocalAccount | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return normalizeAccount(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export async function saveAccount(input: SaveAccountInput): Promise<LocalAccount> {
  const email = input.email.trim();
  const displayName = input.displayName.trim();
  if (!email || !displayName) {
    throw new Error('Display name and email are required.');
  }

  const existing = await getAccount();
  const account: LocalAccount = {
    email,
    displayName,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    role: roleForEmail(email),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(account));
  return account;
}

export async function clearAccount(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

/** Async convenience for screens that only need the boolean. */
export async function hasLocalAccount(): Promise<boolean> {
  return (await getAccount()) !== null;
}
