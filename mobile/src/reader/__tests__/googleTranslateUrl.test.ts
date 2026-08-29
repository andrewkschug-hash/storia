import { describe, expect, it } from 'vitest';
import {
  MAX_TRANSLATION_INPUT_LENGTH,
  buildGoogleTranslateUrl,
} from '@/src/reader/googleTranslateUrl';

describe('buildGoogleTranslateUrl', () => {
  it('encodes standard Italian sentences correctly', () => {
    const url = buildGoogleTranslateUrl('Ci siamo visti ieri.');
    expect(url).toBe(
      'https://translate.google.com/?sl=it&tl=en&text=Ci%20siamo%20visti%20ieri.&op=translate',
    );
  });

  it('safely encodes Italian accented characters', () => {
    const url = buildGoogleTranslateUrl('Perché non vieni alla città? È un piacere.');
    expect(url).toContain('sl=it&tl=en');
    expect(url).toContain('op=translate');
    // Ensure properly URL-encoded accents
    expect(url).toContain('Perch%C3%A9');
    expect(url).toContain('citt%C3%A0%3F');
    expect(url).toContain('%C3%88');
  });

  it('safely encodes contractions, apostrophes, and quotes', () => {
    const text = 'L\'ho già visto e "non c\'era" nessuno.';
    const url = buildGoogleTranslateUrl(text);
    expect(url).toContain('L\'ho%20gi%C3%A0%20visto');
    expect(url).toContain('%22non%20c\'era%22');
  });

  it('safely encodes ampersands and question marks', () => {
    const text = 'Pane & formaggio?';
    const url = buildGoogleTranslateUrl(text);
    expect(url).toContain('Pane%20%26%20formaggio%3F');
  });

  it('trims leading and trailing whitespace and preserves internal newlines', () => {
    const text = '  \nCiao mondo!\nCome stai?  \n';
    const url = buildGoogleTranslateUrl(text);
    expect(url).toBe(
      'https://translate.google.com/?sl=it&tl=en&text=Ciao%20mondo!%0ACome%20stai%3F&op=translate',
    );
  });

  it('enforces maximum length cap of 500 characters', () => {
    const longText = 'a'.repeat(600);
    const url = buildGoogleTranslateUrl(longText);
    const expected = 'a'.repeat(MAX_TRANSLATION_INPUT_LENGTH);
    expect(url).toBe(
      `https://translate.google.com/?sl=it&tl=en&text=${expected}&op=translate`,
    );
  });
});
