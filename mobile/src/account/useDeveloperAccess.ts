import { useEffect, useState } from 'react';

import { canAccessDeveloperTools, getAccount, type LocalAccount } from '@/src/account/storage';

type DeveloperAccessState = {
  loading: boolean;
  allowed: boolean;
  account: LocalAccount | null;
};

/**
 * Loads the local account and reports whether developer tooling should be shown.
 * Prefer `__DEV__ || isDeveloperAccount(account)` via `canAccessDeveloperTools`.
 */
export function useDeveloperAccess(): DeveloperAccessState {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<LocalAccount | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await getAccount();
      if (cancelled) return;
      setAccount(next);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading,
    allowed: canAccessDeveloperTools(account),
    account,
  };
}
