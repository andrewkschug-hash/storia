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
  type AccountRole,
  type LocalAccount,
  type SaveAccountInput,
} from '@/src/account/storage';
export { useDeveloperAccess } from '@/src/account/useDeveloperAccess';
