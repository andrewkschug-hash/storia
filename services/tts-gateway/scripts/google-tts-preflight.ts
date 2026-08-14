/**
 * Google TTS cost-guard preflight. Builds a full generation manifest and makes
 * zero Google API calls.
 *
 *   npx tsx services/tts-gateway/scripts/google-tts-preflight.ts --target=a1 --from=1 --to=20 --dry-run
 *   npx tsx services/tts-gateway/scripts/google-tts-preflight.ts --target=a1plus --from=21 --to=24 --dry-run
 */
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { googleTtsConfigured, loadGatewayEnv } from '../src/env';
import {
  evaluateGoogleTtsGuard,
  formatPreflightReport,
  loadPricingFile,
  runtimeGuardInputs,
} from '../src/googleTtsGuard';
import { collectLucaGooglePlan, type LucaAudioTarget } from '../src/googleTtsPlan';

loadGatewayEnv();

function parseArgs(argv: string[]) {
  let from: number | null = null;
  let to: number | null = null;
  let target: LucaAudioTarget = 'a1';
  let dryRun = true;
  let generate = false;
  let allowPaidUsage = false;
  for (const arg of argv) {
    if (arg === '--dry-run' || arg === '--preflight') dryRun = true;
    else if (arg === '--generate') {
      generate = true;
      dryRun = false;
    } else if (arg === '--allow-paid-usage') allowPaidUsage = true;
    else if (arg === '--target=a2') target = 'a2';
    else if (arg === '--target=a1plus' || arg === '--target=a1+') target = 'a1plus';
    else if (arg === '--target=a1') target = 'a1';
    else if (arg.startsWith('--chapter=')) {
      const n = Number(arg.slice('--chapter='.length));
      from = n;
      to = n;
    } else if (arg.startsWith('--from=')) from = Number(arg.slice('--from='.length));
    else if (arg.startsWith('--to=')) to = Number(arg.slice('--to='.length));
  }
  if (from == null) from = target === 'a1' ? 1 : 21;
  if (to == null) to = target === 'a1' ? 20 : target === 'a1plus' ? 24 : 40;
  return { from, to, target, dryRun: generate ? false : dryRun, generate, allowPaidUsage };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const plan = collectLucaGooglePlan({
    from: args.from,
    to: args.to,
    target: args.target,
  });
  const runtime = runtimeGuardInputs();
  const pricing = loadPricingFile();
  const mapped = plan.planned.filter((row) => row.googleVoiceId);

  let confirmation: string | null = null;
  if (args.allowPaidUsage && args.generate && !args.dryRun) {
    const rl = createInterface({ input, output });
    console.log('\nType the paid-usage confirmation phrase to continue, or anything else to abort.\n');
    confirmation = (await rl.question('> ')).trim();
    await rl.close();
  }

  const evaluation = evaluateGoogleTtsGuard({
    planned: mapped,
    pricing: runtime.pricing,
    hardLimitChars: runtime.hardLimitChars,
    trackedUsage: runtime.trackedUsage,
    providerConfigured: googleTtsConfigured() || Boolean(runtime.providerConfigured),
    now: runtime.now,
    dryRun: !args.generate,
    allowPaidUsage: args.allowPaidUsage,
    paidUsageConfirmation: confirmation,
    elevenLabsExistingCount: plan.elevenLabsExistingCount,
    missingCount: plan.missingCount,
  });

  const targetLabel =
    args.target === 'a1'
      ? `Luca A1 Chapters ${args.from}–${args.to}`
      : args.target === 'a1plus'
        ? `Luca A1+ Chapters ${args.from}–${args.to}`
        : `Luca A2 Chapters ${args.from}–${args.to}`;

  if (!pricing) {
    console.error(evaluation.error ?? 'Google pricing configuration is missing.');
    process.exit(1);
  }

  console.log(
    formatPreflightReport({
      evaluation,
      pricing,
      dryRun: !args.generate,
      targetLabel,
    }),
  );

  if (plan.mappingErrors.length) {
    console.error('\nGENERATION BLOCKED');
    console.error(`Unmapped Google logical voices: ${plan.mappingErrors.length}`);
    console.error(plan.mappingErrors.slice(0, 15).join('\n'));
    if (plan.mappingErrors.length > 15) {
      console.error(`…and ${plan.mappingErrors.length - 15} more.`);
    }
    console.error('\nNo Google TTS requests were made.');
    console.error('No audio files generated.');
    process.exit(1);
  }

  if (!evaluation.allowed) {
    process.exit(1);
  }

  if (!args.generate) {
    process.exit(0);
  }

  console.error(
    '\n--generate is accepted by this CLI only after a passing guard, but this task forbids launching A1/A1+ library generation from here.\nUse the guarded generate-a1 / generate-a2 scripts later. No Google TTS requests were made.',
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
