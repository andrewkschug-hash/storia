import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
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

/** Windows: %APPDATA%\gcloud\application_default_credentials.json */
export function googleAdcPath(env: NodeJS.Dict<string | undefined> = process.env): string {
  if (env.GOOGLE_APPLICATION_CREDENTIALS) return env.GOOGLE_APPLICATION_CREDENTIALS;
  if (process.platform === 'win32') {
    return join(env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'gcloud', 'application_default_credentials.json');
  }
  return join(homedir(), '.config', 'gcloud', 'application_default_credentials.json');
}

export function googleAdcAvailable(env: NodeJS.Dict<string | undefined> = process.env): boolean {
  try {
    return existsSync(googleAdcPath(env));
  } catch {
    return false;
  }
}

type GoogleAdcFile = {
  type?: string;
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  quota_project_id?: string;
};

/** Refresh an access token from gcloud Application Default Credentials (user login). */
export async function googleAdcAccessToken(
  env: NodeJS.Dict<string | undefined> = process.env,
): Promise<string> {
  const path = googleAdcPath(env);
  if (!existsSync(path)) {
    throw new Error(
      'Google Application Default Credentials not found. Run gcloud auth application-default login.',
    );
  }
  const adc = JSON.parse(readFileSync(path, 'utf8')) as GoogleAdcFile;
  if (adc.type !== 'authorized_user' || !adc.client_id || !adc.client_secret || !adc.refresh_token) {
    throw new Error(
      'Unsupported Google ADC file. Run gcloud auth application-default login (user credentials).',
    );
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: adc.refresh_token,
      client_id: adc.client_id,
      client_secret: adc.client_secret,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google ADC token refresh failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('Google ADC token refresh returned no access_token.');
  }
  return data.access_token;
}

export function googleQuotaProject(env: NodeJS.Dict<string | undefined> = process.env): string | undefined {
  const fromEnv = (env.GOOGLE_CLOUD_PROJECT || env.GCLOUD_PROJECT || '').trim();
  if (fromEnv) return fromEnv;
  try {
    const path = googleAdcPath(env);
    if (!existsSync(path)) return undefined;
    const adc = JSON.parse(readFileSync(path, 'utf8')) as GoogleAdcFile;
    return adc.quota_project_id?.trim() || undefined;
  } catch {
    return undefined;
  }
}

export function googleTtsConfigured(env: NodeJS.Dict<string | undefined> = process.env): boolean {
  if (env.GOOGLE_TTS_API_KEY) return true;
  if (env.GOOGLE_APPLICATION_CREDENTIALS || env.GOOGLE_CLOUD_PROJECT || env.GOOGLE_TTS_USE_ADC === 'true') {
    return true;
  }
  return env === process.env && googleAdcAvailable(env);
}

export function providerConfigured(
  id: 'elevenlabs' | 'azure' | 'google',
  env: NodeJS.Dict<string | undefined> = process.env,
): boolean {
  if (id === 'elevenlabs') return Boolean(env.ELEVENLABS_API_KEY);
  if (id === 'azure') return Boolean(env.AZURE_SPEECH_KEY && env.AZURE_SPEECH_REGION);
  return googleTtsConfigured(env);
}
