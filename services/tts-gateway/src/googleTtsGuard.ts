import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { googleTtsConfigured } from './env';
import { audioCacheKey } from './cacheKey';
import type { TTSProviderId, TTSSpeed } from './types';

export const PAID_USAGE_CONFIRMATION = 'I UNDERSTAND AND AUTHORIZE PAID TTS';

export function runtimeGuardInputs(env: NodeJS.Dict<string | undefined> = process.env, now = new Date()) {
  const limit = parseHardLimit(env.GOOGLE_TTS_HARD_LIMIT_CHARS);
  const ledger = loadUsageLedger();
  return {
    pricing: loadPricingFile(),
    hardLimitChars: limit.ok ? limit.chars : null,
    trackedUsage: trackedUsageForPeriod(ledger, billingPeriodUtc(now)),
    providerConfigured: googleTtsConfigured(env),
    now,
  };
}

export type VoiceFamilyId = 'chirp3-hd' | 'neural2' | 'wavenet' | 'studio' | 'standard';

export type PricingFamily = {
  id: VoiceFamilyId;
  label: string;
  voiceIdIncludes: string[];
  freeAllowanceChars: number;
  pricePerMillionChars: number;
};

export type PricingFile = {
  provider: 'google';
  currency: string;
  source: string;
  sourceRetrieved: string;
  effectiveDate: string;
  staleAfter: string;
  characterCounting: {
    mode: string;
    billedField: string;
    includesWhitespaceAndPunctuation: boolean;
    ssmlTagsCounted: boolean;
    notes: string;
  };
  failedRequests: { localLedger: string; notes: string };
  readerPlayback: {
    generationRate: number;
    naturalPlaybackRate: number;
    slowPlaybackRate: number;
    sentenceGapMs: number;
  };
  paidUsageConfirmation: string;
  families: Record<string, PricingFamily>;
};

export type UsagePeriod = {
  billingPeriod: string;
  provider: 'google';
  modelFamily: string;
  charactersGenerated: number;
  generationCount: number;
  lastUpdated: string | null;
};

export type UsageLedger = {
  provider: 'google';
  periods: Record<string, UsagePeriod>;
};

export type ExistingAssetLike = {
  provider?: string;
  voiceId?: string;
  language?: string;
  speed?: string;
  text?: string;
  generationVersion?: number;
  cacheKey?: string;
  status?: string;
};

export type PlannedGeneration = {
  storyId: string;
  chapterId: string;
  chapterNumber?: number;
  sentenceId: string;
  logicalVoice: string;
  googleVoiceId: string;
  language: 'it-IT';
  text: string;
  generationSpeed: TTSSpeed;
  generationVersion: number;
  outputFilename: string;
  estimatedBillableCharacters: number;
  action: 'generate' | 'reuse-google';
};

export type GuardFailureCode =
  | 'missing_pricing'
  | 'stale_pricing'
  | 'missing_hard_limit'
  | 'missing_usage'
  | 'missing_provider'
  | 'missing_character_count'
  | 'missing_google_voice'
  | 'unknown_voice_family'
  | 'mixed_voice_families'
  | 'over_hard_limit'
  | 'paid_override_unconfirmed'
  | 'manifest_incomplete';

export type GuardEvaluation = {
  allowed: boolean;
  dryRun: boolean;
  code?: GuardFailureCode;
  error?: string;
  trackedUsage: number;
  plannedCharacters: number;
  projectedUsage: number;
  hardLimitChars: number;
  freeAllowanceChars: number;
  projectedFreeRemaining: number;
  estimatedBillableOverFree: number;
  estimatedChargeUsd: number;
  currency: string;
  familyId?: VoiceFamilyId;
  generateCount: number;
  reuseGoogleCount: number;
  elevenLabsExistingCount: number;
  missingCount: number;
  suggestedBatches: { label: string; chapterFrom: number; chapterTo: number; characters: number }[];
  summary: string;
};

const HERE = dirname(fileURLToPath(import.meta.url));
export const PRICING_CONFIG_PATH = join(HERE, '..', 'config', 'google-tts-pricing.json');
export const USAGE_LEDGER_PATH = join(HERE, '..', 'data', 'google-tts-usage.json');
export const GENERATION_LOG_PATH = join(HERE, '..', 'data', 'google-tts-generation.jsonl');

let googleApiPermit: { remainingChars: number; allowPaid: boolean } | null = null;

export function googleApiPermitActive(): boolean {
  return googleApiPermit != null;
}

export function countBillableCharacters(text: unknown): { ok: true; chars: number } | { ok: false; error: string } {
  if (typeof text !== 'string') {
    return { ok: false, error: 'Character count cannot be calculated: text is not a string.' };
  }
  return { ok: true, chars: Array.from(text).length };
}

export function billingPeriodUtc(now: Date): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function loadPricingFile(path = PRICING_CONFIG_PATH): PricingFile | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as PricingFile;
  } catch {
    return null;
  }
}

export function pricingFresh(pricing: PricingFile, now: Date): boolean {
  const stale = Date.parse(`${pricing.staleAfter}T00:00:00Z`);
  if (!Number.isFinite(stale)) return false;
  return now.getTime() <= stale;
}

export function resolveVoiceFamily(
  voiceId: string,
  pricing: PricingFile,
): { ok: true; family: PricingFamily } | { ok: false; error: string } {
  if (!voiceId?.trim()) {
    return { ok: false, error: 'The requested voice cannot be mapped to a Google voice (empty voice id).' };
  }
  const matches = Object.values(pricing.families).filter((family) =>
    family.voiceIdIncludes.some((token) => voiceId.includes(token)),
  );
  if (matches.length !== 1) {
    return {
      ok: false,
      error: `Google pricing tier cannot be identified for voice "${voiceId}". Guard is fail-closed until the family is listed in google-tts-pricing.json.`,
    };
  }
  return { ok: true, family: matches[0] };
}

export function parseHardLimit(raw: string | undefined): { ok: true; chars: number } | { ok: false; error: string } {
  if (raw == null || String(raw).trim() === '') {
    return {
      ok: false,
      error: 'Budget/limit configuration is missing. Set GOOGLE_TTS_HARD_LIMIT_CHARS (characters). No Google TTS requests were made.',
    };
  }
  const chars = Number(String(raw).trim());
  if (!Number.isInteger(chars) || chars < 0) {
    return {
      ok: false,
      error: `GOOGLE_TTS_HARD_LIMIT_CHARS must be a non-negative integer. Got "${raw}". No Google TTS requests were made.`,
    };
  }
  return { ok: true, chars };
}

export function loadUsageLedger(path = USAGE_LEDGER_PATH): UsageLedger | null {
  if (!existsSync(path)) return null;
  try {
    const data = JSON.parse(readFileSync(path, 'utf8')) as UsageLedger;
    if (data?.provider !== 'google' || !data.periods || typeof data.periods !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

export function trackedUsageForPeriod(ledger: UsageLedger | null, period: string): number | null {
  if (!ledger) return null;
  const row = ledger.periods[period];
  if (!row) return 0;
  if (!Number.isFinite(row.charactersGenerated)) return null;
  return row.charactersGenerated;
}

export function recordSuccessfulGeneration(input: {
  characters: number;
  familyId: string;
  now?: Date;
  ledgerPath?: string;
}): UsagePeriod {
  const now = input.now ?? new Date();
  const period = billingPeriodUtc(now);
  const path = input.ledgerPath ?? USAGE_LEDGER_PATH;
  mkdirSync(dirname(path), { recursive: true });
  const ledger = loadUsageLedger(path) ?? { provider: 'google', periods: {} };
  const prev = ledger.periods[period] ?? {
    billingPeriod: period,
    provider: 'google' as const,
    modelFamily: input.familyId,
    charactersGenerated: 0,
    generationCount: 0,
    lastUpdated: null,
  };
  const next: UsagePeriod = {
    ...prev,
    modelFamily: input.familyId,
    charactersGenerated: prev.charactersGenerated + input.characters,
    generationCount: prev.generationCount + 1,
    lastUpdated: now.toISOString(),
  };
  ledger.periods[period] = next;
  writeFileSync(path, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
  return next;
}

export function logSuccessfulGeneration(entry: {
  timestamp: string;
  provider: 'google';
  voiceId: string;
  logicalVoice?: string;
  sentenceId?: string;
  characterCount: number;
  generationResult: 'success';
  outputAsset?: string;
  generationVersion: number;
  logPath?: string;
}): void {
  const path = entry.logPath ?? GENERATION_LOG_PATH;
  mkdirSync(dirname(path), { recursive: true });
  const line = JSON.stringify({
    timestamp: entry.timestamp,
    provider: entry.provider,
    voiceId: entry.voiceId,
    logicalVoice: entry.logicalVoice ?? null,
    sentenceId: entry.sentenceId ?? null,
    characterCount: entry.characterCount,
    generationResult: entry.generationResult,
    outputAsset: entry.outputAsset ?? null,
    generationVersion: entry.generationVersion,
  });
  appendFileSync(path, `${line}\n`, 'utf8');
}

export function assetSatisfiesGoogleTarget(
  asset: ExistingAssetLike | undefined,
  target: {
    provider: TTSProviderId;
    voiceId: string;
    language: string;
    speed: TTSSpeed;
    text: string;
    generationVersion: number;
  },
): 'google-match' | 'elevenlabs' | 'other' | 'none' {
  if (!asset) return 'none';
  if (asset.provider === 'elevenlabs') return 'elevenlabs';
  if (asset.provider !== 'google') return asset.provider ? 'other' : 'none';
  const key = audioCacheKey({
    provider: 'google',
    voiceId: target.voiceId,
    language: target.language as 'it-IT',
    speed: target.speed,
    text: target.text,
    generationVersion: target.generationVersion,
  });
  const sameFingerprint =
    asset.cacheKey === key ||
    (asset.voiceId === target.voiceId &&
      asset.language === target.language &&
      asset.speed === target.speed &&
      asset.generationVersion === target.generationVersion &&
      (asset.text ?? '').normalize('NFC').trim() === target.text.normalize('NFC').trim());
  if (sameFingerprint && asset.status !== 'failed') return 'google-match';
  return 'other';
}

export function classifyExistingAssets(
  assets: ExistingAssetLike[],
  target: {
    voiceId: string;
    language: string;
    speed: TTSSpeed;
    text: string;
    generationVersion: number;
  },
): { action: 'generate' | 'reuse-google'; elevenLabsHit: boolean } {
  let elevenLabsHit = false;
  for (const asset of assets) {
    const kind = assetSatisfiesGoogleTarget(asset, { ...target, provider: 'google' });
    if (kind === 'google-match') return { action: 'reuse-google', elevenLabsHit };
    if (kind === 'elevenlabs') elevenLabsHit = true;
  }
  return { action: 'generate', elevenLabsHit };
}

function formatBlocked(parts: {
  tracked: number;
  requested: number;
  projected: number;
  limit: number;
}): string {
  return [
    'GENERATION BLOCKED',
    '',
    `Tracked usage: ${parts.tracked.toLocaleString('en-US')} characters`,
    `Requested batch: ${parts.requested.toLocaleString('en-US')} characters`,
    `Projected usage: ${parts.projected.toLocaleString('en-US')} characters`,
    `Configured hard limit: ${parts.limit.toLocaleString('en-US')} characters`,
    '',
    'No Google TTS requests were made.',
  ].join('\n');
}

export function suggestSafeBatches(
  items: { chapterNumber: number; estimatedBillableCharacters: number }[],
  remainingChars: number,
): GuardEvaluation['suggestedBatches'] {
  const byChapter = new Map<number, number>();
  for (const item of items) {
    byChapter.set(item.chapterNumber, (byChapter.get(item.chapterNumber) ?? 0) + item.estimatedBillableCharacters);
  }
  const chapters = [...byChapter.keys()].sort((a, b) => a - b);
  const batches: GuardEvaluation['suggestedBatches'] = [];
  let start = chapters[0];
  let end = chapters[0];
  let acc = 0;
  let index = 1;
  for (const ch of chapters) {
    const chars = byChapter.get(ch) ?? 0;
    if (chars > remainingChars) {
      if (acc > 0) {
        batches.push({
          label: `Batch ${index}: Chapters ${start}–${end}`,
          chapterFrom: start,
          chapterTo: end,
          characters: acc,
        });
        index += 1;
        acc = 0;
      }
      batches.push({
        label: `Batch ${index}: Chapter ${ch} (exceeds remaining budget alone)`,
        chapterFrom: ch,
        chapterTo: ch,
        characters: chars,
      });
      index += 1;
      start = ch + 1;
      end = ch + 1;
      continue;
    }
    if (acc > 0 && acc + chars > remainingChars) {
      batches.push({
        label: `Batch ${index}: Chapters ${start}–${end}`,
        chapterFrom: start,
        chapterTo: end,
        characters: acc,
      });
      index += 1;
      start = ch;
      acc = 0;
    }
    if (acc === 0) start = ch;
    end = ch;
    acc += chars;
  }
  if (acc > 0 && start != null) {
    batches.push({
      label: `Batch ${index}: Chapters ${start}–${end}`,
      chapterFrom: start,
      chapterTo: end,
      characters: acc,
    });
  }
  return batches;
}

export type EvaluateGuardInput = {
  planned: PlannedGeneration[];
  pricing: PricingFile | null;
  hardLimitChars: number | null;
  trackedUsage: number | null;
  providerConfigured: boolean;
  now: Date;
  dryRun?: boolean;
  allowPaidUsage?: boolean;
  paidUsageConfirmation?: string | null;
  elevenLabsExistingCount?: number;
  missingCount?: number;
};

export function evaluateGoogleTtsGuard(input: EvaluateGuardInput): GuardEvaluation {
  const dryRun = Boolean(input.dryRun);
  const fail = (code: GuardFailureCode, error: string, extra: Partial<GuardEvaluation> = {}): GuardEvaluation => ({
    allowed: false,
    dryRun,
    code,
    error,
    trackedUsage: extra.trackedUsage ?? (input.trackedUsage ?? 0),
    plannedCharacters: extra.plannedCharacters ?? 0,
    projectedUsage: extra.projectedUsage ?? 0,
    hardLimitChars: extra.hardLimitChars ?? (input.hardLimitChars ?? 0),
    freeAllowanceChars: extra.freeAllowanceChars ?? 0,
    projectedFreeRemaining: extra.projectedFreeRemaining ?? 0,
    estimatedBillableOverFree: extra.estimatedBillableOverFree ?? 0,
    estimatedChargeUsd: extra.estimatedChargeUsd ?? 0,
    currency: extra.currency ?? 'USD',
    generateCount: extra.generateCount ?? 0,
    reuseGoogleCount: extra.reuseGoogleCount ?? 0,
    elevenLabsExistingCount: extra.elevenLabsExistingCount ?? (input.elevenLabsExistingCount ?? 0),
    missingCount: extra.missingCount ?? (input.missingCount ?? 0),
    suggestedBatches: extra.suggestedBatches ?? [],
    summary: extra.summary ?? error,
  });

  if (!input.providerConfigured) {
    return fail(
      'missing_provider',
      'Google provider configuration is missing. Run gcloud auth application-default login and set GOOGLE_CLOUD_PROJECT. No Google TTS requests were made.',
    );
  }
  if (!input.pricing || input.pricing.provider !== 'google' || !input.pricing.families) {
    return fail(
      'missing_pricing',
      'Google pricing configuration is missing or unreadable. Guard is fail-closed. No Google TTS requests were made.',
    );
  }
  if (!pricingFresh(input.pricing, input.now)) {
    return fail(
      'stale_pricing',
      `Google pricing configuration is stale (staleAfter ${input.pricing.staleAfter}). Re-verify ${input.pricing.source} and update google-tts-pricing.json. No Google TTS requests were made.`,
    );
  }
  if (input.hardLimitChars == null || !Number.isFinite(input.hardLimitChars)) {
    return fail(
      'missing_hard_limit',
      'Budget/limit configuration is missing. Set GOOGLE_TTS_HARD_LIMIT_CHARS. No Google TTS requests were made.',
    );
  }
  if (input.trackedUsage == null || !Number.isFinite(input.trackedUsage)) {
    return fail(
      'missing_usage',
      'Monthly usage state cannot be read. Check services/tts-gateway/data/google-tts-usage.json. No Google TTS requests were made.',
    );
  }
  if (!Array.isArray(input.planned)) {
    return fail('manifest_incomplete', 'A generation manifest cannot be produced. No Google TTS requests were made.');
  }

  const generate = input.planned.filter((row) => row.action === 'generate');
  const reuse = input.planned.filter((row) => row.action === 'reuse-google');
  let plannedCharacters = 0;
  const families = new Set<string>();
  for (const row of generate) {
    const counted = countBillableCharacters(row.text);
    if (!counted.ok) {
      return fail('missing_character_count', counted.error);
    }
    if (row.estimatedBillableCharacters !== counted.chars) {
      return fail(
        'missing_character_count',
        `Character count mismatch for ${row.chapterId}:${row.sentenceId} (manifest ${row.estimatedBillableCharacters} vs calculated ${counted.chars}).`,
      );
    }
    if (!row.googleVoiceId) {
      return fail(
        'missing_google_voice',
        `The requested voice cannot be mapped to a Google voice (${row.logicalVoice} / ${row.chapterId}:${row.sentenceId}).`,
      );
    }
    const family = resolveVoiceFamily(row.googleVoiceId, input.pricing);
    if (!family.ok) return fail('unknown_voice_family', family.error);
    families.add(family.family.id);
    plannedCharacters += counted.chars;
  }

  if (generate.length > 0 && families.size !== 1) {
    return fail(
      'mixed_voice_families',
      'Google pricing tier cannot be identified for this batch (mixed or empty voice families). Guard is fail-closed.',
    );
  }

  if (generate.length === 0) {
    return {
      allowed: true,
      dryRun,
      trackedUsage: input.trackedUsage,
      plannedCharacters: 0,
      projectedUsage: input.trackedUsage,
      hardLimitChars: input.hardLimitChars,
      freeAllowanceChars: 0,
      projectedFreeRemaining: 0,
      estimatedBillableOverFree: 0,
      estimatedChargeUsd: 0,
      currency: input.pricing.currency,
      generateCount: 0,
      reuseGoogleCount: reuse.length,
      elevenLabsExistingCount: input.elevenLabsExistingCount ?? 0,
      missingCount: 0,
      suggestedBatches: [],
      summary: 'RESULT: SAFE TO GENERATE',
    };
  }

  const familyId = resolveVoiceFamily(generate[0].googleVoiceId, input.pricing);
  if (!familyId.ok) {
    return fail('unknown_voice_family', familyId.error);
  }
  const family = familyId.family;
  const tracked = input.trackedUsage;
  const projected = tracked + plannedCharacters;
  const hardLimit = input.hardLimitChars;
  const freeAllowance = family.freeAllowanceChars;
  const overFree = Math.max(0, projected - freeAllowance);
  const estimatedChargeUsd = (overFree / 1_000_000) * family.pricePerMillionChars;
  const remaining = hardLimit - tracked;
  const suggestedBatches = suggestSafeBatches(
    generate.map((row) => ({
      chapterNumber: row.chapterNumber ?? 0,
      estimatedBillableCharacters: row.estimatedBillableCharacters,
    })),
    Math.max(0, remaining),
  );

  const overHard = projected > hardLimit;
  if (overHard) {
    const blocked = formatBlocked({
      tracked,
      requested: plannedCharacters,
      projected,
      limit: hardLimit,
    });
    const suggestion =
      suggestedBatches.length > 0
        ? `\n\nThis batch exceeds the configured limit.\n\nSuggested safe batches:\n${suggestedBatches.map((b) => b.label).join('\n')}`
        : '';
    if (!input.allowPaidUsage) {
      return fail('over_hard_limit', blocked + suggestion, {
        trackedUsage: tracked,
        plannedCharacters,
        projectedUsage: projected,
        hardLimitChars: hardLimit,
        freeAllowanceChars: freeAllowance,
        projectedFreeRemaining: Math.max(0, freeAllowance - projected),
        estimatedBillableOverFree: overFree,
        estimatedChargeUsd,
        currency: input.pricing.currency,
        familyId: family.id,
        generateCount: generate.length,
        reuseGoogleCount: reuse.length,
        suggestedBatches,
      });
    }
    if (input.paidUsageConfirmation !== input.pricing.paidUsageConfirmation) {
      const warning = [
        'WARNING',
        '',
        'This generation may exceed the configured free/safe Google TTS allowance.',
        '',
        `Projected characters: ${projected.toLocaleString('en-US')}`,
        `Configured safe limit: ${hardLimit.toLocaleString('en-US')}`,
        `Estimated potentially billable characters: ${overFree.toLocaleString('en-US')}`,
        '',
        'This may create Google Cloud charges.',
        '',
        'Type:',
        PAID_USAGE_CONFIRMATION,
        '',
        'to continue.',
        '',
        'No Google TTS requests were made.',
      ].join('\n');
      return fail('paid_override_unconfirmed', warning, {
        trackedUsage: tracked,
        plannedCharacters,
        projectedUsage: projected,
        hardLimitChars: hardLimit,
        freeAllowanceChars: freeAllowance,
        projectedFreeRemaining: Math.max(0, freeAllowance - projected),
        estimatedBillableOverFree: overFree,
        estimatedChargeUsd,
        currency: input.pricing.currency,
        familyId: family.id,
        generateCount: generate.length,
        reuseGoogleCount: reuse.length,
        suggestedBatches,
      });
    }
  }

  const evaluation: GuardEvaluation = {
    allowed: true,
    dryRun,
    trackedUsage: tracked,
    plannedCharacters,
    projectedUsage: projected,
    hardLimitChars: hardLimit,
    freeAllowanceChars: freeAllowance,
    projectedFreeRemaining: Math.max(0, freeAllowance - projected),
    estimatedBillableOverFree: overFree,
    estimatedChargeUsd,
    currency: input.pricing.currency,
    familyId: family.id,
    generateCount: generate.length,
    reuseGoogleCount: reuse.length,
    elevenLabsExistingCount: input.elevenLabsExistingCount ?? 0,
    missingCount: input.missingCount ?? generate.filter((row) => row.action === 'generate').length,
    suggestedBatches,
    summary: overHard
      ? 'PAID OVERRIDE AUTHORIZED — still display projected usage and estimated cost.'
      : 'RESULT: SAFE TO GENERATE',
  };
  return evaluation;
}

export function formatPreflightReport(input: {
  evaluation: GuardEvaluation;
  pricing: PricingFile;
  title?: string;
  dryRun?: boolean;
  targetLabel?: string;
}): string {
  const e = input.evaluation;
  const p = input.pricing.readerPlayback;
  const heading = input.dryRun ? 'GOOGLE TTS DRY RUN' : 'GOOGLE TTS PRE-FLIGHT';
  const lines = [
    heading,
    '',
    input.targetLabel ? `Target: ${input.targetLabel}` : null,
    'Provider: Google Cloud Text-to-Speech',
    `Generation rate: ${p.generationRate.toFixed(1)}x`,
    `Reader Natural playback: ${p.naturalPlaybackRate}x`,
    `Reader Slow playback: ${p.slowPlaybackRate}x`,
    `Sentence gap: ${p.sentenceGapMs} ms`,
    '',
    input.dryRun
      ? `Existing Google clips: ${e.reuseGoogleCount}`
      : `Files to generate: ${e.generateCount.toLocaleString('en-US')}`,
    input.dryRun ? `Existing ElevenLabs clips: ${e.elevenLabsExistingCount}` : null,
    input.dryRun ? `Missing clips: ${e.missingCount}` : null,
    input.dryRun
      ? `Total Google generations required: ${e.generateCount.toLocaleString('en-US')}`
      : `Characters to generate: ${e.plannedCharacters.toLocaleString('en-US')}`,
    '',
    input.dryRun ? `Characters: ${e.plannedCharacters.toLocaleString('en-US')}` : null,
    input.dryRun
      ? `Tracked monthly usage: ${e.trackedUsage.toLocaleString('en-US')}`
      : `Google free allowance configured: ${e.freeAllowanceChars.toLocaleString('en-US')} characters`,
    input.dryRun ? `Projected usage: ${e.projectedUsage.toLocaleString('en-US')}` : `Tracked usage this period: ${e.trackedUsage.toLocaleString('en-US')}`,
    input.dryRun
      ? `Hard limit: ${e.hardLimitChars.toLocaleString('en-US')}`
      : `Projected usage after batch: ${e.projectedUsage.toLocaleString('en-US')}`,
    input.dryRun ? null : '',
    input.dryRun
      ? null
      : `Projected free allowance remaining: ${e.projectedFreeRemaining.toLocaleString('en-US')}`,
    `Estimated API charge: $${e.estimatedChargeUsd.toFixed(2)}`,
    'Estimated cost — not a Google billing statement.',
    '',
    e.allowed ? e.summary : e.error,
    '',
    'No audio has been generated yet.',
    input.dryRun ? 'No API requests made.' : null,
    input.dryRun ? 'No audio files generated.' : null,
  ];
  return lines.filter((line) => line != null).join('\n');
}

export function openGoogleApiPermit(evaluation: GuardEvaluation): void {
  if (!evaluation.allowed) {
    throw new Error(evaluation.error ?? 'GENERATION BLOCKED');
  }
  googleApiPermit = {
    remainingChars: evaluation.plannedCharacters,
    allowPaid: evaluation.projectedUsage > evaluation.hardLimitChars,
  };
}

export function consumeGoogleApiPermit(chars: number): void {
  if (!googleApiPermit) {
    throw new Error(
      'GENERATION BLOCKED\n\nNo Google TTS preflight permit is active. The cost guard must run before the first API call.\nNo Google TTS requests were made.',
    );
  }
  if (chars > googleApiPermit.remainingChars) {
    throw new Error(
      `GENERATION BLOCKED\n\nPermit remaining ${googleApiPermit.remainingChars} characters, request ${chars}.\nNo further Google TTS requests were made.`,
    );
  }
  googleApiPermit.remainingChars -= chars;
}

export function closeGoogleApiPermit(): void {
  googleApiPermit = null;
}

export async function withGoogleApiPermit<T>(evaluation: GuardEvaluation, fn: () => Promise<T>): Promise<T> {
  openGoogleApiPermit(evaluation);
  try {
    return await fn();
  } finally {
    closeGoogleApiPermit();
  }
}

export function assertGoogleGeneratePermitted(text: string): number {
  const counted = countBillableCharacters(text);
  if (!counted.ok) throw new Error(counted.error);
  consumeGoogleApiPermit(counted.chars);
  return counted.chars;
}
