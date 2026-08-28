/** Pure STT config — safe for vitest (no React Native imports). */

export const ITALIAN_SPEECH_LOCALE = 'it-IT';
/** Hard stop so a stuck listen cannot run forever. */
export const SPEECH_MAX_MS = 7000;

export type SpeechUnavailableReason =
  | 'unsupported'
  | 'permission_denied'
  | 'blocked'
  | 'missing_module'
  | 'unavailable'
  | 'on_device_unsupported'
  | 'no_speech'
  | 'web'; // legacy alias for unsupported web browser

export function speechUnavailableMessage(reason: SpeechUnavailableReason): string {
  switch (reason) {
    case 'unsupported':
    case 'web':
      return 'Voice input isn’t available in this browser. You can type your answer instead.';
    case 'permission_denied':
    case 'blocked':
      return 'Microphone access is turned off. Allow microphone access in your browser settings to use Speak.';
    case 'no_speech':
      return 'We couldn’t hear that. Try again or type your answer.';
    case 'missing_module':
      return 'Speech isn’t available in this build. Use a development build.';
    case 'on_device_unsupported':
      return 'On-device Italian speech isn’t supported on this device.';
    default:
      return 'Speech recognition isn’t available right now. You can type your answer below.';
  }
}
