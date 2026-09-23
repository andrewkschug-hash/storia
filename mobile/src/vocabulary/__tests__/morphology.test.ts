import { describe, expect, it } from 'vitest';
import { resolveWordGrammar } from '../morphology';

describe('resolveWordGrammar', () => {
  it('identifies masculine singular articles', () => {
    const res = resolveWordGrammar('il', 'il', { partOfSpeech: 'article' });
    expect(res.gender).toBe('masculine');
    expect(res.number).toBe('singular');
    expect(res.grammarTag).toBe('Article · Masc. sing.');
  });

  it('identifies feminine plural articles', () => {
    const res = resolveWordGrammar('le', 'la', { partOfSpeech: 'article' });
    expect(res.gender).toBe('feminine');
    expect(res.number).toBe('plural');
    expect(res.grammarTag).toBe('Article · Fem. plur.');
  });

  it('infers masculine singular noun ending in -o', () => {
    const res = resolveWordGrammar('gatto', 'gatto', { partOfSpeech: 'noun' });
    expect(res.gender).toBe('masculine');
    expect(res.number).toBe('singular');
    expect(res.grammarTag).toBe('Noun · Masculine, Singular');
  });

  it('infers feminine singular noun ending in -a', () => {
    const res = resolveWordGrammar('casa', 'casa', { partOfSpeech: 'noun' });
    expect(res.gender).toBe('feminine');
    expect(res.number).toBe('singular');
    expect(res.grammarTag).toBe('Noun · Feminine, Singular');
  });

  it('infers masculine plural noun ending in -i', () => {
    const res = resolveWordGrammar('ragazzi', 'ragazzo', { partOfSpeech: 'noun' });
    expect(res.gender).toBe('masculine');
    expect(res.number).toBe('plural');
    expect(res.grammarTag).toBe('Noun · Masculine, Plural');
  });

  it('infers feminine plural noun ending in -e with lemma ending in -a', () => {
    const res = resolveWordGrammar('case', 'casa', { partOfSpeech: 'noun' });
    expect(res.gender).toBe('feminine');
    expect(res.number).toBe('plural');
    expect(res.grammarTag).toBe('Noun · Feminine, Plural');
  });

  it('respects entry gender for nouns ending in -e', () => {
    const res = resolveWordGrammar('notte', 'notte', { partOfSpeech: 'noun', gender: 'feminine' });
    expect(res.gender).toBe('feminine');
    expect(res.number).toBe('singular');
    expect(res.grammarTag).toBe('Noun · Feminine, Singular');
  });

  it('formats verbs simply as Verb', () => {
    const res = resolveWordGrammar('parla', 'parlare', { partOfSpeech: 'verb' });
    expect(res.partOfSpeech).toBe('Verb');
    expect(res.grammarTag).toBe('Verb');
  });

  it('formats adverbs and prepositions', () => {
    const adv = resolveWordGrammar('sempre', 'sempre', { partOfSpeech: 'adverb' });
    expect(adv.grammarTag).toBe('Adverb');
    const prep = resolveWordGrammar('con', 'con', { partOfSpeech: 'preposition' });
    expect(prep.grammarTag).toBe('Preposition');
  });
});
