/** True only in Metro / development builds or localhost in browser. Production/release builds are false. */
export function isDevBuild(): boolean {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return true;
  }
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local')) {
      return true;
    }
  }
  return false;
}

export function isProductionBuild(): boolean {
  return !isDevBuild();
}
