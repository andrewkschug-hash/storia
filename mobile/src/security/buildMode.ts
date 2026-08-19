/** True only in Metro / development builds. Production/release builds are false. */
export function isDevBuild(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

export function isProductionBuild(): boolean {
  return !isDevBuild();
}
