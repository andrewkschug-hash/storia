import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearTranslationCache,
  decodeHtmlEntities,
  translateText,
} from '@/src/reader/translationService';

describe('translationService', () => {
  beforeEach(() => {
    clearTranslationCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearTranslationCache();
    vi.restoreAllMocks();
  });

  describe('decodeHtmlEntities', () => {
    it('decodes single and double quotes', () => {
      expect(decodeHtmlEntities('Don&#39;t worry &quot;friend&quot;')).toBe(
        'Don\'t worry "friend"',
      );
    });

    it('decodes ampersands and angle brackets', () => {
      expect(decodeHtmlEntities('A &amp; B &lt; C &gt; D')).toBe('A & B < C > D');
    });

    it('decodes numeric entities', () => {
      expect(decodeHtmlEntities('Caf&#233;')).toBe('Café');
    });
  });

  describe('translateText', () => {
    it('returns empty translation for empty or whitespace text', async () => {
      const result = await translateText({
        text: '   ',
        from: 'en',
        to: 'it',
      });

      expect(result.translatedText).toBe('');
      expect(result.fromCache).toBe(true);
    });

    it('fetches translation from API and cleans entities', async () => {
      const mockResponse = {
        responseData: {
          translatedText: 'Luca va al bar.',
          match: 0.85,
        },
        responseStatus: 200,
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);

      const result = await translateText({
        text: 'Luca goes to the bar.',
        from: 'en',
        to: 'it',
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('langpair=en|it'),
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result.translatedText).toBe('Luca va al bar.');
      expect(result.fromCache).toBe(false);
    });

    it('uses in-memory cache for repeated translations', async () => {
      const mockResponse = {
        responseData: {
          translatedText: 'Luca va al bar.',
          match: 0.85,
        },
        responseStatus: 200,
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as unknown as Response);

      const res1 = await translateText({
        text: 'Luca goes to the bar.',
        from: 'en',
        to: 'it',
      });

      const res2 = await translateText({
        text: 'Luca goes to the bar.',
        from: 'en',
        to: 'it',
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(res1.translatedText).toBe('Luca va al bar.');
      expect(res2.translatedText).toBe('Luca va al bar.');
      expect(res2.fromCache).toBe(true);
    });

    it('throws a descriptive error when API returns non-OK status', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 503,
      } as unknown as Response);

      await expect(
        translateText({
          text: 'Hello',
          from: 'en',
          to: 'it',
        }),
      ).rejects.toThrow('Translation service returned HTTP 503');
    });
  });
});
