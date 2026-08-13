export {
  AVATAR_PRESETS,
  defaultAvatarIdForEmail,
  getAvatarPreset,
  isAvatarId,
  type AvatarId,
  type AvatarPreset,
} from '@/src/account/avatars';
export {
  DEVELOPER_EMAIL,
  canAccessDeveloperTools,
  clearAccount,
  getAccount,
  hasLocalAccount,
  isDeveloperAccount,
  isDeveloperEmail,
  roleForEmail,
  saveAccount,
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
