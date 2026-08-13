import { describe, expect, it } from 'vitest';

import { normalizeProductionText } from '@/src/production/normalize';

describe('normalizeProductionText', () => {
  it('applies NFKC, lowercase, trim, and collapsed whitespace', () => {
    expect(normalizeProductionText('  Ho   FAME  ')).toBe('ho fame');
  });

  it('strips wrapping quotes and boundary punctuation', () => {
    expect(normalizeProductionText('"Buongiorno."')).toBe('buongiorno');
    expect(normalizeProductionText('Come stai?!')).toBe('come stai');
  });

  it('unifies apostrophe unicode without dropping è', () => {
    expect(normalizeProductionText("C'è una porta.")).toBe("c'è una porta");
    expect(normalizeProductionText('C’è una porta.')).toBe("c'è una porta");
    expect(normalizeProductionText("Dov'è la valigia?")).toBe("dov'è la valigia");
  });

  it('restores missing grave after apostrophe only', () => {
    expect(normalizeProductionText("c'e")).toBe("c'è");
    expect(normalizeProductionText("dov'e la valigia")).toBe("dov'è la valigia");
    expect(normalizeProductionText("c'e", { restoreApostropheE: false })).toBe("c'e");
  });

  it('does not collapse è/e, ho/ha, or non', () => {
    expect(normalizeProductionText('È a Roma.')).toBe('è a roma');
    expect(normalizeProductionText('E a Roma.')).toBe('e a roma');
    expect(normalizeProductionText('Ho fame.')).not.toBe(normalizeProductionText('Ha fame.'));
    expect(normalizeProductionText('Non ho fame.')).toContain('non');
  });
});
