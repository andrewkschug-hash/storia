import { providerConfigured } from './env';
import type { TTSProviderId } from './types';

const PROVIDER_LABEL: Record<TTSProviderId, string> = {
  elevenlabs: 'ElevenLabs',
  azure: 'Azure',
  google: 'Google',
};

export function gatewayStatus(
  env: NodeJS.Dict<string | undefined> = process.env,
  active: TTSProviderId = (env.TTS_PROVIDER ?? 'elevenlabs') as TTSProviderId,
) {
  return {
    ok: true,
    connected: true,
    provider: active,
    providers: {
      elevenlabs: {
        id: 'elevenlabs' as const,
        label: PROVIDER_LABEL.elevenlabs,
        configured: providerConfigured('elevenlabs', env),
      },
      azure: {
        id: 'azure' as const,
        label: PROVIDER_LABEL.azure,
        configured: providerConfigured('azure', env),
      },
      google: {
        id: 'google' as const,
        label: PROVIDER_LABEL.google,
        configured: providerConfigured('google', env),
        auth: env.GOOGLE_TTS_API_KEY
          ? 'api-key'
          : providerConfigured('google', env)
            ? 'adc'
            : null,
      },
    },
  };
}
