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
  signUpWithPassword,
  type AccountRole,
  type LocalAccount,
  type PasswordAuthInput,
  type SaveAccountInput,
} from '@/src/account/storage';
export { useDeveloperAccess } from '@/src/account/useDeveloperAccess';
