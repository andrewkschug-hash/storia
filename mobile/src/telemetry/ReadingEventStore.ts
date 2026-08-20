import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ReadingEvent, RecordReadingEventInput } from '@/src/telemetry/types';

const KEY = 'storia:reading-events';
const MAX_EVENTS = 8000;

let memoryStore: ReadingEvent[] | null = null;
let diskCache: ReadingEvent[] | null = null;

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function __setReadingEventsForTests(events: ReadingEvent[] | null) {
  memoryStore = events;
  diskCache = events;
}

async function readAll(): Promise<ReadingEvent[]> {
  if (memoryStore) return memoryStore;
  if (diskCache) return diskCache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      diskCache = [];
      return diskCache;
    }
    const parsed = JSON.parse(raw) as ReadingEvent[];
    diskCache = Array.isArray(parsed) ? parsed : [];
    return diskCache;
  } catch {
    diskCache = [];
    return diskCache;
  }
}

async function writeAll(events: ReadingEvent[]) {
  const trimmed = events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events;
  diskCache = trimmed;
  if (memoryStore) {
    memoryStore = trimmed;
    return;
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
}

export async function listReadingEvents(): Promise<ReadingEvent[]> {
  return readAll();
}

export async function recordReadingEvent(input: RecordReadingEventInput): Promise<ReadingEvent> {
  const event: ReadingEvent = {
    ...input,
    id: newId(),
    at: input.at ?? new Date().toISOString(),
  };
  const all = await readAll();
  all.push(event);
  await writeAll(all);
  return event;
}

/** Fire-and-forget. Never throws into UI. */
export function trackReadingEvent(input: RecordReadingEventInput): void {
  void recordReadingEvent(input).catch(() => undefined);
}
