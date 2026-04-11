const STORAGE_KEY = 'chaarchaal:v1:items';

export function loadPersisted<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function savePersisted<T>(data: T): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
