import { getContentBundle } from '@/src/content';
import { ReviewService } from '@/src/review/ReviewService';

let service: ReviewService | null = null;

export function getReviewService(): ReviewService {
  if (!service) {
    service = new ReviewService(getContentBundle());
  }
  return service;
}

/** @internal tests */
export function __resetReviewService() {
  service = null;
}

export { ReviewService, REVIEW_CONFIG } from '@/src/review/ReviewService';
export type {
  HomeReviewCopy,
  ReviewCandidate,
  ReviewContext,
  ReviewPrompt,
  ReviewSession,
} from '@/src/review/ReviewService';
