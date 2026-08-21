/** Pure STT config — safe for vitest (no React Native imports). */

export const ITALIAN_SPEECH_LOCALE = 'it-IT';
/** Hard stop so a stuck listen cannot run forever. */
export const SPEECH_MAX_MS = 7000;

export type SpeechUnavailableReason =
  | 'web'
  | 'missing_module'
  | 'unavailable'
  | 'on_device_unsupported'
  | 'permission_denied';

export function speechUnavailableMessage(reason: SpeechUnavailableReason): string {
  switch (reason) {
    case 'web':
      return 'Speaking works in the iOS or Android app, not on web.';
    case 'missing_module':
      return 'Speech isn’t available in this build. Use a development build.';
    case 'on_device_unsupported':
      return 'On-device Italian speech isn’t supported on this device.';
    case 'permission_denied':
      return 'Microphone or speech permission is needed to practice aloud.';
    default:
      return 'Speech recognition isn’t available right now.';
  }
}
