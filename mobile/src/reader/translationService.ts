export type TranslationLanguage = 'en' | 'it';

export interface TranslationRequest {
  text: string;
  from: TranslationLanguage;
  to: TranslationLanguage;
  signal?: AbortSignal;
}

export interface TranslationResult {
  translatedText: string;
  from: TranslationLanguage;
  to: TranslationLanguage;
  matchScore?: number;
  fromCache?: boolean;
}

const translationCache = new Map<string, string>();

/** Decode common HTML entities that translation APIs might return. */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function getCacheKey(text: string, from: TranslationLanguage, to: TranslationLanguage): string {
  return `${from}:${to}:${text.trim().toLowerCase()}`;
}

export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Translates text between English and Italian using a fast client-side API.
 * Uses an in-memory cache to ensure instant responses for repeated phrases.
 */
export async function translateText({
  text,
  from,
  to,
  signal,
}: TranslationRequest): Promise<TranslationResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      translatedText: '',
      from,
      to,
      matchScore: 1,
      fromCache: true,
    };
  }

  const cacheKey = getCacheKey(trimmed, from, to);
  const cached = translationCache.get(cacheKey);
  if (cached !== undefined) {
    return {
      translatedText: cached,
      from,
      to,
      matchScore: 1,
      fromCache: true,
    };
  }

  const langpair = `${from}|${to}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${langpair}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Translation service returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    responseData?: {
      translatedText?: string;
      match?: number;
    };
    responseStatus?: number | string;
    responseDetails?: string;
  };

  const rawTranslation = data.responseData?.translatedText;
  if (!rawTranslation) {
    throw new Error(data.responseDetails || 'No translation received from service');
  }

  const decoded = decodeHtmlEntities(rawTranslation).trim();

  // Cache successful translation
  translationCache.set(cacheKey, decoded);

  return {
    translatedText: decoded,
    from,
    to,
    matchScore: typeof data.responseData?.match === 'number' ? data.responseData.match : undefined,
    fromCache: false,
  };
}
