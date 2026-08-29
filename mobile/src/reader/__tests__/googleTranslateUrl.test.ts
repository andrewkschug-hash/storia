import { describe, expect, it } from 'vitest';
import {
  MAX_TRANSLATION_INPUT_LENGTH,
  buildGoogleTranslateUrl,
} from '@/src/reader/googleTranslateUrl';

describe('buildGoogleTranslateUrl', () => {
  it('encodes standard English sentences to Italian by default', () => {
    const url = buildGoogleTranslateUrl('Luca goes to the bar.');
    expect(url).toBe(
      'https://translate.google.com/?sl=en&tl=it&text=Luca%20goes%20to%20the%20bar.&op=translate',
    );
  });

  it('supports Italian to English when specified', () => {
    const url = buildGoogleTranslateUrl('Ci siamo visti ieri.', 'it', 'en');
    expect(url).toBe(
      'https://translate.google.com/?sl=it&tl=en&text=Ci%20siamo%20visti%20ieri.&op=translate',
    );
  });

  it('safely encodes Italian accented characters', () => {
    const url = buildGoogleTranslateUrl(
      'Perché non vieni alla città? È un piacere.',
      'it',
      'en',
    );
    expect(url).toContain('sl=it&tl=en');
    expect(url).toContain('op=translate');
    // Ensure properly URL-encoded accents
    expect(url).toContain('Perch%C3%A9');
    expect(url).toContain('citt%C3%A0%3F');
    expect(url).toContain('%C3%88');
  });

  it('safely encodes contractions, apostrophes, and quotes', () => {
    const text = 'L\'ho già visto e "non c\'era" nessuno.';
    const url = buildGoogleTranslateUrl(text, 'it', 'en');
    expect(url).toContain('L\'ho%20gi%C3%A0%20visto');
    expect(url).toContain('%22non%20c\'era%22');
  });

  it('safely encodes ampersands and question marks', () => {
    const text = 'Bread & cheese?';
    const url = buildGoogleTranslateUrl(text, 'en', 'it');
    expect(url).toContain('Bread%20%26%20cheese%3F');
  });

  it('trims leading and trailing whitespace and preserves internal newlines', () => {
    const text = '  \nHello world!\nHow are you?  \n';
    const url = buildGoogleTranslateUrl(text, 'en', 'it');
    expect(url).toBe(
      'https://translate.google.com/?sl=en&tl=it&text=Hello%20world!%0AHow%20are%20you%3F&op=translate',
    );
  });

  it('enforces maximum length cap of 500 characters', () => {
    const longText = 'a'.repeat(600);
    const url = buildGoogleTranslateUrl(longText, 'en', 'it');
    const expected = 'a'.repeat(MAX_TRANSLATION_INPUT_LENGTH);
    expect(url).toBe(
      `https://translate.google.com/?sl=en&tl=it&text=${expected}&op=translate`,
    );
  });
});

