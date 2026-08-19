const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1']);

/** Authoring (setup/generate/batch) is allowed only on the default local gateway bind. */
export function isAuthoringEnabled(env: NodeJS.Dict<string | undefined> = process.env): boolean {
  if (env.TTS_GATEWAY_AUTHORING === 'false') return false;
  const host = (env.TTS_GATEWAY_HOST ?? '127.0.0.1').trim().toLowerCase();
  return LOCAL_HOSTS.has(host);
}

export function authoringDisabledMessage(): string {
  return 'TTS authoring is disabled in this gateway configuration.';
}
