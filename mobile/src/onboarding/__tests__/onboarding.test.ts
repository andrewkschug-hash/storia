import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  hasCompletedOnboarding,
  markOnboardingComplete,
  resetOnboarding,
} from '@/src/onboarding/storage';

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: async (key: string) => {
        store.delete(key);
      },
    },
  };
});

describe('onboarding gate per account', () => {
  const newbie = 'new@example.com';
  const returning = 'back@example.com';

  beforeEach(async () => {
    await resetOnboarding(newbie);
    await resetOnboarding(returning);
  });

  it('keeps signup incomplete until marked', async () => {
    expect(await hasCompletedOnboarding(newbie)).toBe(false);
    await markOnboardingComplete(newbie);
    expect(await hasCompletedOnboarding(newbie)).toBe(true);
  });

  it('does not share completion across emails', async () => {
    await markOnboardingComplete(returning);
    expect(await hasCompletedOnboarding(returning)).toBe(true);
    expect(await hasCompletedOnboarding(newbie)).toBe(false);
  });
});
