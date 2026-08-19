import { listReadingEvents } from '@/src/telemetry/ReadingEventStore';
import type { SelfAssessment } from '@/src/vocabulary/selfAssessment';

export type ActivitySummary = {
  gotIt: number;
  almost: number;
  notYet: number;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function summarizeRecentActivity(
  now: Date = new Date(),
): Promise<ActivitySummary> {
  const events = await listReadingEvents();
  const since = now.getTime() - WEEK_MS;
  const summary: ActivitySummary = { gotIt: 0, almost: 0, notYet: 0 };

  for (const event of events) {
    if (event.type !== 'self_assessment') continue;
    const at = new Date(event.at).getTime();
    if (Number.isNaN(at) || at < since) continue;
    const assessment = event.meta?.assessment;
    if (assessment === 'got_it') summary.gotIt += 1;
    else if (assessment === 'almost') summary.almost += 1;
    else if (assessment === 'not_yet') summary.notYet += 1;
  }

  return summary;
}

export function formatLastAssessmentLabel(
  assessment: SelfAssessment | null,
): string | null {
  if (assessment === 'got_it') return 'Got it';
  if (assessment === 'almost') return 'Almost';
  if (assessment === 'not_yet') return 'Not yet';
  return null;
}
