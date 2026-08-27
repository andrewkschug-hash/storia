export {
  AVATAR_PRESETS,
  defaultAvatarIdForEmail,
  getAvatarPreset,
  isAvatarId,
  type AvatarId,
  type AvatarPreset,
} from '@/src/account/avatars';
export {
  canAccessDeveloperTools,
  clearAccount,
  getAccount,
  getRememberedEmail,
  hasLocalAccount,
  isRememberMeEnabled,
  saveAccount,
  saveRememberedEmail,
  signInWithPassword,
  signOutAccount,
  signUpWithPassword,
  updateAccountProfile,
  type AccountRole,
  type LocalAccount,
  type PasswordAuthInput,
  type SaveAccountInput,
  type UpdateProfileInput,
} from '@/src/account/storage';
export { useDeveloperAccess } from '@/src/account/useDeveloperAccess';