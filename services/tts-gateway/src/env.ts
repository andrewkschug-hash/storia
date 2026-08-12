import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function envPath(): string {
  return join(process.cwd(), '.env');
}

/** Load services/tts-gateway/.env into process.env without overriding real env vars. */
export function loadGatewayEnv(): void {
  const file = envPath();
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = value;
    }
  }
}

export function upsertEnvValues(updates: Record<string, string>): void {
  const file = envPath();
  const existing = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const lines = existing.length > 0 ? existing.split(/\r?\n/) : [];
  const seen = new Set<string>();

  const next = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) return line;
    const key = trimmed.slice(0, eq).trim();
    if (updates[key] == null) return line;
    seen.add(key);
    return `${key}=${updates[key]}`;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) next.push(`${key}=${value}`);
    process.env[key] = value;
  }

  writeFileSync(file, `${next.join('\n').replace(/\n+$/, '')}\n`, 'utf8');
}

/** Non-secret hint so Voice Lab can confirm which key the gateway loaded. */
export function apiKeyHint(key: string | undefined): string | null {
  if (!key || key.length < 12) return null;
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

export function providerConfigured(
  id: 'elevenlabs' | 'azure' | 'google',
  env: NodeJS.Dict<string | undefined> = process.env,
): boolean {
  if (id === 'elevenlabs') return Boolean(env.ELEVENLABS_API_KEY);
  if (id === 'azure') return Boolean(env.AZURE_SPEECH_KEY && env.AZURE_SPEECH_REGION);
  return Boolean(env.GOOGLE_TTS_API_KEY);
}
