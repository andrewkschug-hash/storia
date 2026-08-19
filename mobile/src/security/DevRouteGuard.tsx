import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { isDevBuild } from '@/src/security/buildMode';

/** Hard block for developer-only Expo routes in production builds. */
export function DevRouteGuard({ children }: { children: ReactNode }) {
  if (!isDevBuild()) {
    return <Redirect href="/" />;
  }
  return <>{children}</>;
}
