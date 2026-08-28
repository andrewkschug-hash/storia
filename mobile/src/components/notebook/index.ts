export {
  NotebookTabs,
  type NotebookTab,
  type NotebookTabCounts,
  NOTEBOOK_TABS,
  NOTEBOOK_TAB_CONFIG,
} from './NotebookTabs';

export { NotebookHeader } from './NotebookHeader';
export { NotebookReviewStrip } from './NotebookReviewStrip';
export { NotebookToolbar } from './NotebookToolbar';
export { NotebookFilterSheet } from './NotebookFilterSheet';
export { NotebookEmptyState } from './NotebookEmptyState';
export { WordEntry } from './WordEntry';
export { VerbDetailSheet } from './VerbDetailSheet';
export { PhraseEntry } from './PhraseEntry';
export { GrammarEntry } from './GrammarEntry';
export { GrammarDetailModal } from './GrammarDetailModal';

// Retain legacy components for any test or legacy callers
export { GrammarInsightsCarousel } from './GrammarInsightsCarousel';
export { PhrasesSpotlightCarousel } from './PhrasesSpotlightCarousel';
export { VerbDetailCard, type VerbTense, type VerbViewMode } from './VerbDetailCard';
