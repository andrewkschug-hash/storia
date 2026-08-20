import { useCallback, useEffect, useRef } from 'react';

/**
 * Ignores stale async refresh results after tab blur/unmount or a newer refresh starts.
 * Prevents out-of-order setState from slow storage reads blocking perceived navigation.
 */
export function useRefreshGuard(scope: string) {
  const generation = useRef(0);

  useEffect(() => {
    generation.current += 1;
    return () => {
      generation.current += 1;
    };
  }, [scope]);

  const isStale = useCallback((token: number) => token !== generation.current, []);

  const run = useCallback(
    async <T>(task: (guard: { isStale: () => boolean }) => Promise<T>): Promise<T | undefined> => {
      const token = generation.current;
      const result = await task({
        isStale: () => isStale(token),
      });
      if (isStale(token)) return undefined;
      return result;
    },
    [isStale],
  );

  return { run };
}
