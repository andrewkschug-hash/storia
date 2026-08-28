import { describe, expect, it } from 'vitest';
import {
  NOTEBOOK_TABS,
  NOTEBOOK_TAB_CONFIG,
  NotebookTabs,
  NotebookHeader,
  NotebookReviewStrip,
  NotebookToolbar,
  NotebookFilterSheet,
  NotebookEmptyState,
  WordEntry,
  VerbDetailSheet,
  PhraseEntry,
  GrammarEntry,
  GrammarDetailModal,
} from '@/src/components/notebook';
import { NOTEBOOK_GRAMMAR_INSIGHTS, NOTEBOOK_PHRASES } from '@/src/vocabulary/notebookData';
import { NOTEBOOK_VERB_PATTERNS } from '@/src/vocabulary/notebookVerbs';
import {
  CEFR_CURRICULUM_BANDS,
  filterNotebookGrammar,
  filterNotebookPhrases,
  filterNotebookWords,
  getReadingFootprint,
  groupPhrasesByChronology,
  groupWordsByChronology,
  matchesCefrBand,
} from '@/src/vocabulary/notebookSelectors';

describe('Notebook components & selectors', () => {
  describe('NotebookTabs configuration', () => {
    it('defines the 3 main notebook lenses in correct order', () => {
      expect(NOTEBOOK_TABS).toEqual(['words', 'phrases', 'grammar']);
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

    it('exports all new and updated notebook components as functions', () => {
      expect(typeof NotebookTabs).toBe('function');
      expect(typeof NotebookHeader).toBe('function');
      expect(typeof NotebookReviewStrip).toBe('function');
      expect(typeof NotebookToolbar).toBe('function');
      expect(typeof NotebookFilterSheet).toBe('function');
      expect(typeof NotebookEmptyState).toBe('function');
      expect(typeof WordEntry).toBe('function');
      expect(typeof VerbDetailSheet).toBe('function');
      expect(typeof PhraseEntry).toBe('function');
      expect(typeof GrammarEntry).toBe('function');
      expect(typeof GrammarDetailModal).toBe('function');
    });
  });

  describe('CEFR curriculum bands and selectors', () => {
    it('accurately defines curriculum chapter ranges', () => {
      expect(CEFR_CURRICULUM_BANDS.A1).toEqual({ label: 'A1 (Ch 1–20)', min: 1, max: 20, levelName: 'A1' });
      expect(CEFR_CURRICULUM_BANDS['A1+']).toEqual({ label: 'A1+ (Ch 21–24)', min: 21, max: 24, levelName: 'A1+' });
      expect(CEFR_CURRICULUM_BANDS.A2).toEqual({ label: 'A2 (Ch 25–40)', min: 25, max: 40, levelName: 'A2' });
      expect(CEFR_CURRICULUM_BANDS.B1).toEqual({ label: 'B1 (Ch 41–55)', min: 41, max: 55, levelName: 'B1' });
      expect(CEFR_CURRICULUM_BANDS['B1+']).toEqual({ label: 'B1+ (Ch 56–70)', min: 56, max: 70, levelName: 'B1+' });
    });

    it('matches chapters to appropriate CEFR bands', () => {
      expect(matchesCefrBand(10, 'A1')).toBe(true);
      expect(matchesCefrBand(22, 'A1+')).toBe(true);
      expect(matchesCefrBand(30, 'A2')).toBe(true);
      expect(matchesCefrBand(50, 'B1')).toBe(true);
      expect(matchesCefrBand(60, 'B1+')).toBe(true);
      expect(matchesCefrBand(10, 'all')).toBe(true);
      expect(matchesCefrBand(30, 'A1')).toBe(false);
    });

    it('calculates reading footprint metrics correctly', () => {
      const footprint = getReadingFootprint(203, 12);
      expect(footprint.wordCount).toBe(203);
      expect(footprint.chapterCount).toBe(12);
      expect(footprint.label).toBe('203 words from your reading · 12 chapters in Rome');

      const day1Footprint = getReadingFootprint(1, 1);
      expect(day1Footprint.label).toBe('1 word from your reading · 1 chapter in Rome');
    });

    it('groups words and phrases chronologically with section titles', () => {
      const phrases = [...NOTEBOOK_PHRASES];
      const sections = groupPhrasesByChronology(phrases);
      expect(sections.length).toBeGreaterThanOrEqual(1);
      expect(sections[0].items[0].chapterNumber).toBeGreaterThanOrEqual(
        sections[sections.length - 1].items[sections[sections.length - 1].items.length - 1].chapterNumber,
      );
    });
  });

  describe('Grammar insights data integrity', () => {
    it('contains dual-provenance fields and valid formulas', () => {
      expect(NOTEBOOK_GRAMMAR_INSIGHTS.length).toBeGreaterThanOrEqual(3);
      for (const insight of NOTEBOOK_GRAMMAR_INSIGHTS) {
        expect(insight.id).toBeDefined();
        expect(insight.category).toBeDefined();
        expect(insight.titleIt).toBeDefined();
        expect(insight.formula).toBeDefined();
        expect(insight.exampleIt).toBeDefined();
        expect(insight.firstEncounterChapterNumber).toBeGreaterThan(0);
        expect(insight.lessonChapterNumber).toBeGreaterThan(0);
        expect(insight.sampleChapterNumber).toBeGreaterThan(0);
      }
    });
  });

  describe('Verb patterns data integrity', () => {
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
