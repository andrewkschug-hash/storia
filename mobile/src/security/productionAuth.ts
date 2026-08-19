import { isSupabaseConfigured } from '@/src/lib/supabaseEnv';

import { isDevBuild } from '@/src/security/buildMode';

/** Shown when auth is unavailable in production — no secret values. */
export const AUTH_UNAVAILABLE_MESSAGE =
  'Sign-in is temporarily unavailable. Please try again later.';

export const AUTH_CONFIG_MESSAGE =
  'This build is not configured for accounts. Contact support if this persists.';

/** Development-only local account fallback when Supabase env vars are absent. */
export function allowsLocalAuthFallback(): boolean {
  return isDevBuild() && !isSupabaseConfigured();
}

/** Production and misconfigured release builds must not authenticate locally. */
export function requireSupabaseForAuth(): void {
  if (isSupabaseConfigured()) return;
  if (isDevBuild()) return;
  throw new Error(AUTH_CONFIG_MESSAGE);
}
