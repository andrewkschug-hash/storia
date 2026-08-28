import { describe, expect, it } from 'vitest';
import {
  NOTEBOOK_TABS,
  NOTEBOOK_TAB_CONFIG,
  NotebookTabs,
  GrammarInsightsCarousel,
  PhrasesSpotlightCarousel,
  VerbDetailCard,
} from '@/src/components/notebook';
import { NOTEBOOK_GRAMMAR_INSIGHTS, NOTEBOOK_PHRASES } from '@/src/vocabulary/notebookData';
import { NOTEBOOK_VERB_PATTERNS } from '@/src/vocabulary/notebookVerbs';

describe('Notebook components', () => {
  describe('NotebookTabs configuration', () => {
    it('defines the 4 main notebook tabs in correct order', () => {
      expect(NOTEBOOK_TABS).toEqual(['vocabulary', 'phrases', 'grammar', 'verbs']);
    });

    it('provides icons and labels for each tab', () => {
      for (const tab of NOTEBOOK_TABS) {
        const config = NOTEBOOK_TAB_CONFIG[tab];
        expect(config).toBeDefined();
        expect(config.label.length).toBeGreaterThan(0);
        expect(config.icon.length).toBeGreaterThan(0);
        expect(config.defaultSub.length).toBeGreaterThan(0);
      }
    });

    it('exports all notebook components as functions', () => {
      expect(typeof NotebookTabs).toBe('function');
      expect(typeof GrammarInsightsCarousel).toBe('function');
      expect(typeof PhrasesSpotlightCarousel).toBe('function');
      expect(typeof VerbDetailCard).toBe('function');
    });
  });

  describe('Grammar insights data integrity for carousel', () => {
    it('contains valid insight items with formulas and story examples', () => {
      expect(NOTEBOOK_GRAMMAR_INSIGHTS.length).toBeGreaterThanOrEqual(3);
      for (const insight of NOTEBOOK_GRAMMAR_INSIGHTS) {
        expect(insight.id).toBeDefined();
        expect(insight.titleIt).toBeDefined();
        expect(insight.formula).toBeDefined();
        expect(insight.exampleIt).toBeDefined();
        expect(insight.sampleChapterNumber).toBeGreaterThan(0);
      }
    });
  });

  describe('Phrases and verbs data integrity for carousels', () => {
    it('contains phrases with speaker tags and chapter numbers', () => {
      expect(NOTEBOOK_PHRASES.length).toBeGreaterThanOrEqual(9);
      for (const phrase of NOTEBOOK_PHRASES) {
        expect(phrase.speaker).toBeDefined();
        expect(phrase.textIt).toBeDefined();
        expect(phrase.textEn).toBeDefined();
        expect(phrase.chapterNumber).toBeGreaterThan(0);
      }
    });

    it('contains verb patterns with regular group and conjugation tenses', () => {
      expect(NOTEBOOK_VERB_PATTERNS.length).toBeGreaterThan(5);
      for (const verb of NOTEBOOK_VERB_PATTERNS) {
        expect(verb.infinitive).toBeDefined();
        expect(verb.root).toBeDefined();
        expect(verb.presente).toBeDefined();
        expect(verb.passatoProssimo).toBeDefined();
        expect(verb.imperfetto).toBeDefined();
      }
    });
  });
});
