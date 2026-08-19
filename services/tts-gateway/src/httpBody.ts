import type { IncomingMessage } from 'node:http';

import { MAX_REQUEST_BODY_BYTES, requestBodyTooLargeMessage } from './requestLimits';

export async function readJsonBody(req: IncomingMessage, maxBytes = MAX_REQUEST_BODY_BYTES): Promise<unknown> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error(requestBodyTooLargeMessage(maxBytes));
    }
    chunks.push(Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}
