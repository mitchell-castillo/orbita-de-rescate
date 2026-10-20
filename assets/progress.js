/** Versioned, per-game browser storage. Never sends player data to a server. */
export const STORAGE_VERSION = 1;
export function emptyProgress() {
  return { version: STORAGE_VERSION, currentLevel: 0, completed: {}, run: null, updatedAt: null };
}
export function normalizeProgress(value, levelCount = 6) {
  const clean = emptyProgress();
  if (!value || typeof value !== 'object' || value.version !== STORAGE_VERSION) return clean;
  if (value.completed && typeof value.completed === 'object') {
    for (const [key, result] of Object.entries(value.completed)) {
      const index = Number(key);
      if (Number.isInteger(index) && index >= 0 && index < levelCount && result &&
          Number.isInteger(result.bestMoves) && result.bestMoves > 0 && result.bestMoves < 100000) {
        clean.completed[index] = { bestMoves: result.bestMoves };
      }
    }
  }
  const unlocked = firstUnfinished(clean.completed, levelCount);
  clean.currentLevel = Number.isInteger(value.currentLevel) ? Math.min(Math.max(0, value.currentLevel), unlocked) : 0;
  clean.run = value.run && typeof value.run === 'object' ? value.run : null;
  clean.updatedAt = typeof value.updatedAt === 'string' ? value.updatedAt : null;
  return clean;
}
export function firstUnfinished(completed, levelCount = 6) {
  for (let i = 0; i < levelCount; i++) if (!completed[i]) return i;
  return levelCount - 1;
}
export function readProgress(key, storage, levelCount = 6) {
  let raw;
  try { raw = (storage ?? globalThis.localStorage).getItem(key); }
  catch { return { progress: emptyProgress(), available: false }; }
  try { return { progress: normalizeProgress(JSON.parse(raw), levelCount), available: true }; }
  catch { return { progress: emptyProgress(), available: true }; }
}
export function writeProgress(key, progress, storage) {
  try { (storage ?? globalThis.localStorage).setItem(key, JSON.stringify({ ...progress, version: STORAGE_VERSION, updatedAt: new Date().toISOString() })); return true; }
  catch { return false; }
}
export function completionCount(progress) { return Object.keys(progress.completed).length; }
