export const AVATAR_PRESETS = [
  { id: 'libro', emoji: '📖', label: 'Libro', background: '#3F6B5C' },
  { id: 'sole', emoji: '☀️', label: 'Sole', background: '#C4A574' },
  { id: 'limone', emoji: '🍋', label: 'Limone', background: '#D4BC94' },
  { id: 'mare', emoji: '🌊', label: 'Mare', background: '#4A7C8C' },
  { id: 'caffe', emoji: '☕', label: 'Caffè', background: '#8B5E4A' },
  { id: 'olivo', emoji: '🌿', label: 'Olivo', background: '#5A8F7B' },
  { id: 'roma', emoji: '🏛️', label: 'Roma', background: '#7A6A58' },
  { id: 'arancia', emoji: '🍊', label: 'Arancia', background: '#B87A6B' },
] as const;

export type AvatarId = (typeof AVATAR_PRESETS)[number]['id'];

export type AvatarPreset = (typeof AVATAR_PRESETS)[number];

const AVATAR_IDS = new Set<string>(AVATAR_PRESETS.map((p) => p.id));

export function isAvatarId(value: unknown): value is AvatarId {
  return typeof value === 'string' && AVATAR_IDS.has(value);
}

export function getAvatarPreset(id: AvatarId): AvatarPreset {
  return AVATAR_PRESETS.find((p) => p.id === id) ?? AVATAR_PRESETS[0];
}

/** Stable default so a learner always sees the same picture until they pick one. */
export function defaultAvatarIdForEmail(email: string): AvatarId {
  const s = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PRESETS[hash % AVATAR_PRESETS.length].id;
}
