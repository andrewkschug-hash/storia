import { describe, expect, it } from 'vitest';
import { resolvePromptSemantics } from '../promptFormatter';

describe('resolvePromptSemantics', () => {
  it('returns explicit promptDirective and sayEn when provided', () => {
    const result = resolvePromptSemantics({
      promptDirective: 'Ask Sofia:',
      sayEn: 'What is wrong?',
      objectiveEn: 'Ask Sofia what is wrong.',
    });
    expect(result.promptDirective).toBe('Ask Sofia:');
    expect(result.sayEn).toBe('What is wrong?');
    expect(result.objectiveEn).toBe('Ask Sofia what is wrong.');
  });

  it('parses "Ask Sofia what is wrong." correctly as fallback', () => {
    const result = resolvePromptSemantics({
      objectiveEn: 'Ask Sofia what is wrong.',
    });
    expect(result.promptDirective).toBe('Ask Sofia:');
    expect(result.sayEn).toBe('What is wrong?');
  });

  it('parses "Tell Sofia that we can help." correctly as fallback', () => {
    const result = resolvePromptSemantics({
      objectiveEn: 'Tell Sofia that we can help.',
    });
    expect(result.promptDirective).toBe('Tell Sofia:');
    expect(result.sayEn).toBe('We can help.');
  });

  it('parses "Say that you want to buy the ticket." correctly as fallback', () => {
    const result = resolvePromptSemantics({
      objectiveEn: 'Say that you want to buy the ticket.',
    });
    expect(result.sayEn).toBe('I want to buy the ticket.');
  });

  it('parses "Agree and say let\'s go together." correctly as fallback', () => {
    const result = resolvePromptSemantics({
      objectiveEn: "Agree and say let's go together.",
    });
    expect(result.promptDirective).toBe('Agree:');
    expect(result.sayEn).toBe("Let's go together.");
  });

  it('handles custom partnerName in fallback', () => {
    const result = resolvePromptSemantics(
      { objectiveEn: 'Non-standard prompt text.' },
      'Marco',
    );
    expect(result.promptDirective).toBe('Respond to Marco:');
    expect(result.sayEn).toBe('Non-standard prompt text.');
  });
});
