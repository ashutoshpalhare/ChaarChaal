import { TaskItem } from '../types/taskItem';

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Storage quota exceeded or unavailable:', err);
  }
}

export function exportToCsv(items: TaskItem[]): string {
  const header = ['id', 'title', 'category', 'status', 'metricValue', 'updatedAt'];
  const rows = items.map((item) => [
    item.id,
    `"${item.title.replace(/"/g, '""')}"`,
    item.category,
    item.status,
    String(item.metricValue),
    item.updatedAt,
  ]);
  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
// ChaarChaal update
