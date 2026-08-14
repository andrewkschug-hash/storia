export function getSupabaseUrl(): string {
  return (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
}

export function getSupabaseAnonKey(): string {
  return (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
