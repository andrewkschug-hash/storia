/**
 * Development-only navigation lifecycle logging.
 * Helps trace where tab switches stall (click → focus → mount → async init).
 */

const PREFIX = '[Navigation]';

function enabled(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

function stamp(): string {
  return new Date().toISOString().slice(11, 23);
}

export function navLog(message: string, detail?: Record<string, unknown>): void {
  if (!enabled()) return;
  if (detail) {
    console.log(`${PREFIX} ${stamp()} ${message}`, detail);
    return;
  }
  console.log(`${PREFIX} ${stamp()} ${message}`);
}

export function navError(message: string, error: unknown): void {
  if (!enabled()) return;
  console.error(`${PREFIX} ${stamp()} ${message}`, error);
}

export function navAsync<T>(
  label: string,
  operation: () => Promise<T>,
): Promise<T> {
  if (!enabled()) return operation();
  navLog(`${label} started`);
  const started = performance.now();
  return operation()
    .then((result) => {
      navLog(`${label} completed`, { ms: Math.round(performance.now() - started) });
      return result;
    })
    .catch((error) => {
      navError(`${label} failed`, error);
      throw error;
    });
}
